import {
    parseJWT,
    fetchUserCurrency,
    displayCurrency,
    setupProfileMenu,
    setProfilePicture
  } from './globalCurrencyProfile.js';
  
  const token = localStorage.getItem('jwt');
  const decoded = parseJWT(token);
  const username = decoded?.username;
  
  if (username) {
    fetchUserCurrency(username).then(displayCurrency);
    setupProfileMenu(username);
    setProfilePicture(username); // ← affiche automatiquement l'avatar équipé
  }

// editQuiz.js - Fichier JavaScript pour la page d'édition de quiz
document.addEventListener('DOMContentLoaded', function() {
    const profilePic = document.querySelector('.profile-pic');
    let quizId;
    let quizData = null;

    // Définir parseJWT au niveau global pour éviter les erreurs "not defined"
    const parseJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Erreur lors du décodage du token:', e);
            return null;
        }
    };

    // Gestion du profil utilisateur
    if (profilePic) {
        // Code pour la gestion du menu de profil (inchangé)
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
        alert('ID de quiz manquant dans l\'URL');
        window.location.href = 'main.html';
        return;
    }

    console.log(`ID du quiz à éditer: ${quizId}`);

    // Ajout d'un indicateur de chargement
    const questionsContainer = document.querySelector('.questions-container');
    if (questionsContainer) {
        questionsContainer.innerHTML = '<div id="loading-indicator" class="loading">Chargement du quiz...</div>';
    }

    // Charge les données du quiz pour l'édition
    async function loadQuizData() {
        try {
            console.log("Tentative de récupération du quiz...");
            
            // Récupérer le token JWT pour l'authentification
            const token = localStorage.getItem('jwt');
            if (!token) {
                throw new Error("Vous devez être connecté pour modifier un quiz");
            }

            // Appel direct à l'API avec authentification
            const response = await fetch(`http://localhost:8000/api/quizzes/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erreur API:", errorText);
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            quizData = await response.json();
            console.log("Données reçues:", quizData);
            
            if (!quizData) {
                throw new Error("Les données du quiz sont vides");
            }

            // Vérifier que l'utilisateur actuel est bien le créateur du quiz
            const decoded = parseJWT(token);
            if (decoded && decoded.username !== quizData.nomCreateur) {
                throw new Error("Vous n'êtes pas autorisé à modifier ce quiz");
            }

            // Remplir les champs du formulaire avec les données du quiz
            document.getElementById('quiz-title').value = quizData.nom_quiz || quizData.nom || '';
            document.getElementById('quiz-description').value = quizData.description || '';
            
            // Sélectionner la catégorie
            const categorySelect = document.getElementById('quiz-category');
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === quizData.categorie) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }

            // Vider le conteneur de questions
            questionsContainer.innerHTML = '';

            // Traiter les questions et réponses
            if (quizData.questions && Array.isArray(quizData.questions)) {
                console.log("Nombre de questions trouvées:", quizData.questions.length);
                quizData.questions.forEach((question, index) => {
                    createQuestionCard(questionsContainer, question, index);
                });
            } else {
                console.error("Aucune question trouvée dans les données");
                // Créer une question vide par défaut
                createEmptyQuestionCard(questionsContainer, 0);
            }
            
            // Configuration des boutons
            setupCorrectToggles();
            setupDeleteButtons();
            
        } catch (error) {
            console.error('Erreur lors du chargement du quiz:', error);
            
            // Afficher un message d'erreur
            questionsContainer.innerHTML = `
                <div class="error-message">
                    <p>Erreur lors du chargement du quiz: ${error.message}</p>
                    <p>Création d'un nouveau formulaire...</p>
                </div>
            `;
            
            // Créer un quiz vide pour l'édition
            setTimeout(() => {
                questionsContainer.innerHTML = '';
                createEmptyQuestionCard(questionsContainer, 0);
                setupCorrectToggles();
                setupDeleteButtons();
            }, 2000);
        }
    }

    // Créer une carte de question vide
    function createEmptyQuestionCard(container, index) {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.id = `question-${index + 1}`;

        questionCard.innerHTML = `
            <div class="question-header">
                <h2>Question ${index + 1}</h2>
                <div class="question-controls">
                    <button class="btn-icon" title="Supprimer la question">🗑️</button>
                </div>
            </div>
            
            <div class="input-group">
                <label for="question-text-${index + 1}">Texte de la Question</label>
                <input type="text" id="question-text-${index + 1}" placeholder="Entrez votre question" value="" required>
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
                    ${generateEmptyAnswerChoices()}
                </div>
            </div>
        `;

        container.appendChild(questionCard);
    }

    // Générer des choix de réponses vides
    function generateEmptyAnswerChoices() {
        const colors = ['color-red', 'color-blue', 'color-yellow', 'color-green'];
        let html = '';

        for (let i = 0; i < 4; i++) {
            const isCorrect = i === 0; // Par défaut, la première réponse est correcte
            html += `
                <div class="answer-choice">
                    <div class="color-block ${colors[i % colors.length]}"></div>
                    <input type="text" class="answer-input" placeholder="Entrez un choix de réponse" value="" required>
                    <div class="correct-toggle ${isCorrect ? 'active' : ''}" data-correct="${isCorrect ? 'true' : 'false'}">
                        ✓
                    </div>
                </div>
            `;
        }

        return html;
    }

    // Créer une carte de question pour l'affichage
    function createQuestionCard(container, question, index) {
        console.log(`Création de la carte pour la question ${index + 1}:`, question);
        
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.id = `question-${index + 1}`;

        // Extraire les réponses et trouver la bonne réponse
        let reponses = [];
        let bonneReponseIndex = -1;

        if (question.reponses && Array.isArray(question.reponses)) {
            // Analyser les réponses pour comprendre leur structure
            console.log(`Structure des réponses pour la question ${index + 1}:`, JSON.stringify(question.reponses));
            
            // Extraire les textes des réponses selon leur format
            reponses = question.reponses.map((rep, idx) => {
                let texteReponse = '';
                let estBonne = false;
                
                if (typeof rep === 'object') {
                    // Format où chaque réponse est un objet
                    texteReponse = rep.texte_reponse || '';
                    if (rep.bonne_reponse === 1) {
                        estBonne = true;
                        bonneReponseIndex = idx;
                    }
                } else if (typeof rep === 'string') {
                    // Format où les réponses sont simplement des chaînes
                    texteReponse = rep;
                }
                
                return texteReponse;
            });

            // Si on n'a pas trouvé l'index de la bonne réponse via les objets
            if (bonneReponseIndex === -1) {
                // Essayer via le champ bonneReponse
                if (question.bonneReponse !== undefined) {
                    bonneReponseIndex = question.bonneReponse;
                } else {
                    // Parcourir à nouveau pour chercher un autre indicateur
                    question.reponses.forEach((rep, idx) => {
                        // Si c'est un objet avec bonne_reponse = 1
                        if (typeof rep === 'object' && rep.bonne_reponse === 1) {
                            bonneReponseIndex = idx;
                        }
                    });
                }
            }

            // Si on n'a toujours pas trouvé, prendre la première par défaut
            if (bonneReponseIndex === -1) {
                bonneReponseIndex = 0;
                console.warn(`Aucune bonne réponse identifiée pour la question ${index + 1}, première réponse sélectionnée par défaut`);
            }
        } else {
            console.warn(`Format de réponses non reconnu pour la question ${index + 1}:`, question);
        }

        console.log(`Question ${index + 1} - Texte: ${question.texte_question}, Réponses:`, reponses, `Bonne réponse: ${bonneReponseIndex}`);

        // Assurer qu'on a toujours 4 réponses
        while (reponses.length < 4) {
            reponses.push('');
        }

        // Limite à 4 réponses
        reponses = reponses.slice(0, 4);

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

        reponses.forEach((reponse, index) => {
            const isCorrect = index === bonneReponseIndex;
            html += `
                <div class="answer-choice">
                    <div class="color-block ${colors[index % colors.length]}"></div>
                    <input type="text" class="answer-input" placeholder="Entrez un choix de réponse" value="${reponse || ''}" required>
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
            createEmptyQuestionCard(questionsContainer, newIndex);
            
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
            const quizFormData = {
                nom: title,
                description: document.getElementById('quiz-description').value.trim(),
                categorie: document.getElementById('quiz-category').value,
                difficulte: quizData?.difficulte || 'Facile',
                estPublic: quizData?.estPublic || 1,
                questions: []
            };
            
            // Récupérer toutes les questions et leurs réponses
            document.querySelectorAll('.question-card').forEach(card => {
                const questionText = card.querySelector('[id^="question-text-"]').value.trim();
                const timeLimit = parseInt(card.querySelector('[id^="question-time-"]').value);
                
                // Tableau pour stocker les réponses
                const reponses = [];
                let bonneReponse = null;
                
                // Récupérer les réponses et identifier la bonne réponse
                card.querySelectorAll('.answer-choice').forEach((choice, index) => {
                    const reponseText = choice.querySelector('input').value.trim();
                    reponses.push(reponseText);
                    
                    if (choice.querySelector('.correct-toggle').getAttribute('data-correct') === 'true') {
                        bonneReponse = index;
                    }
                });
                
                // S'assurer qu'une bonne réponse est sélectionnée
                if (bonneReponse === null) {
                    bonneReponse = 0;  // Par défaut, première réponse
                }
                
                // Ajouter la question au tableau dans le format attendu par l'API
                quizFormData.questions.push({
                    texte_question: questionText,
                    reponses: reponses,
                    bonneReponse: bonneReponse
                });
            });
            
            try {
                // Afficher un indicateur de chargement
                updateQuizBtn.textContent = 'Mise à jour en cours...';
                updateQuizBtn.disabled = true;
                
                console.log('Données envoyées à l\'API:', quizFormData);
                
                // Envoi des données à l'API
                const response = await fetch(`http://localhost:8000/api/quizzes/${quizId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                    },
                    body: JSON.stringify(quizFormData)
                });
                
                // Journaliser la réponse brute pour le débogage
                const responseText = await response.text();
                console.log('Réponse brute de l\'API:', responseText);
                
                if (!response.ok) {
                    console.error('Réponse d\'erreur:', responseText);
                    throw new Error(`Erreur lors de la mise à jour du quiz: ${response.status}`);
                }
                
                // Parser la réponse JSON si possible
                let result;
                try {
                    result = JSON.parse(responseText);
                    console.log('Quiz mis à jour avec succès:', result);
                } catch (e) {
                    console.warn('La réponse n\'est pas un JSON valide, mais la requête a réussi');
                }
                
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
