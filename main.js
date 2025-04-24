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
    setProfilePicture(username);
  }
document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
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
            .hero:before {
                background: linear-gradient(135deg, ${theme.couleurPrincipal} 0%, ${theme.couleurSecondaire} 100%);
            }
            .hero h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                font-weight: 800;
                letter-spacing: -1px;
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .btn {
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
                box-shadow: 0 4px 15px ${hexToRgba(theme.couleurPrincipal, 0.3)};
            }
            .btn:hover {
                box-shadow: 0 7px 20px ${hexToRgba(theme.couleurPrincipal, 0.3)};
            }
            .featured-quizzes h2:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 50px;
                height: 3px;
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
                border-radius: 3px;
            }
            .quiz-card-category {
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
            }
            .quiz-card-tag{
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
            }
            #leaderboard-btn{
                background-color: ${theme.couleurPrincipal};
            }
            #leaderboard-btn:hover{
                color: ${theme.couleurPrincipal};
            }
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

function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
