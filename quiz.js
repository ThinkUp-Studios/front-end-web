document.addEventListener('DOMContentLoaded', function() {
    const profilePic = document.querySelector('.profile-pic');
    
    if (profilePic) {
        const createProfileMenu = () => {
            if (!document.querySelector('.profile-menu')) {
                const menu = document.createElement('div');
                menu.className = 'profile-menu';
                
                const menuItems = [
                    { text: 'Voir Profil', icon: '👤', href: 'profile.html' },
                    { text: 'Paramètres', icon: '⚙️', href: 'settings.html' },
                    { text: 'FAQ', icon: '❓', href: '#faq' },
                    { text: 'Déconnexion', icon: '🚪', href: 'login.html' }
                ];
                
                menuItems.forEach(item => {
                    const menuItem = document.createElement('a');
                    menuItem.href = item.href;
                    menuItem.innerHTML = `<span class="menu-icon">${item.icon}</span> ${item.text}`;
                    menu.appendChild(menuItem);
                });
                
                document.querySelector('.profile').appendChild(menu);
            }
        };
        
        const toggleProfileMenu = () => {
            createProfileMenu();
            
            const menu = document.querySelector('.profile-menu');
            
            menu.classList.toggle('active');
            
            if (menu.classList.contains('active')) {
                document.addEventListener('click', closeMenuOnClickOutside);
            } else {
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        };
        
        const closeMenuOnClickOutside = (event) => {
            const menu = document.querySelector('.profile-menu');
            const profile = document.querySelector('.profile');
            
            if (!profile.contains(event.target)) {
                menu.classList.remove('active');
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        };
        
        profilePic.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleProfileMenu();
        });
    }

    const initQuiz = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('id');
        
        const currentQuizData = quizData.find(quiz => quiz.id === quizId);
        
        if (!currentQuizData) {
            window.location.href = 'main.html';
            return;
        }
        
        let currentQuestionIndex = 0;
        let score = 0;
        let timer;
        let timeLeft;
        let isAnswered = false;
        
        const timerBar = document.getElementById('timer-bar');
        const timerSeconds = document.getElementById('timer-seconds');
        const questionText = document.getElementById('question-text');
        const currentQuestionSpan = document.getElementById('current-question');
        const totalQuestionsSpan = document.getElementById('total-questions');
        const answerCards = document.querySelectorAll('.answer-card');
        const feedbackOverlay = document.getElementById('feedback-overlay');
        const feedbackModal = document.getElementById('feedback-modal');
        
        function init() {
            document.title = `${currentQuizData.title} - ThinkUp`;
            
            document.getElementById('quiz-title').textContent = currentQuizData.title;
            
            totalQuestionsSpan.textContent = currentQuizData.questions.length;
            
            loadQuestion(0);
            
            answerCards.forEach(card => {
                card.addEventListener('click', handleAnswerClick);
            });
        }
        
        function loadQuestion(index) {
            if (index >= currentQuizData.questions.length) {
                endQuiz();
                return;
            }
            
            isAnswered = false;
            currentQuestionIndex = index;
            const question = currentQuizData.questions[index];
            
            questionText.textContent = question.text;
            currentQuestionSpan.textContent = index + 1;
            
            answerCards.forEach((card, i) => {
                card.querySelector('.answer-text').textContent = question.options[i];
                card.classList.remove('disabled');
            });
            
            startTimer(question.timeLimit);
        }
        
        function startTimer(seconds) {
            clearInterval(timer);
            timeLeft = seconds;
            timerSeconds.textContent = timeLeft;
            timerBar.style.transition = 'none';
            timerBar.style.width = '100%';
            timerBar.style.backgroundColor = '#4CAF50';
            
            void timerBar.offsetWidth;
            
            timerBar.style.transition = `width ${seconds}s linear`;
            timerBar.style.width = '0%';
            
            const warningThreshold = Math.ceil(seconds * 0.2);
            
            timer = setInterval(() => {
                timeLeft--;
                timerSeconds.textContent = timeLeft;
                
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
        
        function handleAnswerClick() {
            if (isAnswered) return;
            
            isAnswered = true;
            clearInterval(timer);
            
            const selectedOption = parseInt(this.dataset.option);
            const correctOption = currentQuizData.questions[currentQuestionIndex].correctOption;
            const totalTime = currentQuizData.questions[currentQuestionIndex].timeLimit;
            
            answerCards.forEach(card => {
                card.classList.add('disabled');
            });
            
            if (selectedOption === correctOption) {
                const pointsEarned = 100 + Math.round(100 * (timeLeft / totalTime));
                
                feedbackModal.className = 'feedback-modal correct';
                feedbackModal.querySelector('.feedback-icon').textContent = '✓';
                feedbackModal.querySelector('.feedback-text').textContent = 'Correct!';
                feedbackModal.querySelector('.points').textContent = `+${pointsEarned} points`;
                score += pointsEarned;
                
                let timeBonus = feedbackModal.querySelector('.time-bonus');
                if (!timeBonus) {
                    timeBonus = document.createElement('div');
                    timeBonus.className = 'time-bonus';
                    feedbackModal.insertBefore(timeBonus, feedbackModal.querySelector('.waiting-text'));
                }
                timeBonus.textContent = `Bonus de rapidité: ${Math.round((timeLeft/totalTime) * 100)}%`;
                
                const existingCorrectAnswer = feedbackModal.querySelector('.correct-answer');
                if (existingCorrectAnswer) {
                    feedbackModal.removeChild(existingCorrectAnswer);
                }
            } else {
                feedbackModal.className = 'feedback-modal incorrect';
                feedbackModal.querySelector('.feedback-icon').textContent = '✗';
                feedbackModal.querySelector('.feedback-text').textContent = 'Incorrect!';
                feedbackModal.querySelector('.points').textContent = '+0 points';
                
                const correctAnswerText = currentQuizData.questions[currentQuestionIndex].options[correctOption];
                let correctAnswer = feedbackModal.querySelector('.correct-answer');
                if (!correctAnswer) {
                    correctAnswer = document.createElement('div');
                    correctAnswer.className = 'correct-answer';
                    feedbackModal.insertBefore(correctAnswer, feedbackModal.querySelector('.waiting-text'));
                }
                correctAnswer.textContent = `Réponse correcte: ${correctAnswerText}`;
                
                const existingTimeBonus = feedbackModal.querySelector('.time-bonus');
                if (existingTimeBonus) {
                    feedbackModal.removeChild(existingTimeBonus);
                }
            }
            
            feedbackOverlay.classList.add('active');
            
            setTimeout(() => {
                feedbackOverlay.classList.remove('active');
                loadQuestion(currentQuestionIndex + 1);
            }, 3000);
        }
        
        function handleTimeout() {
            isAnswered = true;
            
            answerCards.forEach(card => {
                card.classList.add('disabled');
            });

            feedbackModal.className = 'feedback-modal timeout';
            feedbackModal.querySelector('.feedback-icon').textContent = '⏱';
            feedbackModal.querySelector('.feedback-text').textContent = 'Temps écoulé!';
            feedbackModal.querySelector('.points').textContent = '+0 points';
            
            const correctOption = currentQuizData.questions[currentQuestionIndex].correctOption;
            const correctAnswerText = currentQuizData.questions[currentQuestionIndex].options[correctOption];
            let correctAnswer = feedbackModal.querySelector('.correct-answer');
            if (!correctAnswer) {
                correctAnswer = document.createElement('div');
                correctAnswer.className = 'correct-answer';
                feedbackModal.insertBefore(correctAnswer, feedbackModal.querySelector('.waiting-text'));
            }
            correctAnswer.textContent = `Réponse correcte: ${correctAnswerText}`;
            
            const existingTimeBonus = feedbackModal.querySelector('.time-bonus');
            if (existingTimeBonus) {
                feedbackModal.removeChild(existingTimeBonus);
            }
            
            feedbackOverlay.classList.add('active');
            
            setTimeout(() => {
                feedbackOverlay.classList.remove('active');
                loadQuestion(currentQuestionIndex + 1);
            }, 3000);
        }
        
        function endQuiz() {
            document.querySelector('.timer-container').style.display = 'none';
            document.querySelector('.question-container').style.display = 'none';
            
            const answersGrid = document.querySelector('.answers-grid');
            answersGrid.innerHTML = `
                <div class="results-container">
                    <h2>Quiz Terminé!</h2>
                    <p class="final-score">Votre score: ${score}</p>
                    <button class="btn" onclick="window.location.href='main.html'">Retour à l'Accueil</button>
                </div>
            `;
        }
        
        init();
    };

    // Initialisation de la page quiz si nous sommes sur cette page
    if (document.querySelector('.quiz-container')) {
        initQuiz();
    }
});