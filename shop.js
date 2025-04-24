// shop.js
const API_BASE = 'http://localhost:8000/api';

function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const token = localStorage.getItem('jwt');
const decoded = parseJWT(token);
const username = decoded?.username;

const main = document.querySelector('.main-content');

async function fetchAvatars() {
    const res = await fetch(`${API_BASE}/items/avatars`);
    const data = await res.json();
    return data.avatars;
}

async function fetchThemes() {
    const res = await fetch(`${API_BASE}/items/themes`);
    const data = await res.json();
    return data.themes;
}

async function fetchEquipped() {
    const res = await fetch(`${API_BASE}/equipped/${username}`);
    const data = await res.json();
    return data.avatar?.[0]?.nomFichier || null;
}

function createCard(item, type) {
    const card = document.createElement('div');
    card.className = 'quiz-card';

    const image = document.createElement('img');
    image.className = 'quiz-card-image';
    if (type === 'avatar') {
        image.src = `ressources/avatars/${item.nomFichier}`;
    } else {
        const gradient = `linear-gradient(135deg, ${item.couleurPrincipal}, ${item.couleurSecondaire})`;
        image.style.background = gradient;
        image.style.height = '180px';
    }

    const content = document.createElement('div');
    content.className = 'quiz-card-content';

    const title = document.createElement('h3');
    title.className = 'quiz-card-title';
    title.textContent = item.nom;

    const price = document.createElement('p');
    price.className = 'quiz-card-description';
    price.textContent = `Prix: ${item.prix}`;

    const button = document.createElement('button');
    button.className = 'quiz-card-btn';
    button.textContent = 'Acheter';
    button.onclick = () => afficherPopupAchat(item);

    content.appendChild(title);
    content.appendChild(price);
    content.appendChild(button);

    card.appendChild(image);
    card.appendChild(content);

    return card;
}

function afficherPopupAchat(item) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 10000;

    const popup = document.createElement('div');
    popup.style.backgroundColor = '#1f1f1f';
    popup.style.borderRadius = '12px';
    popup.style.padding = '2rem';
    popup.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    popup.style.textAlign = 'center';
    popup.style.color = 'white';
    popup.innerHTML = `
        <h3>Confirmer l'achat</h3>
        <p>Souhaitez-vous acheter <strong>${item.nom}</strong> pour <strong>${item.prix}</strong> points?</p>
    `;

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirmer';
    confirmBtn.className = 'btn';
    confirmBtn.style.marginRight = '1rem';
    confirmBtn.onclick = () => {
        acheterItem(item.id_item);
        document.body.removeChild(overlay);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuler';
    cancelBtn.className = 'btn';
    cancelBtn.style.background = '#6b7280';
    cancelBtn.onclick = () => document.body.removeChild(overlay);

    popup.appendChild(confirmBtn);
    popup.appendChild(cancelBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

async function afficherMagasin() {
    const avatars = await fetchAvatars();
    const themes = await fetchThemes();
    const equippedAvatarFile = await fetchEquipped();

    const profileImg = document.querySelector('.profile-pic');
    if (profileImg && equippedAvatarFile) {
        profileImg.src = `ressources/avatars/${equippedAvatarFile}`;
    }

    const sectionAvatar = document.createElement('section');
    sectionAvatar.className = 'recommended-quizzes';
    sectionAvatar.innerHTML = '<h2>Avatars</h2>';
    const gridAvatar = document.createElement('div');
    gridAvatar.className = 'quiz-cards';

    avatars.forEach(avatar => {
        gridAvatar.appendChild(createCard(avatar, 'avatar'));
    });

    sectionAvatar.appendChild(gridAvatar);
    main.appendChild(sectionAvatar);

    const sectionTheme = document.createElement('section');
    sectionTheme.className = 'recommended-quizzes';
    sectionTheme.innerHTML = '<h2>Thèmes</h2>';
    const gridTheme = document.createElement('div');
    gridTheme.className = 'quiz-cards';

    themes.forEach(theme => {
        gridTheme.appendChild(createCard(theme, 'theme'));
    });

    sectionTheme.appendChild(gridTheme);
    main.appendChild(sectionTheme);
}

async function acheterItem(idItem) {
    try {
        const response = await fetch(`${API_BASE}/inventory/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, id_item: idItem }),
        });

        const result = await response.json();
        alert(result.message || result.error);

        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        alert('Erreur lors de l’achat.');
        console.error(error);
    }
}

afficherMagasin();