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
            user = data;
            updateProfile(user);
        })
        .catch(error => {
            console.error('Erreur réseau ou serveur: ', error);
        });
}

function fetchUserQuizzes() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = null;
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