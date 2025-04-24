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

import {
    fetchUserCurrency,
    displayCurrency,
    setupProfileMenu
} from './globalCurrencyProfile.js';

if (username) {
    fetchUserCurrency(username).then(displayCurrency);
    setupProfileMenu(username);
}

let currentTheme = null;

async function fetchEquipped() {
    const res = await fetch(`${API_BASE}/equipped/${username}`);
    return await res.json();
}

async function afficherAvatarEquipe() {
    try {
        const equipped = await fetchEquipped();
        const avatarFile = equipped.avatar?.[0]?.nomFichier;
        currentTheme = equipped.theme?.[0];

        if (avatarFile) {
            const img = document.querySelector('.profile-pic');
            if (img) {
                img.src = `ressources/avatars/${avatarFile}`;
            }
        }
    } catch (e) {
        console.error("Erreur chargement avatar équipé :", e);
    }
}

afficherAvatarEquipe();


const main = document.querySelector('.main-content');

async function fetchInventory() {
    const res = await fetch(`${API_BASE}/inventory/${username}`);
    return await res.json();
}

function createInventoryCard(item, type) {
    const card = document.createElement('div');
    card.className = 'quiz-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.style.display = 'flex';
    imageWrapper.style.justifyContent = 'center';
    imageWrapper.style.alignItems = 'center';
    imageWrapper.style.padding = '1rem';
    imageWrapper.style.borderBottom = '1px solid #2f2f2f';

    if (type === 'avatar') {
        const image = document.createElement('img');
        image.className = 'quiz-card-image';
        image.style.maxHeight = '150px';
        image.style.maxWidth = '100%';
        image.style.objectFit = 'contain';
        image.src = `ressources/avatars/${item.nomFichier}`;
        imageWrapper.appendChild(image);
    } else {
        imageWrapper.style.height = '180px';
        imageWrapper.style.background = `linear-gradient(135deg, ${item.couleurPrincipal}, ${item.couleurSecondaire})`;
    }

    const content = document.createElement('div');
    content.className = 'quiz-card-content';

    const title = document.createElement('h3');
    title.className = 'quiz-card-title';
    title.textContent = item.nom;

    const equipBtn = document.createElement('button');
    equipBtn.className = 'quiz-card-btn';
    equipBtn.textContent = 'Équiper';
    equipBtn.onclick = () => equiperItem(item.id_item, type);

    content.appendChild(title);
    content.appendChild(equipBtn);
    card.appendChild(imageWrapper);
    card.appendChild(content);

    return card;
}

async function afficherInventaire() {
    const data = await fetchInventory();
    const avatars = data.avatar || [];
    const themes = data.theme || [];

    const sectionAvatar = document.createElement('section');
    sectionAvatar.className = 'recommended-quizzes';
    sectionAvatar.innerHTML = '<h2>Mes Avatars</h2>';
    const gridAvatar = document.createElement('div');
    gridAvatar.className = 'quiz-cards';

    avatars.forEach(avatar => {
        gridAvatar.appendChild(createInventoryCard(avatar, 'avatar'));
    });

    sectionAvatar.appendChild(gridAvatar);
    main.appendChild(sectionAvatar);

    const sectionTheme = document.createElement('section');
    sectionTheme.className = 'recommended-quizzes';
    sectionTheme.innerHTML = '<h2>Mes Thèmes</h2>';
    const gridTheme = document.createElement('div');
    gridTheme.className = 'quiz-cards';

    themes.forEach(theme => {
        gridTheme.appendChild(createInventoryCard(theme, 'theme'));
    });

    sectionTheme.appendChild(gridTheme);
    main.appendChild(sectionTheme);

    if (currentTheme && currentTheme.couleurPrincipal && currentTheme.couleurSecondaire) {
        const header = document.querySelector('header');
        if (header) {
            header.style.background = `linear-gradient(135deg, ${currentTheme.couleurPrincipal} 0%, ${currentTheme.couleurSecondaire} 100%)`;
            header.style.boxShadow = `0 4px 20px ${currentTheme.couleurSecondaire}4D`;
        }
    
        document.body.style.color = currentTheme.couleurTexteUn || '#ffffff';
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.background = `linear-gradient(90deg, ${currentTheme.couleurPrincipal}, ${currentTheme.couleurSecondaire})`;
        });
    
        const customStyle = document.createElement('style');
        customStyle.innerHTML = `
            .recommended-quizzes h2::after {
                background: linear-gradient(90deg, ${currentTheme.couleurPrincipal}, ${currentTheme.couleurSecondaire});
            }
            .footer-links a {
                color: ${currentTheme.couleurTexteUn};
            }
            .footer-links a:hover {
                color: #ffffff;
            }
            .quiz-card-btn{
                color: ${currentTheme.couleurPrincipal};
                border: 2px solid ${currentTheme.couleurPrincipal};
            }
            .quiz-card-btn:hover{
                background: linear-gradient(90deg, ${currentTheme.couleurPrincipal}, ${currentTheme.couleurSecondaire});
            }
        `;
        document.head.appendChild(customStyle);
    
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.background = `linear-gradient(135deg, ${currentTheme.couleurPrincipal} 0%, ${currentTheme.couleurSecondaire} 100%)`;
        }
    }
    
}

afficherAvatarEquipe().then(() => {
    afficherInventaire(); // Appelé après que le thème soit chargé
});

async function equiperItem(idItem, type) {
    const route = type === 'avatar' ? 'equip/avatar' : 'equip/theme';

    try {
        const res = await fetch(`${API_BASE}/${route}/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_item: idItem })
        });

        const data = await res.json();
        if (res.ok) {
            location.reload(); // Recharge pour voir le changement (optionnel)
        } else {
            alert(data.error || 'Erreur lors de l’équipement');
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
        alert('Erreur réseau');
    }
}
