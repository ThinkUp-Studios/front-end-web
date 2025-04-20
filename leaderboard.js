let participations = [];


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

    fetchQuizData();
    fetchQuizLeaderboard();

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
