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
  imgContainer.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/2/24/The_Tortured_Poets_Department_Logo_v2.png" alt="Game Image" style="max-width:100%; height:auto;">';
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

function updateFeedback(isCorrect) {
    // Immediately clear any previous feedback to ensure visibility changes are noticed
    console.log("Updating feedback...");
    feedbackElement.classList.remove('feedback-visible');
    feedbackElement.innerText = ""; // Clear text immediately

    // Set a timeout to update and show new feedback after the element is cleared
    setTimeout(() => {
        feedbackElement.innerText = isCorrect ? "Correct!" : "Incorrect!";
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
            // Remove selected class from all buttons first (if you want to allow changing answers before locking in)
            Array.from(choicesContainer.children).forEach(child => {
                child.classList.remove('button-selected');
                child.disabled = true;  // Optionally disable the button
            });
            
            this.classList.add('button-selected');
            this.disabled = true;
        
            // Determine if the answer is correct and update feedback accordingly
            const isCorrect = this.textContent === randomSong.title;
            if (isCorrect) {
                numCorrect++;
            }
            updateFeedback(isCorrect); // Call the new function to update feedback
            setTimeout(askQuestion, 1000);
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

    // Change content of question element to show results
    questionElement.innerHTML = `You got ${numCorrect} out of ${totalQuestions} answers right.`;
    let resultText = "";
    let imageUrl = "";

    if (numCorrect >= 0 && numCorrect <= 1) {
        resultText = "Better luck next time!";
        imageUrl = "img1a.gif";
    } else if (numCorrect >= 2 && numCorrect <= 3) {
        resultText = "Decent effort!";
        imageUrl = "img2a.gif";
    } else if (numCorrect === 4) {
        resultText = "Impressive!";
        imageUrl = "img3a.gif";
    } else if (numCorrect === 5) {
        resultText = "A true Swiftie!";
        imageUrl = "img4a.gif";
    }

    // Optionally create an image element to show the result image
    let resultImage = document.createElement('img');
    resultImage.src = imageUrl;
    resultImage.alt = resultText;
    resultImage.style.maxWidth = "100%"; // Ensure the image fits the container
    resultImage.style.height = "auto";

    // Append result text and image to the question element
    questionElement.innerHTML += `<p>${resultText}</p>`;
    questionElement.appendChild(resultImage);

    // Hide choice buttons and show feedback
    choicesContainer.style.display = 'none';
    feedbackElement.innerText = "";
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

// Event listener for when the DOM content has fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);
