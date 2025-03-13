// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Profile menu functionality
    const profilePic = document.querySelector('.profile-pic');
    
    if (profilePic) {
        // Create the profile dropdown menu
        const createProfileMenu = () => {
            // Create the menu element if it doesn't exist yet
            if (!document.querySelector('.profile-menu')) {
                const menu = document.createElement('div');
                menu.className = 'profile-menu';
                
                // Create menu items
                const menuItems = [
                    { text: 'View Profile', icon: '👤', href: '#profile' },
                    { text: 'Settings', icon: '⚙️', href: 'settings.html' },
                    { text: 'FAQ', icon: '❓', href: '#faq' },
                    { text: 'Logout', icon: '🚪', href: 'login.html' }
                ];
                
                // Add each menu item to the dropdown
                menuItems.forEach(item => {
                    const menuItem = document.createElement('a');
                    menuItem.href = item.href;
                    menuItem.innerHTML = `<span class="menu-icon">${item.icon}</span> ${item.text}`;
                    menu.appendChild(menuItem);
                });
                
                // Add the menu to the profile container
                document.querySelector('.profile').appendChild(menu);
            }
        };
        
        // Toggle the profile menu visibility
        const toggleProfileMenu = () => {
            // Create the menu if it doesn't exist
            createProfileMenu();
            
            // Get the menu
            const menu = document.querySelector('.profile-menu');
            
            // Toggle the active class
            menu.classList.toggle('active');
            
            // Close menu when clicking outside
            if (menu.classList.contains('active')) {
                document.addEventListener('click', closeMenuOnClickOutside);
            } else {
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        };
        
        // Close the menu when clicking outside
        const closeMenuOnClickOutside = (event) => {
            const menu = document.querySelector('.profile-menu');
            const profile = document.querySelector('.profile');
            
            // If the click is outside the profile area
            if (!profile.contains(event.target)) {
                menu.classList.remove('active');
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        };
        
        // Add click event to profile picture
        profilePic.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the click from immediately closing the menu
            toggleProfileMenu();
        });
    }
    
    // Main page quiz cards functionality
    const renderQuizCards = () => {
        const quizCardsContainer = document.getElementById('quiz-cards');
        
        if (quizCardsContainer) {
            quizData.forEach(quiz => {
                const quizCard = document.createElement('div');
                quizCard.className = 'quiz-card';
                quizCard.innerHTML = `
                    <img src="${quiz.imageUrl}" alt="${quiz.title}" class="quiz-card-image">
                    <div class="quiz-card-content">
                        <h3 class="quiz-card-title">${quiz.title}</h3>
                        <p class="quiz-card-description">${quiz.description}</p>
                        <div class="quiz-card-meta">
                            <span>By ${quiz.author}</span>
                            <span class="quiz-card-category">${quiz.category}</span>
                        </div>
                        <div class="quiz-card-actions">
                            <a href="quiz.html?id=${quiz.id}" class="quiz-card-btn">Play Quiz</a>
                        </div>
                    </div>
                `;
                quizCardsContainer.appendChild(quizCard);
            });
        }
    };
    
    // Quiz page functionality
    const initQuiz = () => {
        // Get the quiz ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('id');
        
        // Find the quiz data based on the ID
        const currentQuizData = quizData.find(quiz => quiz.id === quizId);
        
        // If no quiz found, redirect to main page
        if (!currentQuizData) {
            window.location.href = 'main.html';
            return;
        }
        
        // Quiz state
        let currentQuestionIndex = 0;
        let score = 0;
        let timer;
        let timeLeft;
        let isAnswered = false;
        
        // DOM Elements
        const timerBar = document.getElementById('timer-bar');
        const timerSeconds = document.getElementById('timer-seconds');
        const questionText = document.getElementById('question-text');
        const currentQuestionSpan = document.getElementById('current-question');
        const totalQuestionsSpan = document.getElementById('total-questions');
        const answerCards = document.querySelectorAll('.answer-card');
        const feedbackOverlay = document.getElementById('feedback-overlay');
        const feedbackModal = document.getElementById('feedback-modal');
        
        // Initialize the quiz
        function init() {
            // Set the document title to include the quiz name
            document.title = `${currentQuizData.title} - MyWebsite`;
            
            // Set the quiz title in the header
            document.getElementById('quiz-title').textContent = currentQuizData.title;
            
            // Set the total number of questions dynamically
            totalQuestionsSpan.textContent = currentQuizData.questions.length;
            
            // Start with the first question
            loadQuestion(0);
            
            // Add event listeners to answer cards
            answerCards.forEach(card => {
                card.addEventListener('click', handleAnswerClick);
            });
        }
        
        // Load a question
        function loadQuestion(index) {
            if (index >= currentQuizData.questions.length) {
                // Quiz is over
                endQuiz();
                return;
            }
            
            isAnswered = false;
            currentQuestionIndex = index;
            const question = currentQuizData.questions[index];
            
            // Update question text and counter
            questionText.textContent = question.text;
            currentQuestionSpan.textContent = index + 1;
            
            // Update answer options
            answerCards.forEach((card, i) => {
                card.querySelector('.answer-text').textContent = question.options[i];
                card.classList.remove('disabled');
            });
            
            // Start the timer
            startTimer(question.timeLimit);
        }
        
        // Start timer for current question
        function startTimer(seconds) {
            clearInterval(timer);
            timeLeft = seconds;
            timerSeconds.textContent = timeLeft;
            timerBar.style.transition = 'none';
            timerBar.style.width = '100%';
            timerBar.style.backgroundColor = '#4CAF50'; // Reset color to green
            
            // Force a reflow to make sure the transition is reset
            void timerBar.offsetWidth;
            
            timerBar.style.transition = `width ${seconds}s linear`;
            timerBar.style.width = '0%';
            
            // Calculate time threshold for turning red (20% of total time)
            const warningThreshold = Math.ceil(seconds * 0.2);
            
            timer = setInterval(() => {
                timeLeft--;
                timerSeconds.textContent = timeLeft;
                
                // Check if timer should turn red (at 20% time remaining)
                if (timeLeft <= warningThreshold && timerBar.style.backgroundColor !== 'red') {
                    timerBar.style.backgroundColor = 'red';
                }
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    if (!isAnswered) {
                        handleTimeout();
                    }
                }
            }, 1000);
        }
        
        // Handle answer click
        function handleAnswerClick() {
            if (isAnswered) return;
            
            isAnswered = true;
            clearInterval(timer);
            
            const selectedOption = parseInt(this.dataset.option);
            const correctOption = currentQuizData.questions[currentQuestionIndex].correctOption;
            const totalTime = currentQuizData.questions[currentQuestionIndex].timeLimit;
            
            // Disable all answer cards
            answerCards.forEach(card => {
                card.classList.add('disabled');
            });
            
            // Show feedback
            if (selectedOption === correctOption) {
                // Calculate points based on time remaining: points = 100 + 100 * timeRemaining/totalTime
                const pointsEarned = 100 + Math.round(100 * (timeLeft / totalTime));
                
                // Correct answer
                feedbackModal.className = 'feedback-modal correct';
                feedbackModal.querySelector('.feedback-icon').textContent = '✓';
                feedbackModal.querySelector('.feedback-text').textContent = 'Correct!';
                feedbackModal.querySelector('.points').textContent = `+${pointsEarned} points`;
                score += pointsEarned;
                
                // Show time bonus info
                let timeBonus = feedbackModal.querySelector('.time-bonus');
                if (!timeBonus) {
                    timeBonus = document.createElement('div');
                    timeBonus.className = 'time-bonus';
                    feedbackModal.insertBefore(timeBonus, feedbackModal.querySelector('.waiting-text'));
                }
                timeBonus.textContent = `Speed Bonus: ${Math.round((timeLeft/totalTime) * 100)}%`;
                
                // Remove correct answer display if it exists from a previous question
                const existingCorrectAnswer = feedbackModal.querySelector('.correct-answer');
                if (existingCorrectAnswer) {
                    feedbackModal.removeChild(existingCorrectAnswer);
                }
            } else {
                // Wrong answer
                feedbackModal.className = 'feedback-modal incorrect';
                feedbackModal.querySelector('.feedback-icon').textContent = '✗';
                feedbackModal.querySelector('.feedback-text').textContent = 'Incorrect!';
                feedbackModal.querySelector('.points').textContent = '+0 points';
                
                // Display correct answer
                const correctAnswerText = currentQuizData.questions[currentQuestionIndex].options[correctOption];
                let correctAnswer = feedbackModal.querySelector('.correct-answer');
                if (!correctAnswer) {
                    correctAnswer = document.createElement('div');
                    correctAnswer.className = 'correct-answer';
                    feedbackModal.insertBefore(correctAnswer, feedbackModal.querySelector('.waiting-text'));
                }
                correctAnswer.textContent = `Correct answer: ${correctAnswerText}`;
                
                // Remove time bonus if it exists from a previous question
                const existingTimeBonus = feedbackModal.querySelector('.time-bonus');
                if (existingTimeBonus) {
                    feedbackModal.removeChild(existingTimeBonus);
                }
            }
            
            feedbackOverlay.classList.add('active');
            
            // Move to next question after a delay
            setTimeout(() => {
                feedbackOverlay.classList.remove('active');
                loadQuestion(currentQuestionIndex + 1);
            }, 3000);
        }
        
        // Handle timeout (no answer selected in time)
        function handleTimeout() {
            isAnswered = true;
            
            // Disable all answer cards
            answerCards.forEach(card => {
                card.classList.add('disabled');
            });
            
            // Show timeout feedback
            feedbackModal.className = 'feedback-modal timeout';
            feedbackModal.querySelector('.feedback-icon').textContent = '⏱';
            feedbackModal.querySelector('.feedback-text').textContent = 'Time\'s up!';
            feedbackModal.querySelector('.points').textContent = '+0 points';
            
            // Display correct answer
            const correctOption = currentQuizData.questions[currentQuestionIndex].correctOption;
            const correctAnswerText = currentQuizData.questions[currentQuestionIndex].options[correctOption];
            let correctAnswer = feedbackModal.querySelector('.correct-answer');
            if (!correctAnswer) {
                correctAnswer = document.createElement('div');
                correctAnswer.className = 'correct-answer';
                feedbackModal.insertBefore(correctAnswer, feedbackModal.querySelector('.waiting-text'));
            }
            correctAnswer.textContent = `Correct answer: ${correctAnswerText}`;
            
            // Remove time bonus if it exists from a previous question
            const existingTimeBonus = feedbackModal.querySelector('.time-bonus');
            if (existingTimeBonus) {
                feedbackModal.removeChild(existingTimeBonus);
            }
            
            feedbackOverlay.classList.add('active');
            
            // Move to next question after a delay
            setTimeout(() => {
                feedbackOverlay.classList.remove('active');
                loadQuestion(currentQuestionIndex + 1);
            }, 3000);
        }
        
        // End the quiz
        function endQuiz() {
            // Remove the timer and question
            document.querySelector('.timer-container').style.display = 'none';
            document.querySelector('.question-container').style.display = 'none';
            
            // Replace answers with results
            const answersGrid = document.querySelector('.answers-grid');
            answersGrid.innerHTML = `
                <div class="results-container">
                    <h2>Quiz Complete!</h2>
                    <p class="final-score">Your score: ${score}</p>
                    <button class="btn" onclick="window.location.href='main.html'">Return to Home</button>
                </div>
            `;
        }
        
        // Initialize the quiz
        init();
    };
    
    // Create Quiz Page Functionality
    const initCreateQuiz = () => {
        let questionCount = 1;
        
        // Function to toggle correct answer
        const setupCorrectToggles = () => {
            document.querySelectorAll('.correct-toggle').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    // First, remove active class from all toggles in this question
                    const questionCard = this.closest('.question-card');
                    questionCard.querySelectorAll('.correct-toggle').forEach(t => {
                        t.setAttribute('data-correct', 'false');
                        t.classList.remove('active');
                    });
                    
                    // Then set this one as active
                    this.setAttribute('data-correct', 'true');
                    this.classList.add('active');
                });
            });
        };
        
        // Initialize the correct toggles for the first question
        setupCorrectToggles();
        
        // Add new question
        const addQuestionBtn = document.getElementById('add-question');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', function() {
                questionCount++;
                
                // Clone the first question card as a template
                const newQuestion = document.querySelector('.question-card').cloneNode(true);
                newQuestion.id = `question-${questionCount}`;
                
                // Update the question number
                newQuestion.querySelector('h2').textContent = `Question ${questionCount}`;
                
                // Reset inputs
                newQuestion.querySelectorAll('input[type="text"]').forEach(input => {
                    input.value = '';
                });
                
                // Reset correct toggles
                newQuestion.querySelectorAll('.correct-toggle').forEach(toggle => {
                    toggle.setAttribute('data-correct', 'false');
                    toggle.classList.remove('active');
                });
                
                // Update IDs to be unique
                newQuestion.querySelector(`[id^="question-text-"]`).id = `question-text-${questionCount}`;
                newQuestion.querySelector(`[id^="question-time-"]`).id = `question-time-${questionCount}`;
                
                // Add the new question to the container
                document.querySelector('.questions-container').appendChild(newQuestion);
                
                // Setup correct toggles for the new question
                setupCorrectToggles();
                
                // Setup delete button for the new question
                setupDeleteButtons();
                
                // Scroll to the new question
                newQuestion.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Setup delete question functionality
        const setupDeleteButtons = () => {
            document.querySelectorAll('.btn-icon').forEach(btn => {
                btn.addEventListener('click', function() {
                    // Don't delete if it's the only question
                    if (document.querySelectorAll('.question-card').length > 1) {
                        const card = this.closest('.question-card');
                        card.remove();
                        
                        // Renumber the questions
                        document.querySelectorAll('.question-card').forEach((card, index) => {
                            const num = index + 1;
                            card.id = `question-${num}`;
                            card.querySelector('h2').textContent = `Question ${num}`;
                        });
                        
                        questionCount = document.querySelectorAll('.question-card').length;
                    } else {
                        alert('You must have at least one question in your quiz.');
                    }
                });
            });
        };
        
        // Initialize delete buttons
        setupDeleteButtons();
        
        // Complete quiz submission
        const completeQuizBtn = document.getElementById('complete-quiz');
        if (completeQuizBtn) {
            completeQuizBtn.addEventListener('click', function() {
                // Here we would normally validate and submit the quiz data
                // For now, just show an alert
                alert('Quiz completed! In a real application, this would save your quiz.');
            });
        }
    };
    
        // Login/Signup page functionality
    const initLoginPage = () => {
        // Toggle password visibility
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        
        if (togglePasswordButtons.length > 0) {
            togglePasswordButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const passwordField = this.previousElementSibling;
                    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordField.setAttribute('type', type);
                    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
                });
            });
        }
        
        // Form submission with redirect to main page
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Show a brief message before redirecting
                alert('Login successful! Redirecting to main page...');
                
                // Redirect to main page after a short delay
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 500);
            });
        }
    };

    // Dark mode functionality
    const initDarkMode = () => {
        // Check for saved theme preference or use device preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            updateToggles(true);
        } else {
            updateToggles(false);
        }
        
        // Toggle dark mode function
        const toggleDarkMode = () => {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateToggles(isDarkMode);
        };
        
        // Update all toggle switches
        function updateToggles(isDark) {
            document.querySelectorAll('#dark-mode-toggle').forEach(toggle => {
                toggle.classList.toggle('active', isDark);
            });
        }
        
        // Set up event listeners
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }
        
        // Initialize other toggle switches
        document.querySelectorAll('.toggle-switch:not(#dark-mode-toggle)').forEach(toggle => {
            toggle.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        });
    };

    // Settings page functionality
    const initSettingsPage = () => {
        // Save changes button
        const saveButton = document.querySelector('.settings-actions .btn-primary');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                alert('Settings saved successfully!');
            });
        }
        
        // Cancel button
        const cancelButton = document.querySelector('.settings-actions .btn-secondary');
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                window.location.href = 'main.html';
            });
        }
    };

    // Check which page we're on and run appropriate functions
    if (document.querySelector('.quiz-container')) {
        initQuiz(); // We're on the quiz page
    } else if (document.getElementById('quiz-cards')) {
        renderQuizCards(); // We're on the main page
    } else if (document.querySelector('.questions-container')) {
        initCreateQuiz(); // We're on the create quiz page
    } else if (document.querySelector('.login-form')) {
        initLoginPage(); // We're on the login or signup page
    } else if (document.querySelector('.settings-container')) {
        initSettingsPage(); // We're on the settings page
    }
    
    // Initialize dark mode on every page
    initDarkMode();
});