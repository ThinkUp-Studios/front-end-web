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
            displayCreatedQuizzes(quizzes)
        })
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

    if (quizzes.length === 0) {
        quizContainer.innerHTML = "<p>Aucun quiz crée.</p>";
        return;
    }

    quizzes.forEach(quiz => {
        const quizCard = document.createElement("div");
        quizCard.classList.add("quiz-card");

        quizCard.innerHTML = `
        <div class="quiz-card">
            <img src="" alt="Quiz" class="quiz-card-image">
            <div class="quiz-card-content">
                <h3 class="quiz-card-title">${quiz.nom}</h3>
                <p class="quiz-card-description">${quiz.description}.</p>
                <div class="quiz-card-meta">
                    <span>${quiz.nbQuestions} questions</span>
                    <span class="quiz-card-category">${quiz.categorie}</span>
                </div>
                <div class="quiz-card-actions">
                    <a href="quiz.html?id=${quiz.id_quiz}" class="quiz-card-btn">Jouer</a>
                </div>
            </div>
        </div>
        `;
        quizContainer.appendChild(quizCard);
    })
}