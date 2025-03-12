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
                    { text: 'Settings', icon: '⚙️', href: '#settings' },
                    { text: 'FAQ', icon: '❓', href: '#faq' },
                    { text: 'Logout', icon: '🚪', href: '#logout' }
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
    
    // Check which page we're on and run appropriate functions
    if (document.querySelector('.quiz-container')) {
        initQuiz(); // We're on the quiz page
    } else if (document.getElementById('quiz-cards')) {
        renderQuizCards(); // We're on the main page
    }
});