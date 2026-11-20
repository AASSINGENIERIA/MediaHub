// Sidebar Category Filtering
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
const categoryBlocks = document.querySelectorAll('.category-block');
const toolCards = document.querySelectorAll('.tool-card');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const filter = item.getAttribute('data-filter');

        if (filter === 'all') {
            categoryBlocks.forEach(cat => cat.style.display = 'block');
            toolCards.forEach(card => card.style.display = 'flex');
        } else if (filter === 'instaladas') {
            categoryBlocks.forEach(cat => {
                const installedCards = cat.querySelectorAll('.tool-card.installed');
                if (installedCards.length > 0) {
                    cat.style.display = 'block';
                    cat.querySelectorAll('.tool-card').forEach(card => {
                        card.style.display = card.classList.contains('installed') ? 'flex' : 'none';
                    });
                } else {
                    cat.style.display = 'none';
                }
            });
        } else {
            categoryBlocks.forEach(cat => {
                if (cat.getAttribute('data-category') === filter) {
                    cat.style.display = 'block';
                    cat.querySelectorAll('.tool-card').forEach(card => card.style.display = 'flex');
                } else {
                    cat.style.display = 'none';
                }
            });
        }
    });
});

// Search Input Filtering
const toolSearch = document.getElementById('toolSearch');
if (toolSearch) {
    toolSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        categoryBlocks.forEach(cat => {
            let visibleInBlock = 0;
            const cardsInBlock = cat.querySelectorAll('.tool-card');

            cardsInBlock.forEach(card => {
                const searchKeywords = (card.getAttribute('data-name') || '').toLowerCase();
                const cardTitle = card.querySelector('h3').textContent.toLowerCase();
                const cardDesc = card.querySelector('p').textContent.toLowerCase();

                if (searchKeywords.includes(query) || cardTitle.includes(query) || cardDesc.includes(query)) {
                    card.style.display = 'flex';
                    visibleInBlock++;
                } else {
                    card.style.display = 'none';
                }
            });

            cat.style.display = visibleInBlock > 0 ? 'block' : 'none';
        });
    });
}

// Sound Toggle Simulation
const btnSound = document.getElementById('btnSound');
const soundText = document.getElementById('soundText');
let soundEnabled = true;

if (btnSound) {
    btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = btnSound.querySelector('i');
        if (soundEnabled) {
            icon.className = 'fa-solid fa-volume-high';
            soundText.textContent = 'Sonido: Activado';
            showToast('Sonido', 'Efectos de audio activados');
        } else {
            icon.className = 'fa-solid fa-volume-xmark';
            soundText.textContent = 'Sonido: Silenciado';
            showToast('Sonido', 'Efectos de audio desactivados');
        }
    });
}

// Theme Toggle
const btnTheme = document.getElementById('btnTheme');
const themeText = document.getElementById('themeText');
let isDark = true;

if (btnTheme) {
    btnTheme.addEventListener('click', () => {
        isDark = !isDark;
        const icon = btnTheme.querySelector('i');
        if (isDark) {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            icon.className = 'fa-regular fa-sun';
            themeText.textContent = 'Modo Claro';
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            icon.className = 'fa-regular fa-moon';
            themeText.textContent = 'Modo Oscuro';
        }
    });
}

// Language Toggle Simulation
const btnLang = document.getElementById('btnLang');
let isEs = true;
if (btnLang) {
    btnLang.addEventListener('click', () => {
        isEs = !isEs;
        btnLang.querySelector('span').textContent = isEs ? 'English' : 'Español';
        showToast('Idioma', isEs ? 'Cambiado a Español' : 'Switched to English');
    });
}

// Action Toast Helper
function simulateAction(appName, action) {
    if (action === 'abrir') {
        showToast(appName, 'Lanzando aplicación local en segundo plano...');
    } else if (action === 'instalar') {
        showToast(appName, 'Descargando paquete de instalación de la suite...');
    }
}

function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}
