import { getAllQuizzes, getQuiz } from './api.js';
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
    
    // Au début du fichier script.js, ajoutez cet import
// Import the required functions from the API module


// ... rest of the code

// Puis remplacez les fonctions renderQuizCards et renderRecommendedQuizzes

const renderQuizCards = async () => {
    const quizCardsContainer = document.getElementById('quiz-cards');
    
    if (quizCardsContainer) {
        try {
            // Afficher un indicateur de chargement
            quizCardsContainer.innerHTML = '<div class="loading">Chargement des quiz...</div>';
            
            // Récupérer les quiz depuis l'API
            const quizzes = await getAllQuizzes();
            
            // Vider le conteneur
            quizCardsContainer.innerHTML = '';
            
            // Si aucun quiz n'est trouvé
            if (quizzes.length === 0) {
                quizCardsContainer.innerHTML = '<p>Aucun quiz disponible.</p>';
                return;
            }
            
            // Afficher chaque quiz
            quizzes.forEach(quiz => {
                const quizCard = document.createElement('div');
                quizCard.className = 'quiz-card';
                
                // Utiliser une image par défaut si imageUrl n'est pas défini
                const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
                
                quizCard.innerHTML = `
                    <img src="${imageUrl}" alt="${quiz.title}" class="quiz-card-image">
                    <div class="quiz-card-content">
                        <h3 class="quiz-card-title">${quiz.title}</h3>
                        <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                        <div class="quiz-card-meta">
                            <span>Par ${quiz.author || 'Anonyme'}</span>
                            <span class="quiz-card-category">${quiz.category || 'Divers'}</span>
                        </div>
                        <div class="quiz-card-actions">
                            <a href="quiz.html?id=${quiz.id}" class="quiz-card-btn">Jouer</a>
                        </div>
                    </div>
                `;
                quizCardsContainer.appendChild(quizCard);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des quiz:', error);
            quizCardsContainer.innerHTML = '<p>Impossible de charger les quiz. Veuillez réessayer plus tard.</p>';
        }
    }
};

const renderRecommendedQuizzes = async () => {
    const recommendedContainer = document.getElementById('recommended-quiz-cards');
    
    if (recommendedContainer) {
        try {
            // Afficher un indicateur de chargement
            recommendedContainer.innerHTML = '<div class="loading">Chargement des recommandations...</div>';
            
            // Récupérer les quiz depuis l'API
            const quizzes = await getAllQuizzes();
            
            // Vider le conteneur
            recommendedContainer.innerHTML = '';
            
            // Si aucun quiz n'est trouvé
            if (quizzes.length === 0) {
                recommendedContainer.innerHTML = '<p>Aucune recommandation disponible.</p>';
                return;
            }
            
            // Afficher jusqu'à 3 quiz recommandés
            const numberOfQuizzesToShow = Math.min(3, quizzes.length);
            
            for (let i = 0; i < numberOfQuizzesToShow; i++) {
                const quiz = quizzes[i];
                const quizCard = document.createElement('div');
                quizCard.className = 'quiz-card';
                
                let tagName = "";
                let tagClass = "";
                
                if (i === 0) {
                    tagName = "Populaire";
                    tagClass = "popular-tag";
                } else if (i === 1) {
                    tagName = "Nouveau"; 
                    tagClass = "new-tag";
                } else if (i === 2) {
                    tagName = "Recommandé";
                    tagClass = "recommended-tag";
                }
                
                // Utiliser une image par défaut si imageUrl n'est pas défini
                const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
                
                quizCard.innerHTML = `
                    <div class="quiz-card-tag ${tagClass}">${tagName}</div>
                    <img src="${imageUrl}" alt="${quiz.title}" class="quiz-card-image">
                    <div class="quiz-card-content">
                        <h3 class="quiz-card-title">${quiz.title}</h3>
                        <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                        <div class="quiz-card-meta">
                            <span>Par ${quiz.author || 'Anonyme'}</span>
                            <span class="quiz-card-category">${quiz.category || 'Divers'}</span>
                        </div>
                        <div class="quiz-card-info">
                            <span class="quiz-questions-count">${quiz.questionCount || 0} questions</span>
                            <span class="quiz-time-estimate">${quiz.estimatedTime || 5} min</span>
                        </div>
                        <div class="quiz-card-actions">
                            <a href="quiz.html?id=${quiz.id}" class="quiz-card-btn">Jouer</a>
                        </div>
                    </div>
                `;
                recommendedContainer.appendChild(quizCard);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des recommandations:', error);
            recommendedContainer.innerHTML = '<p>Impossible de charger les recommandations. Veuillez réessayer plus tard.</p>';
        }
    }
};
    
const initQuiz = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    
    if (!quizId) {
        window.location.href = 'main.html';
        return;
    }
    
    try {
        // Afficher un indicateur de chargement
        const quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) {
            quizContainer.innerHTML = '<div class="loading">Chargement du quiz...</div>';
        }
        
        // Récupérer le quiz depuis l'API
        const currentQuizData = await getQuiz(quizId);
        
        if (!currentQuizData) {
            window.location.href = 'main.html';
            return;
        }
        
        // Restaurer le contenu du quiz
        if (quizContainer) {
            quizContainer.innerHTML = `
                <h1 id="quiz-title"></h1>
                <div class="timer-container">
                    <div class="timer">
                        <div class="timer-bar" id="timer-bar"></div>
                        <div class="timer-count"><span id="timer-seconds">30</span>s</div>
                    </div>
                </div>
                <div class="question-container">
                    <div class="question-header">
                        <span>Question <span id="current-question">1</span>/<span id="total-questions">10</span></span>
                    </div>
                    <h2 id="question-text"></h2>
                </div>
                <div class="answers-grid">
                    <div class="answer-card" data-option="0">
                        <div class="answer-content">
                            <span class="answer-letter">A</span>
                            <span class="answer-text"></span>
                        </div>
                    </div>
                    <div class="answer-card" data-option="1">
                        <div class="answer-content">
                            <span class="answer-letter">B</span>
                            <span class="answer-text"></span>
                        </div>
                    </div>
                    <div class="answer-card" data-option="2">
                        <div class="answer-content">
                            <span class="answer-letter">C</span>
                            <span class="answer-text"></span>
                        </div>
                    </div>
                    <div class="answer-card" data-option="3">
                        <div class="answer-content">
                            <span class="answer-letter">D</span>
                            <span class="answer-text"></span>
                        </div>
                    </div>
                </div>
                <div id="feedback-overlay" class="feedback-overlay">
                    <div id="feedback-modal" class="feedback-modal">
                        <div class="feedback-icon">✓</div>
                        <div class="feedback-text">Correct!</div>
                        <div class="points">+100 points</div>
                        <div class="waiting-text">Prochaine question dans <span class="countdown">3</span>...</div>
                    </div>
                </div>
            `;
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
            
            // S'assurer que questions existe et est un tableau
            if (!currentQuizData.questions || !Array.isArray(currentQuizData.questions)) {
                currentQuizData.questions = [];
            }
            
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
            
            // S'assurer que options existe et est un tableau
            if (!question.options || !Array.isArray(question.options)) {
                question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
            }
            
            answerCards.forEach((card, i) => {
                if (i < question.options.length) {
                    card.style.display = 'block';
                    card.querySelector('.answer-text').textContent = question.options[i];
                    card.classList.remove('disabled');
                } else {
                    card.style.display = 'none'; // Cacher les options supplémentaires si moins de 4 options
                }
            });
            
            // Utiliser timeLimit s'il existe, sinon 30 secondes par défaut
            const timeLimit = question.timeLimit || 30;
            startTimer(timeLimit);
        }
        
        function startTimer(seconds) {
            clearInterval(timer);
            timeLeft = seconds;
            timerSeconds.textContent = timeLeft;
            timerBar.style.transition = 'none';
            timerBar.style.width = '100%';
            timerBar.style.backgroundColor = '#4CAF50';
            
            // Force reflow
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
            const totalTime = currentQuizData.questions[currentQuestionIndex].timeLimit || 30;
            
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
            
            // Mise à jour du compte à rebours
            const countdownElement = feedbackModal.querySelector('.countdown');
            let countdown = 3;
            countdownElement.textContent = countdown;
            
            const countdownTimer = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
            
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
            
            // Mise à jour du compte à rebours
            const countdownElement = feedbackModal.querySelector('.countdown');
            let countdown = 3;
            countdownElement.textContent = countdown;
            
            const countdownTimer = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
            
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
    } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
        // Afficher un message d'erreur à l'utilisateur
        const quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="error-message">
                    <h2>Impossible de charger le quiz</h2>
                    <p>Une erreur est survenue lors du chargement du quiz. Veuillez réessayer plus tard.</p>
                    <a href="main.html" class="btn">Retourner à l'accueil</a>
                </div>
            `;
        }
    }
};
    
    const initCreateQuiz = () => {
        let questionCount = 1;
        
        const setupCorrectToggles = () => {
            document.querySelectorAll('.correct-toggle').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const questionCard = this.closest('.question-card');
                    questionCard.querySelectorAll('.correct-toggle').forEach(t => {
                        t.setAttribute('data-correct', 'false');
                        t.classList.remove('active');
                    });
                    
                    this.setAttribute('data-correct', 'true');
                    this.classList.add('active');
                });
            });
        };
        
        setupCorrectToggles();
        
        const addQuestionBtn = document.getElementById('add-question');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', function() {
                questionCount++;
                
                const newQuestion = document.querySelector('.question-card').cloneNode(true);
                newQuestion.id = `question-${questionCount}`;
                
                newQuestion.querySelector('h2').textContent = `Question ${questionCount}`;
                
                newQuestion.querySelectorAll('input[type="text"]').forEach(input => {
                    input.value = '';
                });
                
                newQuestion.querySelectorAll('.correct-toggle').forEach(toggle => {
                    toggle.setAttribute('data-correct', 'false');
                    toggle.classList.remove('active');
                });
                
                newQuestion.querySelector(`[id^="question-text-"]`).id = `question-text-${questionCount}`;
                newQuestion.querySelector(`[id^="question-time-"]`).id = `question-time-${questionCount}`;
                
                document.querySelector('.questions-container').appendChild(newQuestion);
                
                setupCorrectToggles();
                
                setupDeleteButtons();
                
                newQuestion.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        const setupDeleteButtons = () => {
            document.querySelectorAll('.btn-icon').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (document.querySelectorAll('.question-card').length > 1) {
                        const card = this.closest('.question-card');
                        card.remove();
                        
                        document.querySelectorAll('.question-card').forEach((card, index) => {
                            const num = index + 1;
                            card.id = `question-${num}`;
                            card.querySelector('h2').textContent = `Question ${num}`;
                        });
                        
                        questionCount = document.querySelectorAll('.question-card').length;
                    } else {
                        alert('Vous devez avoir au moins une question dans votre quiz.');
                    }
                });
            });
        };
        
        setupDeleteButtons();
        
        const completeQuizBtn = document.getElementById('complete-quiz');
        if (completeQuizBtn) {
            completeQuizBtn.addEventListener('click', function() {
                alert('Quiz terminé! Dans une application réelle, cela enregistrerait votre quiz.');
            });
        }
    };
    
    const initLoginPage = () => {
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
        
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                alert('Connexion réussie! Redirection vers la page d\'accueil...');
                
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 500);
            });
        }
    };

    const initSettingsPage = () => {
        initSettingsTabs();
        
        initModals();
        
        initActionButtons();
        
        initToggles();
        
        initAppearanceSelectors();
    };
    
    function initSettingsTabs() {
        const navItems = document.querySelectorAll('.settings-nav-item');
        
        if (!navItems.length) return;
        
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.settings-nav-item').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                document.querySelectorAll('.settings-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                this.classList.add('active');
                
                const sectionId = this.getAttribute('data-section') + '-section';
                document.getElementById(sectionId).classList.add('active');
            });
        });
    }
    
    function initModals() {
        const editModal = document.getElementById('edit-modal');
        if (!editModal) return;
        
        const modalTitle = document.getElementById('modal-title');
        const modalFields = document.getElementById('modal-fields');
        const closeModalBtn = document.querySelector('.close-modal');
        const cancelBtns = document.querySelectorAll('.cancel-btn');
        
        initNameEditor();
        initUsernameEditor();
        initBioEditor();
        initEmailEditor();
        initPasswordEditor();
        
        initDeleteConfirmation();
        
        function closeModal() {
            document.querySelectorAll('.edit-modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }
        
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-modal')) {
                closeModal();
            }
        });
        
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                setTimeout(() => {
                    alert('Modifications enregistrées avec succès!');
                    closeModal();
                }, 500);
            });
        }
        
        function initNameEditor() {
            const updateNameBtn = document.getElementById('update-name-btn');
            if (updateNameBtn) {
                updateNameBtn.addEventListener('click', function() {
                    modalTitle.textContent = 'Modifier vos informations';
                    modalFields.innerHTML = `
                        <div class="form-field">
                            <label for="edit-firstname">Prénom</label>
                            <input type="text" id="edit-firstname" value="Martin" required>
                        </div>
                        <div class="form-field">
                            <label for="edit-lastname">Nom</label>
                            <input type="text" id="edit-lastname" value="Dubois" required>
                        </div>
                    `;
                    editModal.style.display = 'block';
                });
            }
        }
        
        function initUsernameEditor() {
            const updateUsernameBtn = document.getElementById('update-username-btn');
            if (updateUsernameBtn) {
                updateUsernameBtn.addEventListener('click', function() {
                    modalTitle.textContent = 'Modifier votre nom d\'utilisateur';
                    modalFields.innerHTML = `
                        <div class="form-field">
                            <label for="edit-username">Nom d'utilisateur</label>
                            <input type="text" id="edit-username" value="martindubois" required>
                            <p class="field-info">Votre nom d'utilisateur est unique et visible par tous les utilisateurs.</p>
                        </div>
                    `;
                    editModal.style.display = 'block';
                });
            }
        }
        
        function initBioEditor() {
            const updateBioBtn = document.getElementById('update-bio-btn');
            if (updateBioBtn) {
                updateBioBtn.addEventListener('click', function() {
                    modalTitle.textContent = 'Modifier votre bio';
                    modalFields.innerHTML = `
                        <div class="form-field">
                            <label for="edit-bio">Bio</label>
                            <textarea id="edit-bio" rows="4">Passionné de quiz et de jeux de connaissances. J'aime créer des quiz sur l'histoire et la science.</textarea>
                            <p class="field-info">Votre bio est visible sur votre profil public (maximum 160 caractères).</p>
                        </div>
                    `;
                    editModal.style.display = 'block';
                });
            }
        }
        
        function initEmailEditor() {
            const updateEmailBtn = document.getElementById('update-email-btn');
            if (updateEmailBtn) {
                updateEmailBtn.addEventListener('click', function() {
                    modalTitle.textContent = 'Modifier votre adresse e-mail';
                    modalFields.innerHTML = `
                        <div class="form-field">
                            <label for="edit-email">Nouvelle adresse e-mail</label>
                            <input type="email" id="edit-email" value="user@example.com" required>
                        </div>
                        <div class="form-field">
                            <label for="confirm-password">Mot de passe actuel</label>
                            <input type="password" id="confirm-password" placeholder="Entrez votre mot de passe pour confirmer" required>
                        </div>
                    `;
                    editModal.style.display = 'block';
                });
            }
        }
        
        function initPasswordEditor() {
            const updatePasswordBtn = document.getElementById('update-password-btn');
            if (updatePasswordBtn) {
                updatePasswordBtn.addEventListener('click', function() {
                    modalTitle.textContent = 'Modifier votre mot de passe';
                    modalFields.innerHTML = `
                        <div class="form-field">
                            <label for="current-password">Mot de passe actuel</label>
                            <input type="password" id="current-password" required>
                        </div>
                        <div class="form-field">
                            <label for="new-password">Nouveau mot de passe</label>
                            <input type="password" id="new-password" required>
                            <p class="field-info">Le mot de passe doit contenir au moins 8 caractères avec un mélange de lettres, chiffres et symboles.</p>
                        </div>
                        <div class="form-field">
                            <label for="confirm-new-password">Confirmer le nouveau mot de passe</label>
                            <input type="password" id="confirm-new-password" required>
                        </div>
                    `;
                    editModal.style.display = 'block';
                });
            }
        }
        
        function initDeleteConfirmation() {
            const deleteAccountBtn = document.getElementById('delete-account-btn');
            const confirmModal = document.getElementById('confirm-modal');
            const confirmBtn = document.querySelector('.confirm-btn');
            
            if (deleteAccountBtn && confirmModal) {
                deleteAccountBtn.addEventListener('click', function() {
                    confirmModal.style.display = 'block';
                });
                
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', function() {
                        alert('Votre compte a été supprimé définitivement.');
                        window.location.href = 'main.html';
                    });
                }
            }
        }
    }
    
    function initActionButtons() {
        const saveSettingsBtn = document.getElementById('save-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', function() {
                setTimeout(() => {
                    alert('Paramètres enregistrés avec succès!');
                }, 500);
            });
        }
        
        if (cancelSettingsBtn) {
            cancelSettingsBtn.addEventListener('click', function() {
                if (confirm('Êtes-vous sûr de vouloir annuler? Les modifications non enregistrées seront perdues.')) {
                    window.location.href = 'main.html';
                }
            });
        }
        
        const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
        if (uploadAvatarBtn) {
            uploadAvatarBtn.addEventListener('click', function() {
                alert('Dans une application réelle, cela ouvrirait un sélecteur de fichier pour télécharger une nouvelle photo de profil.');
            });
        }
    }
    
    function initToggles() {
        const toggleSwitches = document.querySelectorAll('.toggle-switch');
        
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        });
    }
    
    function initAppearanceSelectors() {
        const themeBtns = document.querySelectorAll('.theme-btn');
        
        themeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                themeBtns.forEach(b => b.classList.remove('active'));
                
                this.classList.add('active');
                
                const theme = this.getAttribute('data-theme');
                
                if (theme === 'dark') {
                    document.body.classList.add('dark-mode');
                } else if (theme === 'light') {
                    document.body.classList.remove('dark-mode');
                } else if (theme === 'system') {
                    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDarkMode) {
                        document.body.classList.add('dark-mode');
                    } else {
                        document.body.classList.remove('dark-mode');
                    }
                }
            });
        });
        
        const textSizeBtns = document.querySelectorAll('.text-size-btn');
        
        textSizeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                textSizeBtns.forEach(b => b.classList.remove('active'));
                
                this.classList.add('active');
                
                const size = this.getAttribute('data-size');
                
                document.body.classList.remove('text-small', 'text-medium', 'text-large');
                
                if (size === 'small' || size === 'large') {
                    document.body.classList.add(`text-${size}`);
                }
            });
        });
    }

    const initSearchPage = () => {
        const searchTabs = document.querySelectorAll('.search-tab');
        if (!searchTabs.length) return;
        
        searchTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.search-tab').forEach(t => {
                    t.classList.remove('active');
                });
                document.querySelectorAll('.results-section').forEach(s => {
                    s.classList.remove('active');
                });
                
                const tabName = this.getAttribute('data-tab');
                this.classList.add('active');
                document.getElementById(`${tabName}-results`).classList.add('active');
            });
        });
        
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                const categoryFilter = document.getElementById('category-filter');
                if (categoryFilter) {
                    if (filter === 'users') {
                        categoryFilter.style.display = 'none';
                    } else {
                        categoryFilter.style.display = 'flex';
                    }
                }
            });
        });
        
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            const searchTermDisplay = document.getElementById('search-term');
            
            if (searchTerm && searchTermDisplay) {
                searchTermDisplay.textContent = searchTerm;
                document.getElementById('results-number').textContent = '5 résultats trouvés';
            }
        }
        
        const pageButtons = document.querySelectorAll('.page-num');
        if (pageButtons.length) {
            pageButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const currentPage = document.querySelector('.page-num.active');
                    if (currentPage) {
                        currentPage.classList.remove('active');
                    }
                    this.classList.add('active');
                    
                    const prevBtn = this.closest('.pagination').querySelector('.prev');
                    const nextBtn = this.closest('.pagination').querySelector('.next');
                    
                    if (this.textContent === '1') {
                        prevBtn.setAttribute('disabled', 'true');
                    } else {
                        prevBtn.removeAttribute('disabled');
                    }
                    
                    const isLastPage = this.textContent === '8' || this.textContent === '3';
                    if (isLastPage) {
                        nextBtn.setAttribute('disabled', 'true');
                    } else {
                        nextBtn.removeAttribute('disabled');
                    }
                });
            });
        }
        
        const prevButtons = document.querySelectorAll('.page-btn.prev');
        const nextButtons = document.querySelectorAll('.page-btn.next');
        
        prevButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.hasAttribute('disabled')) return;
                
                const activePage = this.closest('.pagination').querySelector('.page-num.active');
                if (activePage && activePage.previousElementSibling && activePage.previousElementSibling.classList.contains('page-num')) {
                    activePage.classList.remove('active');
                    activePage.previousElementSibling.classList.add('active');
                    
                    if (activePage.previousElementSibling.textContent === '1') {
                        this.setAttribute('disabled', 'true');
                    }
                    
                    const nextBtn = this.closest('.pagination').querySelector('.next');
                    nextBtn.removeAttribute('disabled');
                }
            });
        });
        
        nextButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.hasAttribute('disabled')) return;
                
                const activePage = this.closest('.pagination').querySelector('.page-num.active');
                if (activePage && activePage.nextElementSibling && activePage.nextElementSibling.classList.contains('page-num')) {
                    activePage.classList.remove('active');
                    activePage.nextElementSibling.classList.add('active');
                    
                    const isLastPage = activePage.nextElementSibling.nextElementSibling === null || 
                                       !activePage.nextElementSibling.nextElementSibling.classList.contains('page-num');
                    
                    if (isLastPage) {
                        this.setAttribute('disabled', 'true');
                    }
                    
                    const prevBtn = this.closest('.pagination').querySelector('.prev');
                    prevBtn.removeAttribute('disabled');
                }
            });
        });
    }
    
    const initProfilePage = () => {
        const tabButtons = document.querySelectorAll('.tab-btn');
        if (!tabButtons.length) return;
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.remove('active');
                });
                
                const tabName = this.getAttribute('data-tab');
                this.classList.add('active');
                document.getElementById(`${tabName}-content`).classList.add('active');
            });
        });
    }

    if (document.querySelector('.quiz-container')) {
        initQuiz();
    } else if (document.getElementById('quiz-cards')) {
        renderQuizCards();
        
        if (document.getElementById('recommended-quiz-cards')) {
            renderRecommendedQuizzes();
        }
    } else if (document.querySelector('.questions-container')) {
        initCreateQuiz();
    } else if (document.querySelector('.login-form')) {
        initLoginPage();
    } else if (document.querySelector('.settings-container')) {
        initSettingsPage();
    } else if (document.querySelector('.search-container')) {
        initSearchPage();
    } else if (document.querySelector('.profile-container')) {
        initProfilePage();
    }

    
});