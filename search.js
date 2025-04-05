let quizzes = [];
let count = [];
let searchInput = "";
const isEmpty = str => !str.trim().length;

function selectQuizDisplay() {
    if (window.location.pathname.includes("search.html")) {
        fetchQuizzes();
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
                <a href="#" class="play-btn" i="play-btn-${quiz.id_quiz}">Jouer</a>
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
