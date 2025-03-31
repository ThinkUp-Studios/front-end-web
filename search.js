let quizzes = [];

function fetchQuizzes() {
    if (window.location.pathname.includes("search.html")) {

        fetch('http://localhost:8000/quizzes')
            .then(response => {
                if(!response.ok) {
                    throw new Error('Erreur lors de la récupération des quiz');
                }
                return response.json();
            })
            .then(data => {
                quizzes = data;
                displayQuizzes();
            })
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchQuizzes();
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
                <a href="#" class="play-btn">Jouer</a>
            </div>
        `;
        console.log("Test");
        console.log(quizContainer);

        quizContainer.appendChild(quizElement);
    })

}

function fetchQuizzesBySearch() {
    if (window.location.pathname.includes("search.html")) {
        

    }
}