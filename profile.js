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

function fetchUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    fetch(`http://localhost:8000/api/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Utilisateur non trouvé');
            }
            return response.json();
        })
        .then(data => {
            let user = data;
            updateProfile(user);
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
        });
}

function fetchUserQuizzes() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    fetch(`http://localhost:8000/api/quizzes/user/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Utilisateur non trouvé');
            }
            return response.json();
        })
        .then(data => {
            let quizzes = data.quizzes;
            displayCreatedQuizzes(quizzes);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des quiz:', error);
            const quizContainer = document.getElementById('created-quizzes');
            if (quizContainer) {
                quizContainer.innerHTML = '<p>Erreur lors du chargement des quiz. Veuillez réessayer.</p>';
            }
        });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchUserData();
    fetchUserQuizzes();
});

function updateProfile(user) {
    document.getElementById("profile-name").innerHTML = user.username + "";
    document.getElementById("stat-quiz-cree").innerHTML = user.nombreQuiz + "";
    document.getElementById("stat-quiz-complete").innerHTML = user.nombreParties + "";
    document.getElementById("stat-pts-total").innerHTML = user.scoreTotal + "";
}

function displayCreatedQuizzes(quizzes) {
    const quizContainer = document.getElementById('created-quizzes');
    quizContainer.innerHTML = "";

    if (!quizzes || quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz créé.</p>";
        return;
    }

    console.log("Quizzes récupérés:", quizzes);

    quizzes.forEach(quiz => {
        // Déterminer si l'utilisateur actuel est le créateur du quiz
        const isCreator = isUserQuizCreator(quiz.nomCreateur);
        
        const quizCard = document.createElement("div");
        quizCard.classList.add("quiz-card");

        // S'assurer que l'ID du quiz est correctement défini
        const quizId = quiz.id_quiz || quiz.id;
        
        if (!quizId) {
            console.error("Quiz sans ID détecté:", quiz);
        }
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

        quizCard.innerHTML = `
        <div class="quiz-card">
            <img src="${imgSRC}" || ""}" alt="Quiz" class="quiz-card-image">
            <div class="quiz-card-content">
                <h3 class="quiz-card-title">${quiz.nom || "Sans titre"}</h3>
                <p class="quiz-card-description">${quiz.description || "Aucune description disponible"}</p>
                <div class="quiz-card-meta">
                    <span>${quiz.nbQuestions || 0} questions</span>
                    <span class="quiz-card-category">${quiz.categorie || "Non catégorisé"}</span>
                </div>
                <div class="quiz-card-actions">
                    <a href="quiz.html?id=${quizId}" class="quiz-card-btn">Jouer</a>
                    ${isCreator ? `<a href="editQuiz.html?id=${quizId}" class="quiz-card-btn edit-btn">Modifier</a>` : ''}
                </div>
            </div>
        </div>
        `;
        quizContainer.appendChild(quizCard);
    });
}