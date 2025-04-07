async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // envoie login information au back-end
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, motDePasse: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Enregistre donnees utilisateur dans localStorage 
            localStorage.setItem('user', JSON.stringify(data.utilisateur)); 
            window.location.href = 'main.html'; 
        } else {
            alert(data.error || 'Identifiants invalides');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}


function submitForm() {
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();  
        login();  
    });
}


document.addEventListener('DOMContentLoaded', function () {
    submitForm();
});