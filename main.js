let quizzes = [];


function fetchQuizzes() {
    if (window.location.pathname.includes("main.html")) {
        fetch('http://localhost:8000/api/quizzes')
            .then(response => response.json())
            .then(data => {
                if (data.count === 0) {
                    displayNoQuizMessage(data.message || 'Aucun quiz trouvé');
                } else {
                    quizzes = data.quizzes;
                    displayQuizzes();    
                }
            })
            .catch(error => {
                console.error('Erreur réseau ou serveur: ', error);
                displayErrorMessage('Une erreur est survenue lors de la récupération des quiz.');
            });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchQuizzes();
});


function displayQuizzes() {
    const quizContainer = document.getElementById('quiz-cards');
    quizContainer.innerHTML = "";

    if (quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz trouvé.</p>";
        return;
    }


    quizzes.forEach(quiz => {
        const quizCard = document.createElement("div");
        quizCard.classList.add("quiz-card");

            quizCard.innerHTML = `
                <div class="quiz-card-tag"></div>
                <img src="" alt="${quiz.nom}" class="quiz-card-image">
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
                </div>
            `;
            quizContainer.appendChild(quizCard);
    })

}

function displayNoQuizMessage(message) {
    const container = document.getElementById('quiz-cards');
    container.innerHTML = `<p>${message}</p>`;
}

function displayErrorMessage(message) {
    const container = document.getElementById('quiz-cards');
    container.innerHTML = `<p style="color: red;">${message}</p>`;
}
