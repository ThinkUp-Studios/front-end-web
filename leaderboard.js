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

let participations = [];

document.addEventListener('DOMContentLoaded', function() {
    

    fetchQuizData();
    fetchQuizLeaderboard();
    applyTheme();

});


function fetchQuizData() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    fetch (`http://localhost:8000/api/quizzes/${quizId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Quiz non trouvé');
            }
            return response.json();
        })
        .then(data => {
            let quiz = data;
            updateQuizData(quiz);
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
        });
}

function updateQuizData(quiz) {
    document.getElementById("quiz-title").innerHTML = quiz.nom_quiz + "";
    document.getElementById("quiz-description").innerHTML = quiz.description + "";
    document.getElementById("quiz-category").innerHTML = quiz.description + "";
    document.getElementById("quiz-author").innerHTML = quiz.nomCreateur + "";
    document.getElementById("quiz-questions").innerHTML = quiz.nbQuestions + "";
    document.getElementById("quiz-players").innerHTML = quiz.nbJoueurs + "";
    // document.getElementById("quiz-tags").innerHTML = 
    document.getElementById("play-btn").href = "quiz.html?id=" + quiz.id_quiz;
}

function fetchQuizLeaderboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    fetch (`http://localhost:8000/api/quizzes/${quizId}/leaderboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Utilisateur non trouvé');
            }
            return response.json();
        })
        .then(data => {
            let players = data;
            displayLeaderboard(players);
        })
}

function displayLeaderboard(players) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    if (!players || players.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="3" style="text-align: center; padding: 1rem;">Aucune participation pour le moment.</td>`;
        tbody.appendChild(emptyRow);
        return;
    }

    players
        .sort((a, b) => b.score - a.score)
        .forEach((player, index) => {
            const tr = document.createElement('tr');

            if (index === 0) tr.classList.add('gold-row');
            else if (index === 1) tr.classList.add('silver-row');
            else if (index === 2) tr.classList.add('bronze-row');

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td> <a href="profile.html?username=${player.username}">${player.username} </a> </td>
                <td>${player.score}</td>
                <td>${player.date_participation}
            `;

            tbody.appendChild(tr);
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
            .recommended-quizzes h2::after {
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
            }
            .footer-links a {
                color: ${theme.couleurTexteUn};
            }
            .footer-links a:hover {
                color: #ffffff;
            }
            .quiz-info h1 {
                font-size: 2.2rem;
                margin-bottom: 1rem;
                font-weight: 800;
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            h3 {
                color: #ffffff;
            }
            .play-btn{
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
                box-shadow: 0 4px 15px ${hexToRgba(theme.couleurPrincipal, 0.3)};
            }
            .play-btn:hover {
                box-shadow: 0 7px 20px ${hexToRgba(theme.couleurPrincipal, 0.3)};
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
