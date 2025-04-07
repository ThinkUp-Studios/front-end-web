async function register() {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;

    if (!firstname || !lastname || !username || !password || !confirmPassword) {
        alert('Tous les champs sont requis');
        return;
    }

    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }

    if (!termsAccepted) {
        alert("Vous devez accepter les conditions d'utilisation");
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, motDePasse: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.utilisateur)); 
            window.location.href = 'main.html'; 
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
