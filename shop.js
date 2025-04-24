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

const profilePic = document.querySelector('.profile-pic');

if (profilePic) {
    const createProfileMenu = () => {
        if (!document.querySelector('.profile-menu')) {
            const menu = document.createElement('div');
            menu.className = 'profile-menu';

            const menuItems = [
                { text: 'Voir Profil', icon: '👤', href: username ? `profile.html?username=${username}` : 'profile.html' },
                { text: 'Paramètres', icon: '⚙️', href: 'settings.html' },
                { text: 'FAQ', icon: '❓', href: '#faq' },
                { text: 'Déconnexion', icon: '🚪', href: '#' }
            ];

            menuItems.forEach(item => {
                const menuItem = document.createElement('a');
                menuItem.href = item.href;
                menuItem.innerHTML = `<span class="menu-icon">${item.icon}</span> ${item.text}`;

                if (item.text === 'Déconnexion') {
                    menuItem.id = 'logout-link';
                }
                menu.appendChild(menuItem);
            });

            document.querySelector('.profile').appendChild(menu);

            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('jwt');
                    window.location.href = 'login.html';
                });
            }
        }
    };

    const toggleProfileMenu = () => {
        createProfileMenu();
        const menu = document.querySelector('.profile-menu');
        menu.classList.toggle('active');

        if (menu.classList.contains('active')) {
            document.addEventListener('click', closeMenuOnClickOutside);
        } else {
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    };

    const closeMenuOnClickOutside = (event) => {
        const menu = document.querySelector('.profile-menu');
        const profile = document.querySelector('.profile');

        if (!profile.contains(event.target)) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    };

    profilePic.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleProfileMenu();
    });
}

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
    return data;
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

    if (theme?.couleurPrincipal && theme?.couleurSecondaire) {
        button.style.border = `2px solid ${theme.couleurPrincipal}`;
        button.style.background = 'transparent';
        button.style.color = theme.couleurPrincipal;
        button.addEventListener('mouseenter', () => {
            button.style.background = `linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire})`;
            button.style.color = theme.couleurTexteUn || '#ffffff';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'transparent';
            button.style.color = theme.couleurPrincipal;
        });
    }

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

let theme = null;

async function afficherMagasin() {
    const avatars = await fetchAvatars();
    const themes = await fetchThemes();
    const equipped = await fetchEquipped();

    const equippedAvatarFile = equipped.avatar?.[0]?.nomFichier;
    theme = equipped.theme?.[0];

    const profileImg = document.querySelector('.profile-pic');
    if (profileImg && equippedAvatarFile) {
        profileImg.src = `ressources/avatars/${equippedAvatarFile}`;
    }

    if (theme && theme.couleurPrincipal && theme.couleurSecondaire) {
        const header = document.querySelector('header');
        if (header) {
            header.style.background = `linear-gradient(135deg, ${theme.couleurPrincipal} 0%, ${theme.couleurSecondaire} 100%)`;
            header.style.boxShadow = `0 4px 20px ${theme.couleurSecondaire}4D`; // 4D = 30% alpha en hex
        }

        document.body.style.color = theme.couleurTexteUn || '#ffffff';
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.background = `linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire})`;
        });

        document.querySelectorAll('.recommended-quizzes h2::after').forEach(elem => {
            elem.style.background = `linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire})`;
        });

        const customStyle = document.createElement('style');
        customStyle.innerHTML = `
            .recommended-quizzes h2::after {
                background: linear-gradient(90deg, ${theme.couleurPrincipal}, ${theme.couleurSecondaire});
            }
        `;
        document.head.appendChild(customStyle);

        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.background = theme.couleurSecondaire;
        }

        const styleFooterHover = document.createElement('style');
        styleFooterHover.innerHTML = `
            .footer-links a {
                color: ${theme.couleurTexteUn};
            }
            .footer-links a:hover {
                color: #FFFFFF;
            }
        `;
        document.head.appendChild(styleFooterHover);
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
