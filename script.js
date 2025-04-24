import { getAllQuizzes, getQuiz } from './api.js';

// Fonction pour vérifier si l'utilisateur connecté est le créateur du quiz
function isUserQuizCreator(creatorName) {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    
    try {
        // Décoder le JWT pour obtenir le nom d'utilisateur
        const parseJWT = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        };
        
        const decoded = parseJWT(token);
        return decoded && decoded.username === creatorName;
    } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
        return false;
    }
}

// Fonction pour obtenir le token d'authentification
function getAuthToken() {
    return localStorage.getItem('jwt');
}

// Fonction pour créer les headers d'authentification
function createAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

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
    
    // Fonction pour afficher les cartes de quiz
    const renderQuizCards = () => {
        const quizCardsContainer = document.getElementById('quiz-cards');
        
        if (quizCardsContainer) {
            quizCardsContainer.innerHTML = '<div class="loading">Chargement des quiz...</div>';
            
            fetch('http://localhost:8000/api/quizzes', {
                headers: createAuthHeaders()
            })
                .then(response => response.json())
                .then(data => {
                    quizCardsContainer.innerHTML = '';
                    
                    if (data.count === 0) {
                        quizCardsContainer.innerHTML = `<p>${data.message || 'Aucun quiz disponible'}</p>`;
                        return;
                    }
                    
                    data.quizzes.forEach(quiz => {
                        const quizCard = document.createElement('div');
                        quizCard.className = 'quiz-card';
                        
                        const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
                        
                        // Vérifier si l'utilisateur est le créateur du quiz
                        const isCreator = isUserQuizCreator(quiz.nomCreateur);
                        
                        quizCard.innerHTML = `
                            <img src="${imageUrl}" alt="${quiz.nom}" class="quiz-card-image">
                            <div class="quiz-card-content">
                                <h3 class="quiz-card-title">${quiz.nom}</h3>
                                <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                                <div class="quiz-card-meta">
                                    <span>Par ${quiz.nomCreateur || 'Anonyme'}</span>
                                    <span class="quiz-card-category">${quiz.categorie || 'Divers'}</span>
                                </div>
                                <div class="quiz-card-actions">
                                    <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                                    ${isCreator ? `<a href="editQuiz.html?id=${quiz.id_quiz}" class="quiz-card-btn edit-btn">Modifier</a>` : ''}
                                </div>
                            </div>
                        `;
                        quizCardsContainer.appendChild(quizCard);
                    });
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    quizCardsContainer.innerHTML = '<p>Erreur de chargement</p>';
                });
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
                    
                    // Vérifier si l'utilisateur est le créateur du quiz
                    const isCreator = isUserQuizCreator(quiz.nomCreateur);
                    
                    // Utiliser une image par défaut si imageUrl n'est pas défini
                    const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
                    
                    quizCard.innerHTML = `
                        <div class="quiz-card-tag ${tagClass}">${tagName}</div>
                        <img src="${imageUrl}" alt="${quiz.nom}" class="quiz-card-image">
                        <div class="quiz-card-content">
                            <h3 class="quiz-card-title">${quiz.nom}</h3>
                            <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                            <div class="quiz-card-meta">
                                <span>Par ${quiz.nomCreateur || 'Anonyme'}</span>
                                <span class="quiz-card-category">${quiz.categorie || 'Divers'}</span>
                            </div>
                            <div class="quiz-card-info">
                                <span class="quiz-questions-count">${quiz.nbQuestions || 0} questions</span>
                                <span class="quiz-time-estimate">${quiz.estimatedTime || 5} min</span>
                            </div>
                            <div class="quiz-card-actions">
                                <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                                ${isCreator ? `<a href="editQuiz.html?id=${quiz.id_quiz}" class="quiz-card-btn edit-btn">Modifier</a>` : ''}
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
            console.error("ID de quiz manquant dans l'URL");
            window.location.href = 'main.html';
            return;
        }
        
        console.log("Chargement du quiz avec l'ID:", quizId);
        
        try {
            // Afficher un indicateur de chargement
            const quizContainer = document.querySelector('.quiz-container');
            if (quizContainer) {
                quizContainer.innerHTML = '<div class="loading">Chargement du quiz...</div>';
            }
            
            // Appel direct à l'API pour récupérer le quiz avec authentification
            const response = await fetch(`http://localhost:8000/api/quizzes/${quizId}`, {
                headers: createAuthHeaders()
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erreur API:", errorText);
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const currentQuizData = await response.json();
            console.log("Données du quiz reçues:", currentQuizData);
            
            if (!currentQuizData) {
                console.error("Données du quiz vides");
                throw new Error("Données du quiz vides");
            }
            
            // Restaurer le contenu du quiz
            if (quizContainer) {
                quizContainer.innerHTML = `
                    <h1 id="quiz-title">${currentQuizData.nom || currentQuizData.title || "Quiz sans titre"}</h1>
                    <div class="timer-container">
                        <div class="timer">
                            <div class="timer-bar" id="timer-bar"></div>
                            <div class="timer-count"><span id="timer-seconds">30</span>s</div>
                        </div>
                    </div>
                    <div class="question-container">
                        <div class="question-header">
                            <span>Question <span id="current-question">1</span>/<span id="total-questions">${currentQuizData.questions ? currentQuizData.questions.length : 0}</span></span>
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
                document.title = `${currentQuizData.nom || currentQuizData.title || "Quiz"} - ThinkUp`;
                
                document.getElementById('quiz-title').textContent = currentQuizData.nom || currentQuizData.title || "Quiz";
                
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
                
                // Afficher les détails de la question dans la console
                console.log("Question en cours de chargement:", question);
                
                // Déterminer le texte de la question (compatibilité avec différentes structures)
                questionText.textContent = question.texte_question || question.text || "Question sans texte";
                currentQuestionSpan.textContent = index + 1;
                
                // Extraire et formater les options de réponses selon la structure des données
                let options = [];
                let correctOption = 0;
                
                // Vérifier comment sont structurées les réponses et extraire les bonnes données
                if (Array.isArray(question.reponses)) {
                    // Format avec reponses comme objets (texte_reponse et bonne_reponse)
                    if (typeof question.reponses[0] === 'object') {
                        options = question.reponses.map(rep => rep.texte_reponse || "");
                        question.reponses.forEach((rep, idx) => {
                            if (rep.bonne_reponse === 1) correctOption = idx;
                        });
                    } 
                    // Format avec reponses comme tableau de chaînes
                    else if (typeof question.reponses[0] === 'string') {
                        options = question.reponses;
                        correctOption = question.bonneReponse || 0;
                    }
                } else if (Array.isArray(question.options)) {
                    // Format avec options et correctOption séparés
                    options = question.options;
                    correctOption = question.correctOption || 0;
                }
                
                console.log("Options chargées:", options);
                console.log("Option correcte:", correctOption);
                
                // S'assurer qu'on a au moins quatre options (compléter avec des vides si nécessaire)
                while (options.length < 4) {
                    options.push("");
                }
                
                // Affichage des options (maximum 4)
                options = options.slice(0, 4);
                
                answerCards.forEach((card, i) => {
                    if (i < options.length) {
                        card.style.display = 'block';
                        card.querySelector('.answer-text').textContent = options[i];
                        card.classList.remove('disabled');
                    } else {
                        card.style.display = 'none'; // Cacher les options supplémentaires si moins de 4 options
                    }
                });
                
                // Définir la limite de temps
                const timeLimit = question.tempsReponse || question.timeLimit || 30;
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
                const question = currentQuizData.questions[currentQuestionIndex];
                
                // Déterminer l'option correcte selon la structure des données
                let correctOption = 0;
                if (Array.isArray(question.reponses) && typeof question.reponses[0] === 'object') {
                    question.reponses.forEach((rep, idx) => {
                        if (rep.bonne_reponse === 1) correctOption = idx;
                    });
                } else if (question.bonneReponse !== undefined) {
                    correctOption = question.bonneReponse;
                } else if (question.correctOption !== undefined) {
                    correctOption = question.correctOption;
                }
                
                const totalTime = question.tempsReponse || question.timeLimit || 30;
                
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
                    
                    // Récupérer le texte de la bonne réponse selon la structure
                    let correctAnswerText = "";
                    if (Array.isArray(question.reponses) && typeof question.reponses[0] === 'object') {
                        question.reponses.forEach(rep => {
                            if (rep.bonne_reponse === 1) correctAnswerText = rep.texte_reponse;
                        });
                    } else if (Array.isArray(question.reponses) && typeof question.reponses[0] === 'string') {
                        correctAnswerText = question.reponses[correctOption];
                    } else if (Array.isArray(question.options)) {
                        correctAnswerText = question.options[correctOption];
                    }
                    
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
                
                // Récupérer le texte de la bonne réponse
                const question = currentQuizData.questions[currentQuestionIndex];
                let correctOption = 0;
                let correctAnswerText = "";
                
                if (Array.isArray(question.reponses) && typeof question.reponses[0] === 'object') {
                    question.reponses.forEach((rep, idx) => {
                        if (rep.bonne_reponse === 1) {
                            correctOption = idx;
                            correctAnswerText = rep.texte_reponse;
                        }
                    });
                } else if (question.bonneReponse !== undefined && Array.isArray(question.reponses)) {
                    correctOption = question.bonneReponse;
                    correctAnswerText = question.reponses[correctOption];
                } else if (question.correctOption !== undefined && Array.isArray(question.options)) {
                    correctOption = question.correctOption;
                    correctAnswerText = question.options[correctOption];
                }
                
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
                        <p>Une erreur est survenue lors du chargement du quiz: ${error.message}</p>
                        <a href="main.html" class="btn">Retourner à l'accueil</a>
                    </div>
                `;
            }
        }
    };
    
    // Fonction pour mettre à jour un quiz avec authentification
    async function updateQuiz(quizId, quizData) {
        try {
            const response = await fetch(`http://localhost:8000/api/quizzes/${quizId}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(quizData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur lors de la mise à jour du quiz: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur updateQuiz:', error);
            alert(error.message);
            throw error;
        }
    }
    
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
            completeQuizBtn.addEventListener('click', async function() {
                try {
                    // Vérification de l'authentification
                    const token = getAuthToken();
                    if (!token) {
                        alert('Vous devez être connecté pour créer ou modifier un quiz.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const quizId = urlParams.get('id');
                    
                    const quizTitle = document.getElementById('quiz-title').value.trim();
                    const quizDescription = document.getElementById('quiz-description').value.trim();
                    const quizCategory = document.getElementById('quiz-category').value;
                    
                    if (!quizTitle) {
                        alert('Veuillez entrer un titre pour votre quiz.');
                        return;
                    }
                    
                    // Récupérer les questions
                    const questions = [];
                    document.querySelectorAll('.question-card').forEach((card, index) => {
                        const questionText = card.querySelector('[id^="question-text-"]').value.trim();
                        if (!questionText) {
                            alert(`Veuillez entrer un texte pour la question ${index + 1}.`);
                            return;
                        }
                        
                        const options = [];
                        let correctOption = -1;
                        
                        card.querySelectorAll('.answer-input').forEach((input, i) => {
                            const optionText = input.value.trim();
                            if (!optionText) {
                                alert(`Veuillez entrer un texte pour l'option ${i + 1} de la question ${index + 1}.`);
                                return;
                            }
                            
                            options.push(optionText);
                            
                            const isCorrect = card.querySelectorAll('.correct-toggle')[i].getAttribute('data-correct') === 'true';
                            if (isCorrect) {
                                correctOption = i;
                            }
                        });
                        
                        if (correctOption === -1) {
                            alert(`Veuillez sélectionner une réponse correcte pour la question ${index + 1}.`);
                            return;
                        }
                        
                        const timeLimit = parseInt(card.querySelector('[id^="question-time-"]').value || '30', 10);
                        
                        questions.push({
                            text: questionText,
                            options: options,
                            correctOption: correctOption,
                            timeLimit: timeLimit
                        });
                    });
                    
                    if (questions.length === 0) {
                        alert('Votre quiz doit contenir au moins une question.');
                        return;
                    }
                    
                    // Construire l'objet quiz
                    const quizData = {
                        title: quizTitle,
                        description: quizDescription,
                        category: quizCategory,
                        questions: questions
                    };
                    
                    // Mode édition ou création
                    if (quizId) {
                        // Mise à jour du quiz existant
                        await updateQuiz(quizId, quizData);
                        alert('Quiz mis à jour avec succès!');
                    } else {
                        // Création d'un nouveau quiz
                        const response = await fetch('http://localhost:8000/api/quizzes', {
                            method: 'POST',
                            headers: createAuthHeaders(),
                            body: JSON.stringify(quizData)
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Erreur lors de la création du quiz: ${errorText}`);
                        }
                        
                        alert('Quiz créé avec succès!');
                    }
                    
                    window.location.href = 'main.html';
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde du quiz:', error);
                    alert(`Une erreur est survenue: ${error.message}`);
                }
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
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Récupérer les valeurs du formulaire
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                
                if (!username || !password) {
                    alert('Veuillez remplir tous les champs.');
                    return;
                }
                
                try {
                    // Simuler une requête d'authentification (à remplacer par votre vrai API)
                    const response = await fetch('http://localhost:8000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username,
                            password
                        })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Erreur d'authentification: ${errorText}`);
                    }
                    
                    const data = await response.json();
                    
                    // Stocker le token dans le localStorage
                    localStorage.setItem('jwt', data.token);
                    
                    alert('Connexion réussie! Redirection vers la page d\'accueil...');
                    
                    setTimeout(() => {
                        window.location.href = 'main.html';
                    }, 500);
                } catch (error) {
                    console.error('Erreur de connexion:', error);
                    alert(`Échec de la connexion: ${error.message}`);
                }
            });
        }
        
        // Gestion du formulaire d'inscription
        const registerForm = document.querySelector('.register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Récupérer les valeurs du formulaire
                const firstname = document.getElementById('firstname').value.trim();
                const lastname = document.getElementById('lastname').value.trim();
                const username = document.getElementById('reg-username').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('reg-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                if (!firstname || !lastname || !username || !email || !password || !confirmPassword) {
                    alert('Veuillez remplir tous les champs.');
                    return;
                }
                
                if (password !== confirmPassword) {
                    alert('Les mots de passe ne correspondent pas.');
                    return;
                }
                
                try {
                    // Simuler une requête d'inscription (à remplacer par votre vrai API)
                    const response = await fetch('http://localhost:8000/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            firstname,
                            lastname,
                            username,
                            email,
                            password
                        })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Erreur d'inscription: ${errorText}`);
                    }
                    
                    alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
                    
                    // Rediriger vers la page de connexion ou afficher le formulaire de connexion
                    if (document.querySelector('.login-container') && document.querySelector('.register-container')) {
                        document.querySelector('.login-container').style.display = 'block';
                        document.querySelector('.register-container').style.display = 'none';
                    } else {
                        window.location.href = 'login.html';
                    }
                } catch (error) {
                    console.error('Erreur d\'inscription:', error);
                    alert(`Échec de l'inscription: ${error.message}`);
                }
            });
        }
        
        // Basculer entre les formulaires de connexion et d'inscription
        const toggleForms = document.querySelectorAll('.toggle-form');
        if (toggleForms.length > 0) {
            toggleForms.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const loginContainer = document.querySelector('.login-container');
                    const registerContainer = document.querySelector('.register-container');
                    
                    if (loginContainer && registerContainer) {
                        loginContainer.style.display = loginContainer.style.display === 'none' ? 'block' : 'none';
                        registerContainer.style.display = registerContainer.style.display === 'none' ? 'block' : 'none';
                    }
                });
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
            editForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    // Récupérer le token JWT
                    const token = getAuthToken();
                    if (!token) {
                        alert('Vous devez être connecté pour modifier vos informations.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    // Déterminer le type de mise à jour
                    const updateType = modalTitle.textContent.toLowerCase();
                    let endpoint = '';
                    let updateData = {};
                    
                    if (updateType.includes('informations')) {
                        endpoint = 'profile';
                        updateData = {
                            firstname: document.getElementById('edit-firstname').value.trim(),
                            lastname: document.getElementById('edit-lastname').value.trim()
                        };
                    } else if (updateType.includes('nom d\'utilisateur')) {
                        endpoint = 'username';
                        updateData = {
                            username: document.getElementById('edit-username').value.trim()
                        };
                    } else if (updateType.includes('bio')) {
                        endpoint = 'bio';
                        updateData = {
                            bio: document.getElementById('edit-bio').value.trim()
                        };
                    } else if (updateType.includes('e-mail')) {
                        endpoint = 'email';
                        updateData = {
                            email: document.getElementById('edit-email').value.trim(),
                            password: document.getElementById('confirm-password').value
                        };
                    } else if (updateType.includes('mot de passe')) {
                        endpoint = 'password';
                        updateData = {
                            currentPassword: document.getElementById('current-password').value,
                            newPassword: document.getElementById('new-password').value,
                            confirmPassword: document.getElementById('confirm-new-password').value
                        };
                        
                        if (updateData.newPassword !== updateData.confirmPassword) {
                            alert('Les nouveaux mots de passe ne correspondent pas.');
                            return;
                        }
                    }
                    
                    if (endpoint) {
                        // Faire la requête API
                        const response = await fetch(`http://localhost:8000/api/users/${endpoint}`, {
                            method: 'PUT',
                            headers: createAuthHeaders(),
                            body: JSON.stringify(updateData)
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Erreur lors de la mise à jour: ${errorText}`);
                        }
                        
                        alert('Modifications enregistrées avec succès!');
                        closeModal();
                        
                        // Recharger la page si nécessaire
                        if (endpoint === 'username' || endpoint === 'email') {
                            location.reload();
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la mise à jour:', error);
                    alert(`Une erreur est survenue: ${error.message}`);
                }
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
                    confirmBtn.addEventListener('click', async function() {
                        try {
                            // Récupérer le token JWT
                            const token = getAuthToken();
                            if (!token) {
                                alert('Vous devez être connecté pour supprimer votre compte.');
                                window.location.href = 'login.html';
                                return;
                            }
                            
                            // Faire la requête API
                            const response = await fetch('http://localhost:8000/api/users', {
                                method: 'DELETE',
                                headers: createAuthHeaders()
                            });
                            
                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(`Erreur lors de la suppression du compte: ${errorText}`);
                            }
                            
                            // Supprimer le token JWT
                            localStorage.removeItem('jwt');
                            
                            alert('Votre compte a été supprimé définitivement.');
                            window.location.href = 'main.html';
                        } catch (error) {
                            console.error('Erreur lors de la suppression du compte:', error);
                            alert(`Une erreur est survenue: ${error.message}`);
                        }
                    });
                }
            }
        }
    }
    
    function initActionButtons() {
        const saveSettingsBtn = document.getElementById('save-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', async function() {
                try {
                    // Récupérer le token JWT
                    const token = getAuthToken();
                    if (!token) {
                        alert('Vous devez être connecté pour modifier vos paramètres.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    // Récupérer les paramètres
                    const theme = document.querySelector('.theme-btn.active')?.getAttribute('data-theme') || 'system';
                    const textSize = document.querySelector('.text-size-btn.active')?.getAttribute('data-size') || 'medium';
                    const notifications = document.getElementById('notifications-toggle')?.classList.contains('active') || false;
                    const emailUpdates = document.getElementById('email-toggle')?.classList.contains('active') || false;
                    
                    // Faire la requête API
                    const response = await fetch('http://localhost:8000/api/users/settings', {
                        method: 'PUT',
                        headers: createAuthHeaders(),
                        body: JSON.stringify({
                            theme,
                            textSize,
                            notifications,
                            emailUpdates
                        })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Erreur lors de la mise à jour des paramètres: ${errorText}`);
                    }
                    
                    alert('Paramètres enregistrés avec succès!');
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde des paramètres:', error);
                    alert(`Une erreur est survenue: ${error.message}`);
                }
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
        
        async function performSearch() {
            const searchTerm = searchInput.value.trim();
            const searchTermDisplay = document.getElementById('search-term');
            const resultsNumber = document.getElementById('results-number');
            const resultsContainer = document.querySelector('.results-section.active .results-grid');
            
            if (!searchTerm) {
                alert('Veuillez entrer un terme de recherche.');
                return;
            }
            
            if (searchTermDisplay) {
                searchTermDisplay.textContent = searchTerm;
            }
            
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="loading">Recherche en cours...</div>';
                
                try {
                    // Déterminer le type de recherche
                    const activeTab = document.querySelector('.search-tab.active');
                    const searchType = activeTab ? activeTab.getAttribute('data-tab') : 'quizzes';
                    
                    // Filtres supplémentaires
                    const activeFilter = document.querySelector('.filter-btn.active');
                    const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
                    
                    // Catégorie (pour les quiz)
                    const categorySelect = document.getElementById('category-select');
                    const category = categorySelect && categorySelect.style.display !== 'none' ? categorySelect.value : '';
                    
                    // Construire l'URL de recherche
                    let searchUrl = `http://localhost:8000/api/search/${searchType}?q=${encodeURIComponent(searchTerm)}`;
                    
                    if (filterType !== 'all') {
                        searchUrl += `&filter=${filterType}`;
                    }
                    
                    if (category && searchType === 'quizzes') {
                        searchUrl += `&category=${encodeURIComponent(category)}`;
                    }
                    
                    // Faire la requête API
                    const response = await fetch(searchUrl, {
                        headers: createAuthHeaders()
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Erreur lors de la recherche: ${errorText}`);
                    }
                    
                    const data = await response.json();
                    
                    // Mettre à jour le nombre de résultats
                    if (resultsNumber) {
                        resultsNumber.textContent = `${data.results.length} résultat${data.results.length !== 1 ? 's' : ''} trouvé${data.results.length !== 1 ? 's' : ''}`;
                    }
                    
                    // Afficher les résultats
                    resultsContainer.innerHTML = '';
                    
                    if (data.results.length === 0) {
                        resultsContainer.innerHTML = '<p class="no-results">Aucun résultat trouvé pour votre recherche.</p>';
                        return;
                    }
                    
                    // Afficher les résultats selon le type
                    if (searchType === 'quizzes') {
                        data.results.forEach(quiz => {
                            const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
                            const isCreator = isUserQuizCreator(quiz.nomCreateur);
                            
                            const quizCard = document.createElement('div');
                            quizCard.className = 'quiz-card';
                            quizCard.innerHTML = `
                                <img src="${imageUrl}" alt="${quiz.nom}" class="quiz-card-image">
                                <div class="quiz-card-content">
                                    <h3 class="quiz-card-title">${quiz.nom}</h3>
                                    <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                                    <div class="quiz-card-meta">
                                        <span>Par ${quiz.nomCreateur || 'Anonyme'}</span>
                                        <span class="quiz-card-category">${quiz.categorie || 'Divers'}</span>
                                    </div>
                                    <div class="quiz-card-info">
                                        <span class="quiz-questions-count">${quiz.nbQuestions || 0} questions</span>
                                        <span class="quiz-time-estimate">${quiz.estimatedTime || 5} min</span>
                                    </div>
                                    <div class="quiz-card-actions">
                                        <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                                        ${isCreator ? `<a href="editQuiz.html?id=${quiz.id_quiz}" class="quiz-card-btn edit-btn">Modifier</a>` : ''}
                                    </div>
                                </div>
                            `;
                            resultsContainer.appendChild(quizCard);
                        });
                    } else if (searchType === 'users') {
                        data.results.forEach(user => {
                            const userCard = document.createElement('div');
                            userCard.className = 'user-card';
                            userCard.innerHTML = `
                                <div class="user-avatar">
                                    <img src="${user.avatar || '/api/placeholder/100/100'}" alt="${user.username}">
                                </div>
                                <div class="user-info">
                                    <h3 class="user-name">${user.firstname} ${user.lastname}</h3>
                                    <p class="user-username">@${user.username}</p>
                                    <p class="user-bio">${user.bio || 'Cet utilisateur n\'a pas encore ajouté de bio.'}</p>
                                    <div class="user-stats">
                                        <span>${user.quizCount || 0} quiz créés</span>
                                    </div>
                                    <a href="profile.html?user=${user.username}" class="view-profile-btn">Voir le profil</a>
                                </div>
                            `;
                            resultsContainer.appendChild(userCard);
                        });
                    }
                } catch (error) {
                    console.error('Erreur lors de la recherche:', error);
                    resultsContainer.innerHTML = `<p class="error-message">Erreur lors de la recherche: ${error.message}</p>`;
                }
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
        
        // Charger les quiz de l'utilisateur
        loadUserQuizzes();
        
        async function loadUserQuizzes() {
            const quizzesContainer = document.getElementById('quizzes-content');
            if (!quizzesContainer) return;
            
            try {
                // Récupérer le nom d'utilisateur du profil
                const urlParams = new URLSearchParams(window.location.search);
                const username = urlParams.get('user');
                
                let apiUrl = 'http://localhost:8000/api/quizzes';
                
                if (username) {
                    apiUrl += `/user/${username}`;
                } else {
                    // Profil de l'utilisateur connecté
                    const token = getAuthToken();
                    if (!token) {
                        quizzesContainer.innerHTML = '<p>Vous devez être connecté pour voir vos quiz.</p>';
                        return;
                    }
                    
                    apiUrl += '/me';
                }
                
                // Afficher l'indicateur de chargement
                quizzesContainer.innerHTML = '<div class="loading">Chargement des quiz...</div>';
                
                // Faire la requête API
                const response = await fetch(apiUrl, {
                    headers: createAuthHeaders()
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erreur lors du chargement des quiz: ${errorText}`);
                }
                
                const data = await response.json();
                
                // Afficher les quiz
                if (data.quizzes && data.quizzes.length > 0) {
                    quizzesContainer.innerHTML = '';
                    
                    data.quizzes.forEach(quiz => {
                        const quizCard = document.createElement('div');
                        quizCard.className = 'quiz-card';
                        
                        const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
                        
                        // Vérifier si l'utilisateur est le créateur du quiz
                        const isCreator = isUserQuizCreator(quiz.nomCreateur);
                        
                        quizCard.innerHTML = `
                            <img src="${imageUrl}" alt="${quiz.nom}" class="quiz-card-image">
                            <div class="quiz-card-content">
                                <h3 class="quiz-card-title">${quiz.nom}</h3>
                                <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                                <div class="quiz-card-meta">
                                    <span>Par ${quiz.nomCreateur || 'Anonyme'}</span>
                                    <span class="quiz-card-category">${quiz.categorie || 'Divers'}</span>
                                </div>
                                <div class="quiz-card-info">
                                    <span class="quiz-questions-count">${quiz.nbQuestions || 0} questions</span>
                                    <span class="quiz-time-estimate">${quiz.estimatedTime || 5} min</span>
                                </div>
                                <div class="quiz-card-actions">
                                    <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                                    ${isCreator ? `<a href="editQuiz.html?id=${quiz.id_quiz}" class="quiz-card-btn edit-btn">Modifier</a>` : ''}
                                </div>
                            </div>
                        `;
                        quizzesContainer.appendChild(quizCard);
                    });
                } else {
                    quizzesContainer.innerHTML = '<p>Aucun quiz disponible.</p>';
                }
            } catch (error) {
                console.error('Erreur lors du chargement des quiz:', error);
                quizzesContainer.innerHTML = `<p class="error-message">Erreur lors du chargement des quiz: ${error.message}</p>`;
            }
        }
        
        // Charger l'historique des quiz joués
        loadPlayedQuizzes();
        
        async function loadPlayedQuizzes() {
            const historyContainer = document.getElementById('history-content');
            if (!historyContainer) return;
            
            try {
                // Récupérer le token JWT
                const token = getAuthToken();
                if (!token) {
                    historyContainer.innerHTML = '<p>Vous devez être connecté pour voir votre historique.</p>';
                    return;
                }
                
                // Afficher l'indicateur de chargement
                historyContainer.innerHTML = '<div class="loading">Chargement de l\'historique...</div>';
                
                // Faire la requête API
                const response = await fetch('http://localhost:8000/api/history', {
                    headers: createAuthHeaders()
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erreur lors du chargement de l'historique: ${errorText}`);
                }
                
                const data = await response.json();
                
                // Afficher l'historique
                if (data.history && data.history.length > 0) {
                    historyContainer.innerHTML = '';
                    
                    data.history.forEach(item => {
                        const historyItem = document.createElement('div');
                        historyItem.className = 'history-item';
                        
                        const date = new Date(item.played_at);
                        const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        
                        historyItem.innerHTML = `
                            <div class="history-item-info">
                                <h3 class="history-item-title">${item.quiz_name}</h3>
                                <p class="history-item-date">Joué le ${formattedDate}</p>
                                <p class="history-item-score">Score: ${item.score} points</p>
                            </div>
                            <div class="history-item-actions">
                                <a href="quiz.html?id=${item.quiz_id}" class="quiz-card-btn">Rejouer</a>
                            </div>
                        `;
                        historyContainer.appendChild(historyItem);
                    });
                } else {
                    historyContainer.innerHTML = '<p>Aucun quiz joué pour le moment.</p>';
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l\'historique:', error);
                historyContainer.innerHTML = `<p class="error-message">Erreur lors du chargement de l'historique: ${error.message}</p>`;
            }
        }
    }

    // Vérifier si l'utilisateur est connecté et mettre à jour l'interface en conséquence
    function updateAuthUI() {
        const token = getAuthToken();
        const authLinks = document.querySelector('.auth-links');
        const profile = document.querySelector('.profile');
        
        if (token && authLinks && profile) {
            authLinks.style.display = 'none';
            profile.style.display = 'flex';
        } else if (authLinks && profile) {
            authLinks.style.display = 'flex';
            profile.style.display = 'none';
        }
    }
    
    // Mettre à jour l'interface selon l'état d'authentification
    updateAuthUI();

    // Initialiser la page en fonction de son type
    if (document.querySelector('.quiz-container')) {
        initQuiz();
    } else if (document.getElementById('quiz-cards')) {
        renderQuizCards();
        
        if (document.getElementById('recommended-quiz-cards')) {
            renderRecommendedQuizzes();
        }
    } else if (document.querySelector('.questions-container')) {
        initCreateQuiz();
    } else if (document.querySelector('.login-form') || document.querySelector('.register-form')) {
        initLoginPage();
    } else if (document.querySelector('.settings-container')) {
        initSettingsPage();
    } else if (document.querySelector('.search-container')) {
        initSearchPage();
    } else if (document.querySelector('.profile-container')) {
        initProfilePage();
    }

    applyTheme();

});

async function applyTheme() {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    const parseJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch (e) {
            return null;
        }
    };

    const username = parseJWT(token)?.username;
    if (!username) return;

    try {
        const res = await fetch(`http://localhost:8000/api/equipped/${username}`);
        const data = await res.json();
        const theme = data.theme?.[0];

        if (!theme) return;

        const header = document.querySelector('header');
        if (header) {
            header.style.background = `linear-gradient(135deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire})`;
            header.style.boxShadow = `0 4px 20px ${theme.couleurSecondaire}4D`;
        }

        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.background = `linear-gradient(135deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire})`;
        }

        document.body.style.color = theme.couleurTexteUn || '#ffffff';

        const style = document.createElement('style');
        style.innerHTML = `
            .recommended-quizzes h2::after {
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
            }
            .footer-links a {
                color: ${theme.couleurTexteUn};
            }
            .footer-links a:hover {
                color: #ffffff;
            }
            .quiz-card-btn {
                border: 2px solid ${theme.couleurPrincipal};
                color: ${theme.couleurPrincipal};
                background: transparent;
            }
            .quiz-card-btn:hover {
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
                color: ${theme.couleurTexteUn || '#ffffff'};
            }
        `;
        document.head.appendChild(style);

    } catch (err) {
        console.error('Erreur application du thème:', err);
    }
}
