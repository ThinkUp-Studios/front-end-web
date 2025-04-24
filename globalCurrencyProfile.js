// globalCurrencyProfile.js
const API_BASE = 'http://localhost:8000/api';

export function parseJWT(token) {
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

export async function fetchUserCurrency(username) {
    const res = await fetch(`${API_BASE}/users/${username}`);
    const data = await res.json();
    return data.currency;
}

export function displayCurrency(amount) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'flex-end';
    container.style.gap = '0.5rem';
    container.style.margin = '1rem 2rem 0 0';

    const icon = document.createElement('img');
    icon.src = 'ressources/currency/currency.png';
    icon.alt = 'currency';
    icon.style.width = '24px';
    icon.style.height = '24px';

    const amountText = document.createElement('span');
    amountText.textContent = amount;
    amountText.style.fontWeight = '600';
    amountText.style.color = '#facc15';
    amountText.style.fontSize = '1.1rem';

    container.appendChild(icon);
    container.appendChild(amountText);

    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(container, main.firstChild);
    }
}

export function setupProfileMenu(username) {
    const profilePic = document.querySelector('.profile-pic');

    if (!profilePic) return;

    const createProfileMenu = () => {
        if (!document.querySelector('.profile-menu')) {
            const menu = document.createElement('div');
            menu.className = 'profile-menu';

            const menuItems = [
                { text: 'Voir Profil', icon: '👤', href: `profile.html?username=${username}` },
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

export async function setProfilePicture(username) {
    const res = await fetch(`${API_BASE}/equipped/${username}`);
    const data = await res.json();
    const avatar = data.avatar?.[0]?.nomFichier;

    if (avatar) {
        const profileImg = document.querySelector('.profile-pic');
        if (profileImg) {
            profileImg.src = `ressources/avatars/${avatar}`;
        }
    }
}
