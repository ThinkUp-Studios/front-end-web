// createQuiz.js - Fichier JavaScript pour la page de création de quiz
import { getAllQuizzes } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu du profil
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
            completeQuizBtn.addEventListener('click', function() {
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
                
                // Préparation des données du quiz pour l'envoi au format attendu par l'API
                const quizData = {
                    titre: title,
                    description: document.getElementById('quiz-description').value.trim(),
                    categorie: document.getElementById('quiz-category').value,
                    tags: [document.getElementById('quiz-category').value], // Utilisation de la catégorie comme tag par défaut
                    estPublic: true,
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
                        enonce: questionText,
                        reponses: options,
                        bonneReponse: correctOption,
                        tempsReponse: timeLimit
                    });
                });
                
                // Envoi des données à l'API
                fetch('/api/quizzes/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(quizData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la création du quiz');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Quiz créé avec succès:', data);
                    alert('Quiz créé avec succès! Redirection vers la page d\'accueil...');
                    
                    // Redirection vers la page d'accueil
                    setTimeout(() => {
                        window.location.href = 'main.html';
                    }, 1000);
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la création du quiz: ' + error.message);
                });
            });
        }
    };
    
    // Initialiser la page de création de quiz
    if (document.querySelector('.questions-container')) {
        initCreateQuiz();
    }
});