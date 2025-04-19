document.addEventListener('DOMContentLoaded', function() {
    const profilePic = document.querySelector('.profile-pic');

    if (profilePic) {
        const parseJWT = (token) => {
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
        };

        const createProfileMenu = () => {
            if (!document.querySelector('.profile-menu')) {
                const token = localStorage.getItem('jwt');
                const decoded = token ? parseJWT(token) : null;
                const username = decoded?.username;

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
    initSettingsPage();
});


function initSettingsPage() {
    initSettingsTabs();
    initModals();
    initActionButtons();
    initToggles();
    initAppearanceSelectors();
}

function initSettingsTabs() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    
    if (!navItems.length) return;
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.settings-nav-item').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.querySelectorAll('.settings-section').forEach(section => {
                section.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function initModals() {
    const editModal = document.getElementById('edit-modal');
    if (!editModal) return;
    
    const modalTitle = document.getElementById('modal-title');
    const modalFields = document.getElementById('modal-fields');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    
    initNameEditor();
    initUsernameEditor();
    initBioEditor();
    initEmailEditor();
    initPasswordEditor();
    
    initDeleteConfirmation();
    
    function closeModal() {
        document.querySelectorAll('.edit-modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-modal')) {
            closeModal();
        }
    });
    
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            setTimeout(() => {
                alert('Modifications enregistrées avec succès!');
                closeModal();
            }, 500);
        });
    }
    
    function initNameEditor() {
        const updateNameBtn = document.getElementById('update-name-btn');
        if (updateNameBtn) {
            updateNameBtn.addEventListener('click', function() {
                modalTitle.textContent = 'Modifier vos informations';
                modalFields.innerHTML = `
                    <div class="form-field">
                        <label for="edit-firstname">Prénom</label>
                        <input type="text" id="edit-firstname" value="Martin" required>
                    </div>
                    <div class="form-field">
                        <label for="edit-lastname">Nom</label>
                        <input type="text" id="edit-lastname" value="Dubois" required>
                    </div>
                `;
                editModal.style.display = 'block';
            });
        }
    }
    
    function initUsernameEditor() {
        const updateUsernameBtn = document.getElementById('update-username-btn');
        if (updateUsernameBtn) {
            updateUsernameBtn.addEventListener('click', function() {
                modalTitle.textContent = 'Modifier votre nom d\'utilisateur';
                modalFields.innerHTML = `
                    <div class="form-field">
                        <label for="edit-username">Nom d'utilisateur</label>
                        <input type="text" id="edit-username" value="martindubois" required>
                        <p class="field-info">Votre nom d'utilisateur est unique et visible par tous les utilisateurs.</p>
                    </div>
                `;
                editModal.style.display = 'block';
            });
        }
    }
    
    function initBioEditor() {
        const updateBioBtn = document.getElementById('update-bio-btn');
        if (updateBioBtn) {
            updateBioBtn.addEventListener('click', function() {
                modalTitle.textContent = 'Modifier votre bio';
                modalFields.innerHTML = `
                    <div class="form-field">
                        <label for="edit-bio">Bio</label>
                        <textarea id="edit-bio" rows="4">Passionné de quiz et de jeux de connaissances. J'aime créer des quiz sur l'histoire et la science.</textarea>
                        <p class="field-info">Votre bio est visible sur votre profil public (maximum 160 caractères).</p>
                    </div>
                `;
                editModal.style.display = 'block';
            });
        }
    }
    
    function initEmailEditor() {
        const updateEmailBtn = document.getElementById('update-email-btn');
        if (updateEmailBtn) {
            updateEmailBtn.addEventListener('click', function() {
                modalTitle.textContent = 'Modifier votre adresse e-mail';
                modalFields.innerHTML = `
                    <div class="form-field">
                        <label for="edit-email">Nouvelle adresse e-mail</label>
                        <input type="email" id="edit-email" value="user@example.com" required>
                    </div>
                    <div class="form-field">
                        <label for="confirm-password">Mot de passe actuel</label>
                        <input type="password" id="confirm-password" placeholder="Entrez votre mot de passe pour confirmer" required>
                    </div>
                `;
                editModal.style.display = 'block';
            });
        }
    }
    
    function initPasswordEditor() {
        const updatePasswordBtn = document.getElementById('update-password-btn');
        if (updatePasswordBtn) {
            updatePasswordBtn.addEventListener('click', function() {
                modalTitle.textContent = 'Modifier votre mot de passe';
                modalFields.innerHTML = `
                    <div class="form-field">
                        <label for="current-password">Mot de passe actuel</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="form-field">
                        <label for="new-password">Nouveau mot de passe</label>
                        <input type="password" id="new-password" required>
                        <p class="field-info">Le mot de passe doit contenir au moins 8 caractères avec un mélange de lettres, chiffres et symboles.</p>
                    </div>
                    <div class="form-field">
                        <label for="confirm-new-password">Confirmer le nouveau mot de passe</label>
                        <input type="password" id="confirm-new-password" required>
                    </div>
                `;
                editModal.style.display = 'block';
            });
        }
    }
    
    function initDeleteConfirmation() {
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        const confirmModal = document.getElementById('confirm-modal');
        const confirmBtn = document.querySelector('.confirm-btn');
        
        if (deleteAccountBtn && confirmModal) {
            deleteAccountBtn.addEventListener('click', function() {
                confirmModal.style.display = 'block';
            });
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function() {
                    alert('Votre compte a été supprimé définitivement.');
                    window.location.href = 'main.html';
                });
            }
        }
    }
}

function initActionButtons() {
    const saveSettingsBtn = document.getElementById('save-settings');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            setTimeout(() => {
                alert('Paramètres enregistrés avec succès!');
            }, 500);
        });
    }
    
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir annuler? Les modifications non enregistrées seront perdues.')) {
                window.location.href = 'main.html';
            }
        });
    }
    
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', function() {
            alert('Dans une application réelle, cela ouvrirait un sélecteur de fichier pour télécharger une nouvelle photo de profil.');
        });
    }
}

function initToggles() {
    const toggleSwitches = document.querySelectorAll('.toggle-switch');
    
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
}

function initAppearanceSelectors() {
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            themeBtns.forEach(b => b.classList.remove('active'));
            
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme');
            
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else if (theme === 'light') {
                document.body.classList.remove('dark-mode');
            } else if (theme === 'system') {
                const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDarkMode) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        });
    });
    
    const textSizeBtns = document.querySelectorAll('.text-size-btn');
    
    textSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            textSizeBtns.forEach(b => b.classList.remove('active'));
            
            this.classList.add('active');
            
            const size = this.getAttribute('data-size');
            
            document.body.classList.remove('text-small', 'text-medium', 'text-large');
            
            if (size === 'small' || size === 'large') {
                document.body.classList.add(`text-${size}`);
            }
        });
    });
}