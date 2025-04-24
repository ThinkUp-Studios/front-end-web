// createQuiz.js - Fichier JavaScript pour la page de création de quiz
import { getAllQuizzes } from './api.js';

const parseJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const profilePic = document.querySelector('.profile-pic');

    if (profilePic) {
        const parseJWT = (token) => {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                return JSON.parse(jsonPayload);
            } catch (e) {
                return null;
            }
        };

        const createProfileMenu = () => {
            if (!document.querySelector('.profile-menu')) {
                const token = localStorage.getItem('jwt');
                const decoded = token ? parseJWT(token) : null;
                const username = decoded?.username;

                const menu = document.createElement('div');
                menu.className = 'profile-menu';
                
                const menuItems = [
                    { text: 'Voir Profil', icon: '👤', href: username ? `profile.html?username=${username}` : 'profile.html' },
                    { text: 'Paramètres', icon: '⚙️', href: 'settings.html' },
                    { text: 'FAQ', icon: '❓', href: '#faq' },
                    { text: 'Déconnexion', icon: '🚪', href: '#' }
                ];
                
                menuItems.forEach(item => {
                    const menuItem = document.createElement('a');
                    menuItem.href = item.href;
                    menuItem.innerHTML = `<span class="menu-icon">${item.icon}</span> ${item.text}`;
                    
                    if (item.text === 'Déconnexion') {
                        menuItem.id = 'logout-link'; 
                    }                
                    menu.appendChild(menuItem);
                });
                
                document.querySelector('.profile').appendChild(menu);

                const logoutLink = document.getElementById('logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault(); 
                        localStorage.removeItem('jwt');
                        window.location.href = 'login.html';
                    });
                }
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

    // Logique de création de quiz
    const initCreateQuiz = () => {
        let questionCount = 1;
        
        // Configuration des boutons pour choisir la bonne réponse
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
        
        // Gestion du bouton pour ajouter une question
        const addQuestionBtn = document.getElementById('add-question');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', function() {
                questionCount++;
                
                const newQuestion = document.querySelector('.question-card').cloneNode(true);
                newQuestion.id = `question-${questionCount}`;
                
                newQuestion.querySelector('h2').textContent = `Question ${questionCount}`;
                
                newQuestion.querySelectorAll('input[type="text"]').forEach(input => {
                    input.value = '';
                    
                    // S'assurer que l'input dans answer-choice a la classe answer-input
                    if (input.closest('.answer-choice')) {
                        input.classList.add('answer-input');
                    }
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
        
        // Ajouter la classe answer-input à tous les inputs de réponse existants
        document.querySelectorAll('.answer-choice input').forEach(input => {
            input.classList.add('answer-input');
        });
        
        // Configuration des boutons de suppression de question
        const setupDeleteButtons = () => {
            document.querySelectorAll('.btn-icon').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (document.querySelectorAll('.question-card').length > 1) {
                        const card = this.closest('.question-card');
                        card.remove();
                        
                        // Réorganiser les numéros de questions
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
        
        // Gestion du bouton pour terminer le quiz
        const completeQuizBtn = document.getElementById('complete-quiz');
        if (completeQuizBtn) {
            completeQuizBtn.addEventListener('click', async function() {
                try {
                    // Vérification de l'authentification
                    const token = localStorage.getItem('jwt');
                    if (!token) {
                        alert('Vous devez être connecté pour créer un quiz.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    // Decode le token pour obtenir le username
                    const decoded = parseJWT(token);
                    if (!decoded || !decoded.username) {
                        alert('Session expirée ou invalide. Veuillez vous reconnecter.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    // Validations de base
                    const title = document.getElementById('quiz-title').value.trim();
                    if (!title) {
                        alert('Veuillez entrer un titre pour votre quiz.');
                        return;
                    }
                    
                    // Vérifier si chaque question a une réponse correcte sélectionnée
                    let allQuestionsValid = true;
                    document.querySelectorAll('.question-card').forEach((card, idx) => {
                        const questionText = card.querySelector('[id^="question-text-"]').value.trim();
                        if (!questionText) {
                            alert(`Veuillez entrer un texte pour la question ${idx + 1}.`);
                            allQuestionsValid = false;
                            return;
                        }
                        
                        const hasCorrectAnswer = card.querySelector('.correct-toggle.active');
                        if (!hasCorrectAnswer) {
                            alert(`Veuillez sélectionner une réponse correcte pour la question ${idx + 1}.`);
                            allQuestionsValid = false;
                            return;
                        }
                        
                        // Vérifier si tous les choix ont été remplis
                        const emptyChoices = Array.from(card.querySelectorAll('.answer-choice input')).some(input => !input.value.trim());
                        if (emptyChoices) {
                            alert(`Veuillez remplir tous les choix de réponse pour la question ${idx + 1}.`);
                            allQuestionsValid = false;
                            return;
                        }
                    });
                    
                    if (!allQuestionsValid) {
                        return;
                    }
                    
                    // Préparation des données du quiz pour l'envoi
                    const quizData = {
                        nom: title,
                        description: document.getElementById('quiz-description').value.trim(),
                        categorie: document.getElementById('quiz-category').value,
                        nbQuestions: document.querySelectorAll('.question-card').length,
                        difficulte: 'Facile',
                        estPublic: 1,
                        nomCreateur: decoded.username, // Utiliser le username du token JWT
                        questions: []
                    };
                    
                    // Construire les questions et réponses dans le format attendu par la base de données
                    let questionCounter = 0;
                    document.querySelectorAll('.question-card').forEach(card => {
                        questionCounter++;
                        const questionText = card.querySelector('[id^="question-text-"]').value.trim();
                        
                        // Créer l'objet question
                        const questionObj = {
                            texte_question: questionText,
                            reponses: []
                        };
                        
                        // Récupérer les réponses et identifier la bonne réponse
                        card.querySelectorAll('.answer-choice').forEach((choice, idx) => {
                            const responseText = choice.querySelector('input').value.trim();
                            const isCorrect = choice.querySelector('.correct-toggle').getAttribute('data-correct') === 'true';
                            
                            // Ajouter la réponse au format attendu par la base de données
                            questionObj.reponses.push({
                                texte_reponse: responseText,
                                bonne_reponse: isCorrect ? 1 : 0
                            });
                        });
                        
                        quizData.questions.push(questionObj);
                    });
                    
                    console.log('Données du quiz à envoyer:', quizData);
                    
                    // Envoi des données à l'API
                    const response = await fetch('http://localhost:8000/api/quizzes/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(quizData)
                    });
                    
                    console.log('Status de la réponse:', response.status);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Réponse d\'erreur:', errorText);
                        throw new Error(`Erreur lors de la création du quiz (${response.status}): ${errorText}`);
                    }
                    
                    const data = await response.json();
                    console.log('Quiz créé avec succès:', data);
                    
                    alert('Quiz créé avec succès! Redirection vers la page d\'accueil...');
                    setTimeout(() => {
                        window.location.href = 'main.html';
                    }, 1000);
                    
                } catch (error) {
                    console.error('Erreur:', error);
                    alert(`Erreur lors de la création du quiz: ${error.message}`);
                }
            });
        }
    };
    
    // Initialiser la page de création de quiz
    if (document.querySelector('.questions-container')) {
        initCreateQuiz();
    }
});