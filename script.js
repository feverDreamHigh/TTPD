// Declare a variable to store the songs data
var songs = [];
var numQuestionsAsked = 0; // Initialize counter for the number of questions asked
var totalQuestions = 5; // Total number of questions you want to ask
var numCorrect = 0; // To keep track of correct answers

var questionElement = document.getElementById('question');
var choicesContainer = document.getElementById('choices');
var startButton = document.getElementById('start');
var feedbackElement = document.getElementById('feedback'); // To display feedback

function setImage() {
  var imgContainer = document.getElementById('gameImage');
  imgContainer.innerHTML = '<img src="TTPDlogo.png" alt="TTPD Logo" style="max-width:100%; height:auto;">';
}

// Call this function when you want to display the image, e.g., during game setup
setImage();

// Function to start the game
function startGame() {
  console.log("Starting game");
  numCorrect = 0;
  numQuestionsAsked = 0;
  feedbackElement.innerText = "";
  choicesContainer.innerHTML = '';  // Clear previous choices
  choicesContainer.style.display = 'block'; // Make sure choice buttons are visible
  startButton.innerText = "End Game"; // Change the text to 'End Game'
  startButton.classList.add('button-end-game'); // Add the darker style for end game
  startButton.removeEventListener('click', startGame); // Remove start game listener
  startButton.addEventListener('click', endGame); // Add end game listener

  askQuestion(); // Start the first question
}

function displayLeaderboard() {
    const db = window.db; // Access the database object
    const scoresRef = query(ref(db, 'scores'), orderByChild('score'), limitToLast(10));
    get(scoresRef).then((snapshot) => {
        if (snapshot.exists()) {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.unshift({  // This ensures scores are displayed from highest to lowest
                    name: childSnapshot.val().name,
                    score: childSnapshot.val().score
                });
            });

            let leaderboardContent = '<h3>Leaderboard</h3>';
            scores.forEach((score) => {
                leaderboardContent += `<p>${score.name}: ${score.score}</p>`;
            });
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = leaderboardContent;
            leaderboardDiv.style.display = 'block'; // Ensure the leaderboard is visible
        } else {
            console.log("No scores available");
        }
    }).catch((error) => {
        console.error("Error fetching scores:", error);
    });
}




function updateFeedback(isCorrect, correctTitle) {
    // Immediately clear any previous feedback to ensure visibility changes are noticed
    console.log("Updating feedback...");
    feedbackElement.classList.remove('feedback-visible');
    feedbackElement.innerText = ""; // Clear text immediately

    // Set a timeout to update and show new feedback after the element is cleared
    setTimeout(() => {
        if (isCorrect) {
            feedbackElement.innerText = "Correct!";
        } else {
            // Ensure backticks are used to enable template literals
            feedbackElement.innerText = `Not quite! It was: ${correctTitle}`;
        }
        feedbackElement.classList.add('feedback-visible'); // Re-add visibility class to fade in
        console.log("Feedback updated and made visible.");
    }, 100); // Short delay to allow the feedback to fade out and clear before updating
}

// Function to ask a new question
function askQuestion() {
    console.log("Asking new question. Total asked:", numQuestionsAsked);
    if (numQuestionsAsked >= totalQuestions) {
        console.log("No more questions, ending game.");
        endGame();
        return;
    }

    var randomSongIndex = Math.floor(Math.random() * songs.length);
    var randomSong = songs[randomSongIndex];
    var randomLyricIndex = Math.floor(Math.random() * randomSong.lyrics.length);
    var randomLyric = randomSong.lyrics[randomLyricIndex];

    questionElement.innerText = randomLyric;
    choicesContainer.innerHTML = ''; // Clear existing buttons

    let wrongAnswers = songs.filter((_, index) => index !== randomSongIndex)
        .map(song => song.title)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    let correctIndex = Math.floor(Math.random() * 4);
    let answers = [...wrongAnswers.slice(0, correctIndex), randomSong.title, ...wrongAnswers.slice(correctIndex)];

    answers.forEach(answer => {
        let button = document.createElement('button');
        button.textContent = answer;
        button.className = 'choice';
        button.onclick = function() {
            this.classList.add('button-selected');
            this.disabled = true;  // Disable the button after it's clicked
        
            const isCorrect = this.textContent === randomSong.title;
            if (isCorrect) {
                numCorrect++;
                updateFeedback(isCorrect, randomSong.title); // Show correct feedback
                setTimeout(askQuestion, 1000); // Wait then ask the next question
            } else {
                updateFeedback(isCorrect, randomSong.title); // Show incorrect feedback
                setTimeout(endGame, 1000); // End game after showing feedback
            }
        };
        
        choicesContainer.appendChild(button);
    });

    numQuestionsAsked++; // Increment after setting up the question
}

// Function to end the game
function endGame() {
    console.log("Ending game. Total correct:", numCorrect, "out of", numQuestionsAsked);
    startButton.innerText = "Play Again";
    startButton.removeEventListener('click', endGame);
    startButton.addEventListener('click', startGame);

    questionElement.innerHTML = `Game over! You got ${numCorrect} answers right.`;

    // Disable all buttons and hide them
    Array.from(choicesContainer.children).forEach(button => {
        button.disabled = true;  // Disable buttons to prevent further clicks
        button.style.display = 'none';  // Hide buttons
    });

    displayLeaderboard();  // Call to display the leaderboard

    feedbackElement.innerText = ""; // Clear feedback text
}



// Function to load song data and initialize game settings
function initializeGame() {
    // Load song data
    fetch('songData.json')
        .then(response => response.json())
        .then(data => {
            songs = data;
            console.log("Songs loaded successfully:", songs);
            // Set up the initial event listener for the start button
            startButton.addEventListener('click', startGame);
            console.log("Game is ready to be started.");
        })
        .catch(error => {
            console.error('Error loading the song data:', error);
            feedbackElement.innerText = "Failed to load song data. Check console for details.";
        });
}

function saveScore(score, playerName) {
    const dbRef = firebase.database().ref('scores');
    const newScore = dbRef.push(); // Create a new entry in the 'scores' node
    newScore.set({
        name: playerName,
        score: score
    });
}



// Event listener for when the DOM content has fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);