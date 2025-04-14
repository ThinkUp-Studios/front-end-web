async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !password || !confirmPassword) {
        alert('Tous les champs sont requis');
        return;
    }

    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }


    try {
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwt', data.token); // Stocker le token JWT
            window.location.href = 'main.html'; // Rediriger vers la page principale
        } else {
            alert(data.error || 'Une erreur est survenue lors de l\'inscription');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}

function submitForm() {
    document.getElementById('register-form').addEventListener('submit', function(event) {
        event.preventDefault();  
        register();  
    });
}

document.addEventListener('DOMContentLoaded', function () {
    submitForm();
});
