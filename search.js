let quizzes = [];
let count = [];
let userCount = [];
let users = [];
let searchInput = "";
let hiddenBool = 0;
const isEmpty = str => !str.trim().length;



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
});function selectQuizDisplay() {
    if (window.location.pathname.includes("search.html")) {
        fetchQuizzes(); 
        fetchUsers();
        document.getElementById("testBody").addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                searchInput = document.getElementById("search-input").value;
                categoryInput = document.getElementById("category-select").value;
                if (isEmpty(searchInput) && categoryInput === "all") { 
                    fetchQuizzesBySearch();
                    fetchUsersBySearch();
                } else if (searchInput === "random" || searchInput === "hasard"){
                    fetchRandomQuiz();
                    fetchUsers();
                } else {
                    fetchQuizzesBySearch();
                    fetchUsersBySearch();
                }
            }
        });
        document.getElementById("search-btn").addEventListener("click", function() {
            let searchInput = document.getElementById("search-input").value;
            let categoryInput = document.getElementById("category-select").value;
            // let sortInput = document.getElementById("sort-select").value;
            if (isEmpty(searchInput) && categoryInput === "all") {
                fetchQuizzes();
                fetchUsers();
            } else if (searchInput === "random" || searchInput === "hasard"){
                fetchRandomQuiz();
                fetchUsers();
            } else {
                fetchQuizzesBySearch();
                fetchUsersBySearch();
            }
        });

        document.getElementById("category-select").addEventListener("change", function() {
            fetchQuizzesBySearch();
        });
        document.getElementById("sort-select").addEventListener("change", function() {
            fetchQuizzesBySearch();
        });


        const filterBtn1 = document.getElementById("filter-btn-1");
        const filterBtn2 = document.getElementById("filter-btn-2");
        const filterBtn3 = document.getElementById("filter-btn-3");

        function resetSortButtons() {
            filterBtn1.classList.remove("active");
            filterBtn2.classList.remove("active");
            filterBtn3.classList.remove("active");
        }
        filterBtn1.classList.add("active");

        filterBtn1.addEventListener("click", () => {
            resetSortButtons();
            filterBtn1.classList.add("active");

            document.getElementById("result-group-quiz").style.display = "block";
            document.getElementById("result-group-users").style.display = "block";
        
        });

        filterBtn2.addEventListener("click", () => {
            resetSortButtons();
            filterBtn2.classList.add("active");

            document.getElementById("result-group-quiz").style.display = "block";
            document.getElementById("result-group-users").style.display = "none";
        
        });

        filterBtn3.addEventListener("click", () => {
            resetSortButtons();
            filterBtn3.classList.add("active");

            document.getElementById("result-group-quiz").style.display = "none";
            document.getElementById("result-group-users").style.display = "block";
        
        });

    }
}

function fetchQuizzes() {

    fetch('http://localhost:8000/api/quizzes')
        .then(response => response.json())
        .then(data => {
            if (data.count === 0) {
                displayNoQuizMessage(data.message || 'Aucun quiz trouvé');
            } else {
                quizzes = data.quizzes;
                count = data.count;
                displayQuizzes();
            }
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
            displayErrorMessage('Une erreur est survenue lors de la récupération des quiz.');
        });
    
}

document.addEventListener('DOMContentLoaded', function () {
    selectQuizDisplay();
    hideQuizResults();
    hideUserResults();
    populateCategories();
});


function displayQuizzes() {
    const quizContainer = document.getElementById('quiz-results');
    quizContainer.innerHTML = "";

    if (quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz trouvé.</p>";
        return;
    }

    let i = 0;

    quizzes.forEach(quiz => {

        const quizElement = document.createElement("div");
        let classeDiv;
        if (i >= 3) {
            classeDiv = "quiz-results-card-hidden";
        } else {
            classeDiv = "quiz-result-card";
        }

        quizElement.innerHTML = `
            <div id="quiz-result-card" class=${classeDiv}>
                <div class="result-details">
                    <h4>${quiz.nom}</h4>
                    <p>${quiz.description}</p>
                    <div class="result-meta">
                        <span class="result-category">${quiz.categorie}</span>
                        <span class="result-author">Par ${quiz.nomCreateur}</span>
                    </div>
                </div>
                <a href="quiz.html?id=${quiz.id_quiz}" class="play-btn" i="play-btn-${quiz.id_quiz}">Jouer</a>
            </div>
        `;
        quizContainer.appendChild(quizElement);
        i++;
    })
    document.getElementById("results-number").innerHTML = (count + userCount) + " resultats trouvés";
    document.getElementById("search-term").innerHTML = document.getElementById("search-input").value;

    const viewMoreBtn = document.getElementById("view-more-btn");
    if (quizzes.length > 3) {
        viewMoreBtn.style.display = "block";
    } else {
        viewMoreBtn.style.display = "none";
    }
    viewMoreBtn.textContent = "Voir plus de quiz";

}

function fetchQuizzesBySearch() {
    let recherche = document.getElementById("search-input").value;
    let categorie = document.getElementById("category-select").value;
    let sortInput = document.getElementById("sort-select").value;
    if (categorie === "all") {
        fetch(`http://localhost:8000/api/quizzes/find?search=${recherche}&category=&sort=${sortInput}`)
        .then(response => {
            if(!response.ok) {
                throw new Error('Erreur lors de la récupération des quiz');
            }
            return response.json();
        })
        .then(data => {
            quizzes = data.quizzes;
            count = data.count;
            displayQuizzes();
            document.getElementById("results-number").innerHTML = (count + userCount) + " resultats trouvés";
            document.getElementById("search-term").innerHTML = document.getElementById("search-input").value;        
        })
        .catch(error => {
            console.error("Erreur:", error);
            document.getElementById('quiz-results').innerHTML = "<p>Aucun quiz n'a été trouvé</p>";
        });
    } else {
        fetch(`http://localhost:8000/api/quizzes/find?search=${recherche}&category=${categorie}&sort=${sortInput}`)
        .then(response => {
            if(!response.ok) {
                throw new Error('Erreur lors de la récupération des quiz');
            }
            return response.json();
        })
        .then(data => {
            quizzes = data.quizzes;
            count = data.count;
            displayQuizzes();
        })
        .catch(error => {
            console.error("Erreur: ", error);
            document.getElementById('quiz-results').innerHTML =  "<p>Aucun quiz n'a été trouvé</p>";
        })
    }

    
}

function fetchRandomQuiz() {
    fetch('http://localhost:8000/api/quizzes/random')
    .then(response => {
        if(!response.ok) {
            throw new Error('Erreur lors de la récupération des quiz');
        }
        return response.json();
    })
    .then(data => {
        quizzes = [data.quiz];
        count = data.count;
        displayQuizzes();
        document.getElementById("results-number").innerHTML = (count + userCount) + " resultats trouvés";
        document.getElementById("search-term").innerHTML = document.getElementById("search-input").value;
    
    })
    .catch(error => {
        console.error("Erreur:", error);
        document.getElementById('quiz-results').innerHTML = "<p>Aucun quiz n'a été trouvé</p>";
    });

}

function displayNoQuizMessage(message) {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `<p>${message}</p>`;
}

function displayErrorMessage(message) {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `<p style="color: red;">${message}</p>`;
}


function fetchUsers() {
    fetch('http://localhost:8000/api/users')
        .then(response => response.json())
        .then(data=> {
            if (data.count === 0) {

            } else {
                users = data.users;
                userCount = data.count;
                displayUsers();
                document.getElementById("results-number").innerHTML = (count + userCount) + " resultats trouvés";
                document.getElementById("search-term").innerHTML = document.getElementById("search-input").value;
            
            }
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
        });
}

function fetchUsersBySearch() {
    let recherche = document.getElementById("search-input").value;
    fetch(`http://localhost:8000/api/users/find?search=${recherche}`)
    .then(response => {
            if(!response.ok) {
                throw new Error('Erreur lors de la récupération des utilisateurs');
            }
            return response.json();
        })
        .then(data => {
            users = data.users;
            userCount = data.count;
            displayUsers();
            document.getElementById("results-number").innerHTML = (count + userCount) + " resultats trouvés";
            document.getElementById("search-term").innerHTML = document.getElementById("search-input").value;
        
        })
        .catch(error => {
            console.error("Erreur: ", error);
        });
}

function displayUsers() {
    const userContainer = document.getElementById('user-results');
    userContainer.innerHTML = "";

    if (users.length === 0) {
        userContainer.innerHTML = "<p>Aucun utilisateur trouvé.</p>";
        return;
    }

    let i = 1;

    users.forEach(user => {
        const userElement = document.createElement("div");
        let classeDiv;
        if( i >= 3 ) {
            classeDiv = "user-result-card-hidden";
        } else {
            classeDiv = "user-result-card";
        }

        userElement.innerHTML = `
        <div id="user-result-card" class=${classeDiv}>
            <img src="" alt="User" class="user-avatar">
            <div class="user-details">
                <h4>${user.username}</h4>
                <p class="user-stats">Niveau ${user.niveau} • ${user.scoreTotal} points</p>
            </div>
            <a href="profile.html?username=${user.username}" class="profile-btn">Voir profil</a>
        </div>
        `
        userContainer.appendChild(userElement);
        i++;
    })

    document.getElementById("results-number").innerHTML = (count + userCount) + " resultats trouvés";
    document.getElementById("search-term").innerHTML = document.getElementById("search-input").value;

    const viewMoreUserBtn = document.getElementById("view-more-btn-user");
    if (users.length > 2) {
        viewMoreUserBtn.style.display = "block";
    } else {
        viewMoreUserBtn.style.display = "none";
    }
    viewMoreUserBtn.textContent = "Voir plus d'utilisateurs";
}

function hideQuizResults() {
    const viewMoreBtn = document.getElementById("view-more-btn");

    viewMoreBtn.addEventListener("click", function () {
        const hiddenQuizzes = document.querySelectorAll(".quiz-results-card-hidden");

        const isHidden = hiddenQuizzes[0].style.display === "none" || hiddenQuizzes[0].style.display === "";

        hiddenQuizzes.forEach(quiz => {
            quiz.style.display = isHidden ? "flex" : "none";
        });

        viewMoreBtn.textContent = isHidden ? "Voir moins de quiz" : "Voir plus de quiz";
    });
}

function hideUserResults() {
    const viewMoreUserBtn = document.getElementById("view-more-btn-user");

    viewMoreUserBtn.addEventListener("click", function () {
        const hiddenUsers = document.querySelectorAll(".user-result-card-hidden");

        const isHidden = hiddenUsers[0].style.display === "none" || hiddenUsers[0].style.display === "";

        hiddenUsers.forEach(user => {
            user.style.display = isHidden ? "flex" : "none";
        });

        viewMoreUserBtn.textContent = isHidden ? "Voir moins d'utilisateurs" : "Voir plus d'utilisateurs";
    });

}


function populateCategories() {
    const categorySelect = document.getElementById("category-select");

    fetch('http://localhost:8000/api/quizzes')
        .then(response => response.json())
        .then(data => {
            if (data.count !== 0) {
                let quizzes = data.quizzes;

                let categories = quizzes.map(quiz => quiz.categorie);

                let uniqueCategories = [...new Set(categories)];

                uniqueCategories.forEach(categorie => {
                    let option = document.createElement("option");
                    option.textContent = categorie;
                    option.value = categorie;
                    categorySelect.appendChild(option);
                });
            }
        })
}
