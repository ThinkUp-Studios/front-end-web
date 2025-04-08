async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }) 
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwt', data.token); 
            window.location.href = 'main.html'; // Rediriger vers la page principale
        } else {
            alert(data.error || 'Identifiants invalides');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        login(); 
    });
});
