// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizContent = document.getElementById('quiz-content');
const quizTitle = document.getElementById('quiz-title');
const quizTitleHeader = document.getElementById('quiz-title-header');
const totalQuestionsSpan = document.getElementById('total-questions');
const timeLimitSpan = document.getElementById('time-limit');
const timeLeftSpan = document.getElementById('time-left');
const currentNumberSpan = document.getElementById('current-number');
const totalNumberSpan = document.getElementById('total-number');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-btn');
const resultsElement = document.getElementById('results');
const scoreElement = document.getElementById('score');
const totalElement = document.getElementById('total');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const percentageElement = document.getElementById('percentage');
const answersReviewElement = document.getElementById('answers-review');
const reviewButton = document.getElementById('review-btn');
const startQuizButton = document.getElementById('start-quiz');
const navigationButtons = document.getElementById('navigation');
const timeLimitContainer = document.querySelector('.quiz-info p:nth-child(2)'); // Time limit container

let quiz = null;
let quizAnswers = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timeLeft = 0;
let timerInterval = null;

// Load quiz from URL parameters
function loadQuizFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    const title = urlParams.get('title');

    if (quizId && title) {
        // Get saved quizzes from localStorage
        const savedQuizzes = JSON.parse(localStorage.getItem('saved_quizzes') || '[]');
        quiz = savedQuizzes.find(q => q.id === quizId);

        if (quiz) {
            // Initialize user answers array
            userAnswers = new Array(quiz.questions.length).fill(null);
            
            // Update UI with quiz data
            quizTitle.textContent = quiz.title;
            quizTitleHeader.textContent = quiz.title;
            totalQuestionsSpan.textContent = quiz.questions.length;
            totalNumberSpan.textContent = quiz.questions.length;

            // Show/hide timer info based on quiz settings
            if (quiz.timer) {
                timeLeft = quiz.timer * 60; // Convert minutes to seconds
                timeLimitSpan.textContent = quiz.timer;
                timeLimitContainer.style.display = 'block';
            } else {
                timeLimitContainer.style.display = 'none';
            }
        } else {
            alert('Quiz not found!');
            window.location.href = 'index.html';
        }
    } else {
        alert('Invalid quiz link!');
        window.location.href = 'index.html';
    }
}

// Call loadQuizFromURL when the page loads
document.addEventListener('DOMContentLoaded', loadQuizFromURL);

// Start quiz button click event
startQuizButton.addEventListener('click', () => {
    startScreen.classList.add('hide');
    quizContent.classList.remove('hide');
    showQuestion(0);
    updateNavigation();
    if (quiz.timer) {
        startTimer();
        document.getElementById('timer').classList.remove('hide');
    } else {
        document.getElementById('timer').classList.add('hide');
    }
});

// Show question by index
function showQuestion(index) {
    const question = quiz.questions[index];
    currentQuestionIndex = index;
    currentNumberSpan.textContent = index + 1;
    questionElement.textContent = question.question;

    // Clear previous choices
    choicesElement.innerHTML = '';

    // Add choices
    question.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        if (userAnswers[currentQuestionIndex] === i) {
            btn.classList.add('selected');
        }
        btn.textContent = choice;
        btn.onclick = () => selectChoice(i);
        choicesElement.appendChild(btn);
    });

    // Update navigation
    updateNavigation();
}

// Select choice handler
function selectChoice(choiceIndex) {
    userAnswers[currentQuestionIndex] = choiceIndex;
    
    // Update choice button styles
    const buttons = choicesElement.querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
        if (i === choiceIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    // Show next button if it's not the last question
    updateNavigation();
}

// Update navigation buttons
function updateNavigation() {
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const hasSelectedAnswer = userAnswers[currentQuestionIndex] !== null;
    
    nextButton.classList.toggle('hide', !hasSelectedAnswer || isLastQuestion);
    submitButton.classList.toggle('hide', !isLastQuestion || !hasSelectedAnswer);
    
    // Update progress
    currentNumberSpan.textContent = currentQuestionIndex + 1;
}

// Next button click handler
nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
});

// Submit button click handler
submitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to submit the quiz?')) {
        showResults();
    }
});

// Show results
function showResults() {
    clearInterval(timerInterval);
    quizContent.classList.add('hide');
    resultsElement.classList.remove('hide');

    let correctCount = 0;
    const total = quiz.questions.length;

    // Calculate score
    quiz.questions.forEach((q, index) => {
        if (userAnswers[index] === q.correctAnswer) {
            correctCount++;
        }
    });

    const incorrectCount = total - correctCount;
    const percentage = ((correctCount / total) * 100).toFixed(1);

    // Update results UI
    scoreElement.textContent = correctCount;
    totalElement.textContent = total;
    correctCountElement.textContent = correctCount;
    incorrectCountElement.textContent = incorrectCount;
    percentageElement.textContent = percentage + '%';

    // Generate answer review
    answersReviewElement.innerHTML = quiz.questions.map((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correctAnswer;
        
        return `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                <h3>Question ${index + 1}</h3>
                <p class="question-text">${q.question}</p>
                <div class="answer-details">
                    <p class="your-answer">Your Answer: ${userAnswer !== null ? q.choices[userAnswer] : 'Not answered'}</p>
                    <p class="correct-answer">Correct Answer: ${q.choices[q.correctAnswer]}</p>
                </div>
                <div class="answer-status">
                    ${isCorrect ? 
                        '<span class="correct-badge">Correct ✓</span>' : 
                        '<span class="incorrect-badge">Incorrect ✗</span>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Timer functions
function startTimer() {
    if (!quiz.timer) return;
    
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 300) { // 5 minutes remaining
            timeLeftSpan.parentElement.classList.add('warning');
        }
        
        if (timeLeft <= 60) { // 1 minute remaining
            timeLeftSpan.parentElement.classList.add('danger');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResults();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeLeftSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

