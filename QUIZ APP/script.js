// Quiz questions array - empty by default
let questions = [];
let currentQuizId = null;

// DOM Elements
const landingPage = document.getElementById('landing-page');
const quizPage = document.getElementById('quiz-page');
const showQuizBtn = document.getElementById('show-quiz-btn');
const addQuestionBtn = document.getElementById('add-question-btn');
const questionForm = document.getElementById('question-form');
const manageQuestionForm = document.getElementById('manage-question-form');
const questionsList = document.getElementById('questions-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.querySelector('.cancel-btn');

// Share Quiz Elements
const shareQuizBtn = document.getElementById('share-quiz-btn');
const shareContainer = document.getElementById('share-container');
const shareModal = document.getElementById('share-modal');
const generateLinkBtn = document.getElementById('generate-link');
const shareLinkInput = document.getElementById('share-link');
const copyLinkBtn = document.getElementById('copy-link');
const quizTitleInput = document.getElementById('quiz-title');
const shareLinkContainer = document.querySelector('.share-link-container');

// Additional DOM Elements
const addOptionBtn = document.getElementById('add-option');
const optionsContainer = document.getElementById('options-container');
const quizTimer = document.getElementById('quiz-timer');
const enableTimer = document.getElementById('enable-timer');
const timerInputContainer = document.getElementById('timer-input-container');
const cancelQuestionBtn = document.getElementById('cancel-question');

// Generate Quiz button
const generateQuizBtn = document.getElementById('generate-quiz-btn');


let editingQuestionId = null;

// Initially hide the share button
shareQuizBtn.style.display = 'none';

// Initialize page state
document.addEventListener('DOMContentLoaded', () => {
    // Show landing page, hide quiz page initially
    landingPage.classList.remove('hide');
    quizPage.classList.add('hide');
    questionForm.classList.add('hide');
    shareModal.classList.add('hide');
    
    // Show share button if there are questions
    if (questions.length > 0) {
        shareQuizBtn.style.display = 'block';
    }
    
    // Render empty questions list
    renderQuestionsList();
    createParticles();
});

// Show Quiz Page
showQuizBtn.addEventListener('click', () => {
    landingPage.classList.add('hide');
    quizPage.classList.remove('hide');
    clearCurrentQuiz(); // Clear any existing quiz data
    
    // Initially hide the share button
    shareQuizBtn.classList.add('hide');
    shareQuizBtn.style.display = 'none';
});

// Question Management
addQuestionBtn.addEventListener('click', () => {
    if (!currentQuizId && questions.length > 0) {
        if (confirm('Starting a new quiz will clear the current one. Continue?')) {
            clearCurrentQuiz();
        } else {
            return;
        }
    }
    editingQuestionId = null;
    formTitle.textContent = currentQuizId ? 'Add Question to Quiz' : 'Add New Question';
    manageQuestionForm.reset();
    resetOptionsToDefault();
    questionForm.classList.remove('hide');
    
    // Show current question count
    const questionCount = document.createElement('div');
    questionCount.className = 'question-count';
    questionCount.textContent = `Current Questions: ${questions.length}`;
    formTitle.appendChild(questionCount);
});

// Cancel button handler
cancelQuestionBtn.addEventListener('click', () => {
    questionForm.classList.add('hide');
    manageQuestionForm.reset();
    resetOptionsToDefault();
    editingQuestionId = null;
    
    // Ensure we're on the quiz questions page
    landingPage.classList.add('hide');
    quizPage.classList.remove('hide');
});

// Handle dynamic options
addOptionBtn.addEventListener('click', () => {
    const optionCount = optionsContainer.children.length;
    const newOption = document.createElement('div');
    newOption.className = 'option-row';
    newOption.innerHTML = `
        <input type="text" class="choice-input" placeholder="Option ${optionCount + 1}" required>
        <button type="button" class="btn remove-option">×</button>
    `;
    
    optionsContainer.appendChild(newOption);
    updateCorrectAnswerOptions();
    updateRemoveButtons();
});

function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-option');
    const hasMoreThanTwo = optionsContainer.children.length > 2;
    
    removeButtons.forEach(button => {
        button.disabled = !hasMoreThanTwo;
        if (!button.hasListener) {
            button.addEventListener('click', () => {
                button.parentElement.remove();
                updateCorrectAnswerOptions();
                updateRemoveButtons();
                renumberOptions();
            });
            button.hasListener = true;
        }
    });
}

function updateCorrectAnswerOptions() {
    const correctAnswer = document.getElementById('correct-answer');
    const optionCount = optionsContainer.children.length;
    
    correctAnswer.innerHTML = Array.from({ length: optionCount }, (_, i) => `
        <option value="${i}">Option ${i + 1}</option>
    `).join('');
}

function renumberOptions() {
    const inputs = optionsContainer.querySelectorAll('.choice-input');
    inputs.forEach((input, index) => {
        input.placeholder = `Option ${index + 1}`;
    });
}

function resetOptionsToDefault() {
    optionsContainer.innerHTML = `
        <div class="option-row">
            <input type="text" class="choice-input" placeholder="Option 1" required>
            <button type="button" class="btn remove-option" disabled>×</button>
        </div>
        <div class="option-row">
            <input type="text" class="choice-input" placeholder="Option 2" required>
            <button type="button" class="btn remove-option" disabled>×</button>
        </div>
    `;
    updateCorrectAnswerOptions();
}

// DOM Elements
// const saveButtonsContainer = document.getElementById('save-buttons-container');
// const saveNewQuizBtn = document.getElementById('save-new-quiz');
// const saveQuizChangesBtn = document.getElementById('save-quiz-changes');

// Form submission handler
manageQuestionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const questionText = document.getElementById('question-text').value.trim();
    const choices = Array.from(document.querySelectorAll('.choice-input')).map(input => input.value.trim());
    const correctAnswer = parseInt(document.getElementById('correct-answer').value);
    
    // Validate inputs
    if (!questionText) {
        showNotification('Please enter a question', 'error');
        return;
    }
    
    if (choices.some(choice => !choice)) {
        showNotification('Please fill in all choices', 'error');
        return;
    }
    
    // Check for duplicate questions
    const isDuplicate = questions.some(q => 
        q.id !== editingQuestionId && 
        q.question.toLowerCase() === questionText.toLowerCase()
    );
    
    if (isDuplicate) {
        showNotification('This question already exists', 'error');
        return;
    }
    
    if (editingQuestionId) {
        // Update existing question
        const index = questions.findIndex(q => q.id === editingQuestionId);
        questions[index] = {
            id: editingQuestionId,
            question: questionText,
            choices: choices,
            correctAnswer: correctAnswer
        };
        showNotification('Question updated successfully!');
    } else {
        // Add new question
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        questions.push({
            id: newId,
            question: questionText,
            choices: choices,
            correctAnswer: correctAnswer
        });
        showNotification('Question added successfully! Add another question or click Share Quiz when done.');
    }
    
    // Reset form for adding another question
    if (!editingQuestionId) {
        document.getElementById('question-text').value = '';
        document.querySelectorAll('.choice-input').forEach(input => input.value = '');
        document.getElementById('correct-answer').value = '0';
        
        // Update question count
        const questionCount = document.querySelector('.question-count');
        if (questionCount) {
            questionCount.textContent = `Current Questions: ${questions.length}`;
        }
    } else {
        // Close form if editing
        questionForm.classList.add('hide');
        editingQuestionId = null;
    }
    
    // Show share button if we have questions
    if (questions.length > 0) {
        shareQuizBtn.classList.remove('hide');
        shareQuizBtn.style.display = 'block';
    }
    
    renderQuestionsList();
    saveQuestions();
    
    // Update header after adding/editing question
    updateQuizHeader();
});

// Add a "Done Adding Questions" button
const doneAddingBtn = document.createElement('button');
doneAddingBtn.id = 'done-adding-btn';
doneAddingBtn.className = 'btn';
doneAddingBtn.textContent = 'Done Adding Questions';
doneAddingBtn.onclick = () => {
    questionForm.classList.add('hide');
    showNotification(`Quiz created with ${questions.length} questions! Click Share Quiz to generate a link.`);
};

// Add to form buttons
const formButtons = document.querySelector('.form-buttons');
formButtons.appendChild(doneAddingBtn);

// Save New Quiz Button Handler
// saveNewQuizBtn.addEventListener('click', () => {
//     // Reset and show only title field in share modal
//     quizTitleInput.value = '';
//     document.querySelector('.timer-toggle').style.display = 'none';
//     document.getElementById('timer-input-container').classList.add('hide');
//     shareLinkContainer.classList.add('hide');
    
//     // Change button text
//     document.getElementById('generate-link').textContent = 'Save Quiz';
    
//     // Show modal
//     shareModal.classList.remove('hide');
// });


// Clear current quiz with enhanced reset
function clearCurrentQuiz() {
    questions = [];
    currentQuizId = null;
    
    // Reset all form fields and UI elements
    if (quizTitleInput) quizTitleInput.value = '';
    if (enableTimer) enableTimer.checked = false;
    if (timerInputContainer) timerInputContainer.classList.add('hide');
    if (shareQuizBtn) shareQuizBtn.style.display = 'none';
    // if (saveButtonsContainer) {
    //     saveButtonsContainer.classList.add('hide');
    //     saveNewQuizBtn.classList.add('hide');
    //     saveQuizChangesBtn.classList.add('hide');
    // }
    
    // Reset page state
    const adminControls = document.querySelector('.admin-controls');
    if (adminControls) adminControls.classList.remove('editing-mode');
    if (addQuestionBtn) addQuestionBtn.textContent = 'Add New Question';
    if (questionForm) questionForm.classList.add('hide');
    if (shareModal) shareModal.classList.add('hide');
    if (shareLinkContainer) shareLinkContainer.classList.add('hide');
    
    // Clear questions list and render empty state
    renderQuestionsList();
}

// Edit Quiz
function editQuiz(quizId) {
    
    if (quiz) {
        // Load quiz data
        questions = quiz.questions;
        currentQuizId = quizId;
        
        // Update share modal fields
        quizTitleInput.value = quiz.title;
        enableTimer.checked = !!quiz.timer;
        if (quiz.timer) {
            timerInputContainer.classList.remove('hide');
            quizTimer.value = quiz.timer;
        } else {
            timerInputContainer.classList.add('hide');
        }
        
        // Show quiz page if not already visible
        landingPage.classList.add('hide');
        quizPage.classList.remove('hide');
        
        // Update questions list
        renderQuestionsList();
        
        // Close the modal
        createdQuizzesModal.classList.add('hide');
        
        // Show share button since we have questions
        shareQuizBtn.style.display = questions.length > 0 ? 'block' : 'none';
        
        // Update the page state to editing mode
        document.querySelector('.admin-controls').classList.add('editing-mode');
        addQuestionBtn.textContent = 'Add Question to Quiz';
        
        // Show save changes button
        // saveButtonsContainer.classList.remove('hide');
        // saveQuizChangesBtn.classList.remove('hide');
        // saveNewQuizBtn.classList.add('hide');
    }
}

// Edit question
function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    editingQuestionId = questionId;
    formTitle.textContent = 'Edit Question';
    
    // Fill form with question data
    document.getElementById('question-text').value = question.question;
    
    // Reset options container
    optionsContainer.innerHTML = '';
    
    // Add existing choices
    question.choices.forEach((choice, index) => {
        const optionRow = document.createElement('div');
        optionRow.className = 'option-row';
        optionRow.innerHTML = `
            <input type="text" class="choice-input" placeholder="Option ${index + 1}" value="${choice}" required>
            <button type="button" class="btn remove-option" ${question.choices.length <= 2 ? 'disabled' : ''}>×</button>
        `;
        optionsContainer.appendChild(optionRow);
    });
    
    // Set correct answer
    document.getElementById('correct-answer').value = question.correctAnswer;
    
    // Show form
    questionForm.classList.remove('hide');
    updateRemoveButtons();
    updateCorrectAnswerOptions();
}

// Delete question
function deleteQuestion(questionId) {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    const questionNumber = questionIndex + 1;
    
    const confirmDelete = confirm(`Are you sure you want to delete Question ${questionNumber}? This action cannot be undone.`);
    
    if (confirmDelete) {
        questions = questions.filter(q => q.id !== questionId);
        renderQuestionsList();
        saveQuestions();
        updateQuizHeader();
        
        // Hide share button if no questions
        if (questions.length === 0) {
            shareQuizBtn.style.display = 'none';
            shareQuizBtn.classList.add('hide');
        }
        
        showNotification('Question deleted successfully');
    }
}

// Render questions list with inline editing
function renderQuestionsList() {
    if (questions.length === 0) {
        questionsList.innerHTML = '';
        shareQuizBtn.classList.add('hide');
        shareQuizBtn.style.display = 'none';
    } else {
        questionsList.innerHTML = questions.map((q, index) => `
            <div class="question-item" data-id="${q.id}">
                <div class="question-header">
                    <div class="question-number">Question ${index + 1}</div>
                    <div class="question-actions">
                        <button class="action-btn edit-btn" onclick="toggleEditMode(${q.id})" title="Edit Question">
                            <span class="action-icon">✏️</span>
                            <span class="action-text">Edit</span>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteQuestion(${q.id})" title="Delete Question">
                            <span class="action-icon">🗑️</span>
                            <span class="action-text">Delete</span>
                        </button>
                    </div>
                </div>
                
                <div class="question-content" id="question-content-${q.id}">
                    <p class="question-text">${q.question}</p>
                    <div class="choices-list">
                        ${q.choices.map((choice, i) => `
                            <div class="choice-item ${i === q.correctAnswer ? 'correct' : ''}">
                                <span class="choice-number">${i + 1}</span>
                                <span class="choice-text">${choice}</span>
                                ${i === q.correctAnswer ? '<span class="correct-badge">Correct Answer</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="question-edit-form hide" id="question-edit-${q.id}">
                    <div class="edit-form-content">
                        <input type="text" class="edit-question-input" value="${q.question}" placeholder="Enter question">
                        <div class="edit-choices">
                            ${q.choices.map((choice, i) => `
                                <div class="edit-choice-row">
                                    <input type="text" class="edit-choice-input" value="${choice}" placeholder="Enter choice ${i + 1}">
                                    <label class="correct-answer-label">
                                        <input type="radio" name="correct-answer-${q.id}" value="${i}" ${i === q.correctAnswer ? 'checked' : ''}>
                                        Correct Answer
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                        <div class="edit-actions">
                            <button class="btn save-edit-btn" onclick="saveEdit(${q.id})">Save Changes</button>
                            <button class="btn cancel-edit-btn" onclick="toggleEditMode(${q.id})">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        shareQuizBtn.classList.remove('hide');
        shareQuizBtn.style.display = 'block';
    }
}

// Toggle edit mode for a question
function toggleEditMode(questionId) {
    const contentDiv = document.getElementById(`question-content-${questionId}`);
    const editDiv = document.getElementById(`question-edit-${questionId}`);
    
    if (contentDiv.classList.contains('hide')) {
        // Cancel edit
        contentDiv.classList.remove('hide');
        editDiv.classList.add('hide');
    } else {
        // Enter edit mode
        contentDiv.classList.add('hide');
        editDiv.classList.remove('hide');
        
        // Focus on question input
        editDiv.querySelector('.edit-question-input').focus();
    }
}

// Save edited question
function saveEdit(questionId) {
    const editDiv = document.getElementById(`question-edit-${questionId}`);
    const questionInput = editDiv.querySelector('.edit-question-input');
    const choiceInputs = editDiv.querySelectorAll('.edit-choice-input');
    const correctAnswerInput = editDiv.querySelector('input[name="correct-answer-' + questionId + '"]:checked');
    
    const newQuestion = questionInput.value.trim();
    const newChoices = Array.from(choiceInputs).map(input => input.value.trim());
    const newCorrectAnswer = parseInt(correctAnswerInput.value);
    
    // Validate inputs
    if (!newQuestion) {
        showNotification('Please enter a question', 'error');
        return;
    }
    
    if (newChoices.some(choice => !choice)) {
        showNotification('Please fill in all choices', 'error');
        return;
    }
    
    // Update question
    const questionIndex = questions.findIndex(q => q.id === questionId);
    questions[questionIndex] = {
        ...questions[questionIndex],
        question: newQuestion,
        choices: newChoices,
        correctAnswer: newCorrectAnswer
    };
    
    // Save and update UI
    saveQuestions();
    renderQuestionsList();
    updateQuizHeader();
    showNotification('Question updated successfully!');
}

// Timer toggle functionality
enableTimer.addEventListener('change', () => {
    timerInputContainer.classList.toggle('hide', !enableTimer.checked);
    if (enableTimer.checked) {
        quizTimer.focus();
    }
});

// Share Quiz
shareQuizBtn.addEventListener('click', () => {
    // Reset the share modal state
    shareLinkContainer.classList.add('hide');
    generateLinkBtn.textContent = 'Generate Link';
    generateLinkBtn.style.background = '';
    document.querySelector('#share-modal h2').textContent = 'Share Quiz';
    document.querySelector('.form-group').style.display = 'block';
    
    // Pre-fill the title if editing an existing quiz
    const titleInput = document.getElementById('quiz-title-input');
    if (titleInput) {
        titleInput.value = getCurrentQuizTitle() || '';
        titleInput.focus();
    }
    
    // Show/hide timer input based on current state
    if (enableTimer.checked) {
        timerInputContainer.classList.remove('hide');
    } else {
        timerInputContainer.classList.add('hide');
    }

    // Show the modal
    shareModal.classList.remove('hide');
});

// Get current quiz title
function getCurrentQuizTitle() {
    const savedQuizzes = JSON.parse(localStorage.getItem('saved_quizzes') || '[]');
    const quiz = savedQuizzes.find(q => q.id === currentQuizId);
    return quiz ? quiz.title : '';
}

// Load Saved Quizzes
function loadSavedQuizzes() {
    const savedQuizzes = JSON.parse(localStorage.getItem('saved_quizzes') || '[]');
    
    if (savedQuizzes.length === 0) {
        quizzesList.innerHTML = `
            <div class="empty-state">
                <p>No quizzes created yet. Click "Add New Question" to create your first quiz!</p>
            </div>
        `;
        return;
    }

    quizzesList.innerHTML = savedQuizzes.map(quiz => `
        <div class="quiz-item">
            <h3>${quiz.title}</h3>
            <div class="quiz-info">
                <span>${quiz.questions.length} Questions</span>
                ${quiz.timer ? `<span>${quiz.timer} Minutes</span>` : ''}
            </div>
            <div class="quiz-actions">
                <button class="edit-quiz" onclick="editQuiz('${quiz.id}')" title="Edit Quiz">✏️</button>
                <button class="delete-quiz" onclick="deleteQuiz('${quiz.id}')" title="Delete Quiz">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Delete Quiz with Confirmation
function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
        const savedQuizzes = JSON.parse(localStorage.getItem('saved_quizzes') || '[]');
        const updatedQuizzes = savedQuizzes.filter(q => q.id !== quizId);
        localStorage.setItem('saved_quizzes', JSON.stringify(updatedQuizzes));
        
        // Remove answers from localStorage
        localStorage.removeItem(`quiz_answers_${quizId}`);
        
        // If currently editing this quiz, clear it
        if (currentQuizId === quizId) {
            clearCurrentQuiz();
        }
        
        // Refresh the quizzes list
        loadSavedQuizzes();
    }
}

// Generate Link Button Handler
generateLinkBtn.addEventListener('click', () => {
    const titleInput = document.getElementById('quiz-title-input'); // Change ID to match the input field
    const title = titleInput ? titleInput.value.trim() : '';
    
    if (!title) {
        showNotification('Please enter a quiz title', 'error');
        if (titleInput) {
            titleInput.focus();
        }
        return;
    }

    if (questions.length === 0) {
        showNotification('Please add at least one question before generating a link', 'error');
        return;
    }

    try {
        // Create quiz data
        const quizId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const quizData = {
            id: quizId,
            title: title,
            timer: enableTimer.checked ? parseInt(quizTimer.value) : null,
            questions: questions
        };

        // Save to localStorage
        const savedQuizzes = JSON.parse(localStorage.getItem('saved_quizzes') || '[]');
        savedQuizzes.push(quizData);
        localStorage.setItem('saved_quizzes', JSON.stringify(savedQuizzes));
        
        // Generate a link
        const baseUrl = window.location.href.split('/').slice(0, -1).join('/');
        const generatedLink = `${baseUrl}/take-quiz.html?id=${quizId}&title=${encodeURIComponent(title)}`;

        // Show generated link in the input field
        shareLinkInput.value = generatedLink;
        shareLinkContainer.classList.remove('hide');
        
        // Hide the quiz title and timer inputs
        document.querySelector('.form-group').style.display = 'none';
        
        // Focus and select the link for easy copying
        setTimeout(() => {
            shareLinkInput.focus();
            shareLinkInput.select();
        }, 100);

        // Update button text and style
        generateLinkBtn.textContent = 'Link Generated!';
        generateLinkBtn.style.background = '#28a745';
        
        // Change the modal title
        document.querySelector('#share-modal h2').textContent = 'Quiz Link Generated!';
        
        showNotification('Quiz link generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating link:', error);
        showNotification('There was an error generating the link. Please try again.', 'error');
    }
});

// Copy Link Button Handler
copyLinkBtn.addEventListener('click', () => {
    try {
        shareLinkInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyLinkBtn.textContent = 'Copied!';
        copyLinkBtn.classList.add('copied');
        
        // Show a temporary tooltip or message
        const message = document.createElement('div');
        message.textContent = 'Link copied to clipboard!';
        message.style.cssText = `
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            animation: fadeInOut 2s forwards;
        `;
        shareLinkContainer.style.position = 'relative';
        shareLinkContainer.appendChild(message);
        
        setTimeout(() => {
            copyLinkBtn.textContent = 'Copy';
            copyLinkBtn.classList.remove('copied');
            message.remove();
        }, 2000);
    } catch (error) {
        console.error('Error copying link:', error);
        alert('Failed to copy link. Please try copying manually.');
    }
});

// Close modal when clicking outside
shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        shareModal.classList.add('hide');
        // Reset the share modal state
        shareLinkContainer.classList.add('hide');
        generateLinkBtn.textContent = 'Generate Link';
        generateLinkBtn.style.background = '';
        document.querySelector('#share-modal h2').textContent = 'Share Quiz';
        document.querySelector('.form-group').style.display = 'block';
    }
});

// Save Questions to localStorage with automatic redirection
function saveQuestions() {
    if (currentQuizId) {
        const savedQuizzes = JSON.parse(localStorage.getItem('saved_quizzes') || '[]');
        const quizIndex = savedQuizzes.findIndex(q => q.id === currentQuizId);
        
        if (quizIndex !== -1) {
            savedQuizzes[quizIndex].questions = questions;
            localStorage.setItem('saved_quizzes', JSON.stringify(savedQuizzes));
            
            // Ensure we're on the quiz questions page
            landingPage.classList.add('hide');
            quizPage.classList.remove('hide');
            questionForm.classList.add('hide');
        }
    }
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
}

function loadQuestions() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        renderQuestionsList();
    }
}

// Generate Quiz button click handler
generateQuizBtn.addEventListener('click', () => {
    const questions = getQuestions();
    if (questions.length === 0) {
        alert('Please add some questions before generating the quiz.');
        return;
    }
    openShareModal();
});

// Initialize
updateRemoveButtons();
loadQuestions();
renderQuestionsList();

// Update navigation references
function redirectToHome() {
    window.location.href = 'index.html';
}

// Update error handling
try {
    // ... existing code ...
} catch (error) {
    alert('Invalid quiz data. Redirecting to home page...');
    redirectToHome();
}

// Particle effect initialization
function createParticles() {
    // Create particles container if it doesn't exist
    let particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);
    }

    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 4 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Add this CSS to handle the fadeInOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 10px); }
        20% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -10px); }
    }
`;
document.head.appendChild(style);

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }, 100);
}

// Update quiz header information
function updateQuizHeader() {
    const questionCount = document.getElementById('question-count');
    const timerStatus = document.getElementById('timer-status');
    
    // Update question count
    questionCount.textContent = questions.length;
    
    // Update timer status
    const timer = document.getElementById('enable-timer');
    const timerInput = document.getElementById('quiz-timer');
    if (timer && timer.checked && timerInput.value) {
        timerStatus.textContent = `${timerInput.value} Minutes`;
    } else {
        timerStatus.textContent = 'Timer Disabled';
    }
}

// Add event listeners for timer changes
document.addEventListener('DOMContentLoaded', () => {
    const timer = document.getElementById('enable-timer');
    const timerInput = document.getElementById('quiz-timer');
    
    if (timer && timerInput) {
        timer.addEventListener('change', updateQuizHeader);
        timerInput.addEventListener('input', updateQuizHeader);
    }
    
    updateQuizHeader();
}); 