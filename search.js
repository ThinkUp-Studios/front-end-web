let quizzes = [];
let count = [];
let users = [];
let searchInput = "";
const isEmpty = str => !str.trim().length;

function selectQuizDisplay() {
    if (window.location.pathname.includes("search.html")) {
        fetchQuizzes();
        fetchUsers();
        document.getElementById("search-input").addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
            searchInput = document.getElementById("search-input").value;
            console.log(searchInput);
            if (isEmpty(searchInput)) {
                fetchQuizzes();
            } else if (searchInput === "random" || searchInput === "hasard"){
                fetchRandomQuiz();
            } else {
                fetchQuizzesBySearch();
            }
        }
        });

        document.getElementById("search-btn").addEventListener("click", function() {
            let searchInput = document.getElementById("search-input").value;
            if (isEmpty(searchInput)) {
                fetchQuizzes();
            } else if (searchInput === "random" || searchInput === "hasard"){
                fetchRandomQuiz();
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
});


function displayQuizzes() {
    const quizContainer = document.getElementById('quiz-results');
    quizContainer.innerHTML = "";

    if (quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz trouvé.</p>";
        return;
    }

    quizzes.forEach(quiz => {
        const quizElement = document.createElement("div");
        quizElement.classList.add("quiz-results");

        quizElement.innerHTML = `
            <div id="quiz-result-card-${quiz.id_quiz}" class="quiz-result-card">
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
    })
    document.getElementById("results-number").innerHTML = count + " resultats trouvés";
    document.getElementById("search-term").innerHTML = searchInput;

}

function fetchQuizzesBySearch() {
    let recherche = document.getElementById("search-input").value;
    fetch(`http://localhost:8000/api/quizzes/find?search=${recherche}`)
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
                // displayNoUserMessage(data.message || 'Aucun utilisateur trouvé');
            } else {
                users = data.users;
                userCount = data.count;
                displayUsers();
            }
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
            // displayErrorMessageUsers('Une erreur est survenue lors de la récupération des utilisateurs')
        });
}

function displayUsers() {
    const userContainer = document.getElementById('user-results');
    userContainer.innerHTML = "";

    if (users.length === 0) {
        userContainer.innerHTML = "<p>Aucun utilisateur trouvé.</p>";
        return;
    }

    users.forEach(user => {
        const userElement = document.createElement("div");
        userElement.classList.add("user-results");

        userElement.innerHTML = `
        <div id="user-result-card">
            <img src="" alt="User" class="user-avatar">
            <div class="user-details">
                <h4>${user.username}</h4>
                <p class="user-stats">Niveau ${user.niveau} • ${user.scoreTotal} points</p>
            </div>
            <a href="profile.html?username=${user.username}" class="profile-btn">Voir profil</a>
        </div>
        `
        userContainer.appendChild(userElement);
    })
}