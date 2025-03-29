// main.js - Fichier JavaScript pour la page d'accueil
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
    
    // Fonction pour afficher les quiz à la une
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
                
                // Si aucun quiz n'est trouvé ou si l'API retourne un tableau vide
                if (!quizzes || quizzes.length === 0) {
                    // Utiliser des données de secours pour le développement
                    const fallbackQuizzes = [
                        {
                            id: "1", 
                            title: "Quiz d'Histoire",
                            description: "Testez vos connaissances sur l'histoire mondiale",
                            author: "Admin",
                            category: "Histoire",
                            imageUrl: "/api/placeholder/300/180"
                        },
                        {
                            id: "2", 
                            title: "Quiz de Géographie",
                            description: "Découvrez les pays, capitales et merveilles du monde",
                            author: "Admin",
                            category: "Géographie",
                            imageUrl: "/api/placeholder/300/180"
                        },
                        {
                            id: "3", 
                            title: "Quiz de Sciences",
                            description: "Les grandes découvertes scientifiques expliquées simplement",
                            author: "Admin",
                            category: "Sciences",
                            imageUrl: "/api/placeholder/300/180"
                        }
                    ];
                    
                    renderQuizCardsFromData(fallbackQuizzes, quizCardsContainer);
                    return;
                }
                
                renderQuizCardsFromData(quizzes, quizCardsContainer);
            } catch (error) {
                console.error('Erreur lors du chargement des quiz:', error);
                quizCardsContainer.innerHTML = '<p>Impossible de charger les quiz. Veuillez réessayer plus tard.</p>';
            }
        }
    };
    
    // Fonction pour afficher les quiz recommandés
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
                
                // Si aucun quiz n'est trouvé ou si l'API retourne un tableau vide
                if (!quizzes || quizzes.length === 0) {
                    // Utiliser des données de secours pour le développement
                    const fallbackQuizzes = [
                        {
                            id: "1", 
                            title: "Quiz d'Histoire",
                            description: "Testez vos connaissances sur l'histoire mondiale",
                            author: "Admin",
                            category: "Histoire",
                            imageUrl: "/api/placeholder/300/180",
                            questionCount: 10,
                            estimatedTime: 15
                        },
                        {
                            id: "2", 
                            title: "Quiz de Géographie",
                            description: "Découvrez les pays, capitales et merveilles du monde",
                            author: "Admin",
                            category: "Géographie",
                            imageUrl: "/api/placeholder/300/180",
                            questionCount: 8,
                            estimatedTime: 12
                        },
                        {
                            id: "3", 
                            title: "Quiz de Sciences",
                            description: "Les grandes découvertes scientifiques expliquées simplement",
                            author: "Admin",
                            category: "Sciences",
                            imageUrl: "/api/placeholder/300/180",
                            questionCount: 12,
                            estimatedTime: 18
                        }
                    ];
                    
                    renderRecommendedQuizzesFromData(fallbackQuizzes, recommendedContainer);
                    return;
                }
                
                renderRecommendedQuizzesFromData(quizzes, recommendedContainer);
                
            } catch (error) {
                console.error('Erreur lors du chargement des recommandations:', error);
                recommendedContainer.innerHTML = '<p>Impossible de charger les recommandations. Veuillez réessayer plus tard.</p>';
            }
        }
    };
    
    // Fonction pour afficher les quiz à partir des données
    const renderQuizCardsFromData = (quizzes, container) => {
        // Si aucun quiz n'est trouvé
        if (quizzes.length === 0) {
            container.innerHTML = '<p>Aucun quiz disponible.</p>';
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
            container.appendChild(quizCard);
        });
    };
    
    // Fonction pour afficher les quiz recommandés à partir des données
    const renderRecommendedQuizzesFromData = (quizzes, container) => {
        // Si aucun quiz n'est trouvé
        if (quizzes.length === 0) {
            container.innerHTML = '<p>Aucune recommandation disponible.</p>';
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
            container.appendChild(quizCard);
        }
    };
    
    // Initialiser la page principale
    if (document.getElementById('quiz-cards')) {
        renderQuizCards();
        
        if (document.getElementById('recommended-quiz-cards')) {
            renderRecommendedQuizzes();
        }
    }
});