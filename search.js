let quizzes = [];
let count = [];
let userCount = [];
let users = [];
let searchInput = "";
let hiddenBool = 0;
const isEmpty = str => !str.trim().length;

function selectQuizDisplay() {
    if (window.location.pathname.includes("search.html")) {
        fetchQuizzes(); 
        fetchUsers();
        document.getElementById("testBody").addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                searchInput = document.getElementById("search-input").value;
                categoryInput = document.getElementById("category-select").value;
                if (isEmpty(searchInput) && categoryInput === "all") { 
                    fetchQuizzesBySearch();
                    fetchUsers();
                } else if (searchInput === "random" || searchInput === "hasard"){
                    fetchRandomQuiz();
                    fetchUsers();
                } else {
                    fetchQuizzesBySearch();
                    // fetchUsersBySearch();
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
            }
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
    document.getElementById("results-number").innerHTML = count + " resultats trouvés";
    document.getElementById("search-term").innerHTML = searchInput;

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
            console.log(sortInput);
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
        console.log("Liste des quiz", data)
        quizzes = [data.quiz];
        count = data.count;
        displayQuizzes();
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
            }
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
        });
}

function fetchUsersBySearch() {
    let recherche = document.getElementById("search-input").value;
    fetch(`http://localhost:8000/api/users/find?search=${recherche}}`)
        .then(response => {
            if(!response.ok) {
                throw new Error('Erreur lors de la récupération des utilisateurs');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            users = data.users;
            userCount = data.count;
            displayUsers();
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

        console.log(hiddenUsers);  
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
