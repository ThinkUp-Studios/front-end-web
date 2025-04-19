// editQuiz.js - Fichier JavaScript pour la page d'édition de quiz
import { getQuiz, updateQuiz } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const profilePic = document.querySelector('.profile-pic');
    let quizId;
    let quizData;

    // Gestion du profil utilisateur
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

    // Récupérer l'ID du quiz depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    quizId = urlParams.get('id');

    if (!quizId) {
        window.location.href = 'main.html';
        return;
    }

    // Charge les données du quiz pour l'édition
    async function loadQuizData() {
        try {
            const loadingIndicator = document.getElementById('loading-indicator');
            
            quizData = await getQuiz(quizId);
            
            if (!quizData) {
                alert('Impossible de charger le quiz. Redirection vers la page d\'accueil...');
                window.location.href = 'main.html';
                return;
            }

            // Cacher l'indicateur de chargement
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            // Remplir les champs du formulaire avec les données du quiz
            document.getElementById('quiz-title').value = quizData.nom_quiz || '';
            document.getElementById('quiz-description').value = quizData.description || '';
            
            // Sélectionner la catégorie
            const categorySelect = document.getElementById('quiz-category');
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === quizData.categorie) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }

            // Charger les questions
            const questionsContainer = document.querySelector('.questions-container');
            questionsContainer.innerHTML = '';

            if (quizData.questions && Array.isArray(quizData.questions)) {
                quizData.questions.forEach((question, index) => {
                    createQuestionCard(questionsContainer, question, index);
                });
                
                // Configuration des boutons pour choisir la bonne réponse
                setupCorrectToggles();
                
                // Configuration des boutons de suppression de question
                setupDeleteButtons();
            }

        } catch (error) {
            console.error('Erreur lors du chargement du quiz:', error);
            alert('Erreur lors du chargement du quiz: ' + error.message);
        }
    }

    // Créer une carte de question pour l'affichage
    function createQuestionCard(container, question, index) {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.id = `question-${index + 1}`;

        let reponses = [];
        let bonneReponseIndex = -1;

        if (question.reponses && Array.isArray(question.reponses)) {
            question.reponses.forEach((reponse, idx) => {
                reponses.push(reponse.texte_reponse);
                if (reponse.bonne_reponse === 1) {
                    bonneReponseIndex = idx;
                }
            });
        }

        questionCard.innerHTML = `
            <div class="question-header">
                <h2>Question ${index + 1}</h2>
                <div class="question-controls">
                    <button class="btn-icon" title="Supprimer la question">🗑️</button>
                </div>
            </div>
            
            <div class="input-group">
                <label for="question-text-${index + 1}">Texte de la Question</label>
                <input type="text" id="question-text-${index + 1}" placeholder="Entrez votre question" value="${question.texte_question || ''}" required>
            </div>
            
            <div class="input-group">
                <label for="question-time-${index + 1}">Limite de Temps (secondes)</label>
                <select id="question-time-${index + 1}">
                    <option value="10">10 secondes</option>
                    <option value="20" selected>20 secondes</option>
                    <option value="30">30 secondes</option>
                    <option value="60">60 secondes</option>
                    <option value="90">90 secondes</option>
                </select>
            </div>
            
            <div class="input-group">
                <label>Choix de Réponses</label>
                <div class="answer-choices">
                    ${generateAnswerChoices(reponses, bonneReponseIndex)}
                </div>
            </div>
        `;

        container.appendChild(questionCard);
    }

    // Générer les choix de réponses HTML
    function generateAnswerChoices(reponses, bonneReponseIndex) {
        const colors = ['color-red', 'color-blue', 'color-yellow', 'color-green'];
        let html = '';

        // Assurez-vous d'avoir 4 réponses (compléter avec des chaînes vides si nécessaire)
        while (reponses.length < 4) {
            reponses.push('');
        }

        // Limiter à 4 réponses maximum
        reponses = reponses.slice(0, 4);

        reponses.forEach((reponse, index) => {
            const isCorrect = index === bonneReponseIndex;
            html += `
                <div class="answer-choice">
                    <div class="color-block ${colors[index % colors.length]}"></div>
                    <input type="text" placeholder="Entrez un choix de réponse" value="${reponse}" required>
                    <div class="correct-toggle ${isCorrect ? 'active' : ''}" data-correct="${isCorrect ? 'true' : 'false'}">
                        ✓
                    </div>
                </div>
            `;
        });

        return html;
    }

    // Configuration des boutons pour choisir la bonne réponse
    function setupCorrectToggles() {
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
    }
    
    // Configuration des boutons de suppression de question
    function setupDeleteButtons() {
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
                } else {
                    alert('Vous devez avoir au moins une question dans votre quiz.');
                }
            });
        });
    }

    // Gestion de l'ajout de nouvelles questions
    const addQuestionBtn = document.getElementById('add-question');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
            const questionCards = document.querySelectorAll('.question-card');
            const newIndex = questionCards.length;
            
            const questionsContainer = document.querySelector('.questions-container');
            
            // Créer une nouvelle question vide
            const emptyQuestion = {
                texte_question: '',
                reponses: ['', '', '', ''],
                bonneReponseIndex: 0
            };
            
            createQuestionCard(questionsContainer, emptyQuestion, newIndex);
            
            setupCorrectToggles();
            setupDeleteButtons();
            
            const newCard = document.getElementById(`question-${newIndex + 1}`);
            newCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Gestion de la mise à jour du quiz
    const updateQuizBtn = document.getElementById('update-quiz');
    if (updateQuizBtn) {
        updateQuizBtn.addEventListener('click', async function() {
            // Validations de base
            const title = document.getElementById('quiz-title').value.trim();
            if (!title) {
                alert('Veuillez entrer un titre pour votre quiz.');
                return;
            }
            
            // Vérifier si chaque question a une réponse correcte sélectionnée
            let allQuestionsValid = true;
            document.querySelectorAll('.question-card').forEach(card => {
                const questionText = card.querySelector('[id^="question-text-"]').value.trim();
                if (!questionText) {
                    alert('Veuillez entrer un texte pour chaque question.');
                    allQuestionsValid = false;
                    return;
                }
                
                const hasCorrectAnswer = card.querySelector('.correct-toggle.active');
                if (!hasCorrectAnswer) {
                    alert('Veuillez sélectionner une réponse correcte pour chaque question.');
                    allQuestionsValid = false;
                    return;
                }
                
                // Vérifier si tous les choix ont été remplis
                const emptyChoices = Array.from(card.querySelectorAll('.answer-choice input')).some(input => !input.value.trim());
                if (emptyChoices) {
                    alert('Veuillez remplir tous les choix de réponse pour chaque question.');
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
                difficulte: 'Facile',  // Valeur par défaut
                estPublic: 1,
                tags: [document.getElementById('quiz-category').value],
                questions: []
            };
            
            document.querySelectorAll('.question-card').forEach(card => {
                const questionText = card.querySelector('[id^="question-text-"]').value.trim();
                const timeLimit = parseInt(card.querySelector('[id^="question-time-"]').value);
                
                const options = [];
                let correctOption = 0;
                
                card.querySelectorAll('.answer-choice').forEach((choice, index) => {
                    options.push(choice.querySelector('input').value.trim());
                    if (choice.querySelector('.correct-toggle').getAttribute('data-correct') === 'true') {
                        correctOption = index;
                    }
                });
                
                quizData.questions.push({
                    texte_question: questionText,
                    reponses: options,
                    bonneReponse: correctOption,
                    tempsReponse: timeLimit
                });
            });
            
            try {
                // Afficher un indicateur de chargement
                updateQuizBtn.textContent = 'Mise à jour en cours...';
                updateQuizBtn.disabled = true;
                
                // Envoi des données à l'API
                const result = await updateQuiz(quizId, quizData);
                console.log('Quiz mis à jour avec succès:', result);
                alert('Quiz mis à jour avec succès! Redirection...');
                
                // Redirection vers la page d'accueil
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 1000);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du quiz:', error);
                alert('Erreur lors de la mise à jour du quiz: ' + error.message);
                
                // Réactiver le bouton
                updateQuizBtn.textContent = 'Mettre à jour le Quiz';
                updateQuizBtn.disabled = false;
            }
        });
    }
    
    // Gestion du bouton d'annulation
    const cancelBtn = document.getElementById('cancel-update');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir annuler la modification du quiz? Les changements non enregistrés seront perdus.')) {
                window.location.href = 'main.html';
            }
        });
    }
    
    // Charger les données du quiz au chargement de la page
    loadQuizData();
});