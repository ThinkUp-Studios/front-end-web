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
});


// Gestion des quiz
let quizzes = [];

function fetchQuizzes() {

        fetch('http://localhost:8000/api/quizzes')
            .then(response => response.json())
            .then(data => {
                if (data.count === 0) {
                    displayNoQuizMessage(data.message || 'Aucun quiz trouvé');
                } else {
                    quizzes = data.quizzes;
                    displayRecommendedQuizzes();
                }
            })
            .catch(error => {
                console.error('Erreur réseau ou serveur: ', error);
                displayErrorMessage('Une erreur est survenue lors de la récupération des quiz.');
            });
    
}

function fetchPopularQuizzes() {
    fetch('http://localhost:8000/api/quizzes/popular')
        .then(response => response.json())
        .then(data => {
            if (data.count === 0) {
                displayNoQuizMessage(data.message || 'Aucun quiz trouvé');
            } else {
                quizzes = data.quizzes;
                displayPopularQuizzes();
            }
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
            displayErrorMessage('Une erreur est survenue lors de la récupération des quiz');
        });
}



function displayRecommendedQuizzes() {
    const quizContainer = document.getElementById('recommended-quiz-cards');
    quizContainer.innerHTML = "";

    if (quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz trouvé.</p>";
        return;
    }

    const randomQuizzes = quizzes.sort(() => 0.5 - Math.random()).slice(0, 3);

    randomQuizzes.forEach(quiz => {
        const quizCard = document.createElement("div");
        quizCard.classList.add("quiz-card");
    
        // const imageUrl = quiz.imageUrl || '/api/placeholder/300/180';
    
        let imgSRC;
        switch (quiz.categorie) {
            case "Éducation" : 
                imgSRC = '/images/imgEducation.jpg';
                break;
            case "Divertissements" :
                imgSRC = '/images/imgDivertissements.jpg';
                break;
            case "Sport" : 
                imgSRC = '/images/imgSports.jpg';
                break;
            case "Sciences" : 
                imgSRC = '/images/imgScience.jpg';
                break;
            case "Histoire" :
                imgSRC = '/images/imgHistoire.jpg';
                break;
            case "Littérature" : 
                imgSRC = '/images/imgLitterature.jpg';
                break;
            default : 
                imgSRC = '/images/imgAutres.jpg';
        }


        quizCard.innerHTML = `
            <div class="quiz-card-tag"></div>
            <img src="${imgSRC}" alt="${quiz.nom}" class="quiz-card-image">
            <div class="quiz-card-content">
                <h3 class="quiz-card-title">${quiz.nom}</h3>
                <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                <div class="quiz-card-meta">
                    <span>Par ${quiz.nomCreateur || 'Anonyme'}</span>
                    <span class="quiz-card-category">${quiz.categorie || 'Divers'}</span>
                </div>
                <div class="quiz-card-info">
                    <span class="quiz-questions-count">${quiz.nbQuestions || 0} questions</span>
                    <span class="quiz-player-count">${quiz.nbJoueurs || 0} joueurs</span>
                </div>
                <div class="quiz-card-actions">
                    <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                </div>
                <div class="quiz-card-actions">
                    <a href="leaderboard.html?id=${quiz.id_quiz}" id="leaderboard-btn">Classement</a>
                </div>

            </div>
        `;
        quizContainer.appendChild(quizCard);
    });}


function displayPopularQuizzes() {
    const quizContainer = document.getElementById('quiz-cards');

    quizContainer.innerHTML = "";

    if(quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz trouvé.</p>";
        return;
    }


    

    quizzes.forEach(quiz => {
        const quizCard = document.createElement("div");
        quizCard.classList.add("quiz-card");

        let imgSRC;
        switch (quiz.categorie) {
            case "Éducation" : 
                imgSRC = '/images/imgEducation.jpg';
                break;
            case "Divertissements" :
                imgSRC = '/images/imgDivertissements.jpg';
                break;
            case "Sport" : 
                imgSRC = '/images/imgSports.jpg';
                break;
            case "Sciences" : 
                imgSRC = '/images/imgScience.jpg';
                break;
            case "Histoire" :
                imgSRC = '/images/imgHistoire.jpg';
                break;
            case "Littérature" : 
                imgSRC = '/images/imgLitterature.jpg';
                break;
            default : 
                imgSRC = 'imgAutres.jpg';
        }

        quizCard.innerHTML = `<div class="quiz-card-tag"></div>
            <img src="${imgSRC}" alt="${quiz.nom}" class="quiz-card-image">
            <div class="quiz-card-content">
                <h3 class="quiz-card-title">${quiz.nom}</h3>
                <p class="quiz-card-description">${quiz.description || 'Aucune description disponible.'}</p>
                <div class="quiz-card-meta">
                    <span>Par ${quiz.nomCreateur || 'Anonyme'}</span>
                    <span class="quiz-card-category">${quiz.categorie || 'Divers'}</span>
                </div>
                <div class="quiz-card-info">
                    <span class="quiz-questions-count">${quiz.nbQuestions || 0} questions</span>
                    <span class="quiz-player-count">${quiz.nbJoueurs || 0} joueurs</span>
                </div>
                <div class="quiz-card-actions">
                    <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                </div>
                <div class="quiz-card-actions">
                    <a href="leaderboard.html?id=${quiz.id_quiz}" id="leaderboard-btn">Classement</a>
                </div>
            </div>
        `;
        quizContainer.appendChild(quizCard);
    });
}

function displayNoQuizMessage(message) {
    const container = document.getElementById('quiz-cards');
    if (container) {
        container.innerHTML = `<p>${message}</p>`;
    }
}

function displayErrorMessage(message) {
    const container = document.getElementById('quiz-cards');
    if (container) {
        container.innerHTML = `<p style="color: red;">${message}</p>`;
    }
}

// Initialiser le chargement des quiz si on est sur la page principale
if (window.location.pathname.includes("main.html") || document.getElementById('quiz-cards')) {
    fetchQuizzes();
    fetchPopularQuizzes();
}


const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault(); // Empêche la redirection par défaut
        localStorage.removeItem('jwt'); // Supprime le token
        window.location.href = 'login.html'; // Redirige manuellement
    });
}
