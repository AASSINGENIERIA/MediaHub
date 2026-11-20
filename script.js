// Estado global
let catalogData = null;
let currentLang = 'es';
let activeFilter = 'all';

// Mapeo de categorías con iconos FontAwesome
const categoryIconMap = {
    all: 'fa-shapes',
    tools: 'fa-toolbox',
    studio: 'fa-microphone-lines',
    admin: 'fa-chart-pie',
    security: 'fa-shield-halved',
    games: 'fa-gamepad',
    installed: 'fa-check'
};

// Cargar catálogo JSON
async function loadCatalog() {
    try {
        const response = await fetch(`catalog.json?t=${Date.now()}`);
        if (!response.ok) throw new Error('No se pudo cargar catalog.json');
        catalogData = await response.json();
        renderAll();
    } catch (err) {
        console.error('Error cargando catálogo:', err);
        showToast('Catálogo', 'Error al sincronizar con catalog.json');
    }
}

// Renderizar todo el sitio basado en catalog.json
function renderAll() {
    if (!catalogData) return;
    renderSidebar();
    renderContent();
    updateFooterStatus();
}

// Renderizar Sidebar
function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = '';

    const sections = catalogData.sections || {};
    const apps = Object.values(catalogData.apps || {}).filter(a => a.visible !== false);

    // Contadores por categoría
    const counts = { all: apps.length };
    apps.forEach(app => {
        const cat = app.category || 'tools';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    // Orden de secciones estándar
    const sectionKeys = ['all', 'tools', 'studio', 'admin', 'security', 'games'];

    sectionKeys.forEach(secKey => {
        const secInfo = sections[secKey];
        if (!secInfo && secKey !== 'all') return;

        const count = counts[secKey] || 0;
        const name = currentLang === 'es' ? (secInfo?.name_es || secKey) : (secInfo?.name_en || secKey);
        const iconClass = categoryIconMap[secKey] || 'fa-folder';

        const btn = document.createElement('button');
        btn.className = `nav-item ${activeFilter === secKey ? 'active' : ''}`;
        btn.setAttribute('data-filter', secKey);
        btn.innerHTML = `
            <i class="fa-solid ${iconClass} nav-icon"></i>
            <span>${name} (${count})</span>
        `;

        btn.addEventListener('click', () => {
            activeFilter = secKey;
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterContent();
        });

        nav.appendChild(btn);
    });
}

// Renderizar Contenido (Categorías y Tarjetas)
function renderContent() {
    const hub = document.getElementById('hubContainer');
    if (!hub) return;
    hub.innerHTML = '';

    const sections = catalogData.sections || {};
    const apps = Object.entries(catalogData.apps || {})
        .filter(([_, app]) => app.visible !== false);

    // Agrupar apps por categoria
    const grouped = {};
    apps.forEach(([key, app]) => {
        const cat = app.category || 'tools';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ key, ...app });
    });

    const categoryOrder = ['tools', 'studio', 'admin', 'security', 'games'];

    categoryOrder.forEach(catKey => {
        const appsInCat = grouped[catKey] || [];
        if (appsInCat.length === 0) return;

        const secInfo = sections[catKey] || {};
        const catName = currentLang === 'es' ? (secInfo.name_es || catKey) : (secInfo.name_en || catKey);
        const catDesc = currentLang === 'es' ? (secInfo.desc_es || '') : (secInfo.desc_en || '');
        const iconClass = categoryIconMap[catKey] || 'fa-folder';

        const sectionElem = document.createElement('section');
        sectionElem.className = 'category-block';
        sectionElem.setAttribute('data-category', catKey);

        sectionElem.innerHTML = `
            <div class="category-header">
                <div class="cat-title-wrap">
                    <i class="fa-solid ${iconClass} cat-icon"></i>
                    <h2>${catName}</h2>
                    <span class="cat-badge">${appsInCat.length}</span>
                </div>
                <p class="cat-desc">${catDesc}</p>
            </div>
            <div class="cards-grid"></div>
        `;

        const grid = sectionElem.querySelector('.cards-grid');

        appsInCat.forEach(app => {
            const card = createCardElement(app);
            grid.appendChild(card);
        });

        hub.appendChild(sectionElem);
    });
}

// Crear Elemento de Tarjeta
function createCardElement(app) {
    const card = document.createElement('div');
    card.className = `tool-card ${app.is_disabled ? 'is-coming' : ''}`;
    card.setAttribute('data-name', `${app.name_es || ''} ${app.name_en || ''}`);
    card.setAttribute('data-category', app.category || 'tools');

    const appName = currentLang === 'es' ? (app.name_es || app.name_en) : (app.name_en || app.name_es);
    const appDesc = currentLang === 'es' ? (app.description_es || app.description_en) : (app.description_en || app.description_es);
    const badgeText = currentLang === 'es' ? (app.badge_es || '') : (app.badge_en || '');

    // Icono (usando .ico local copiado si existe o fallback)
    const iconFileName = app.key ? `${app.key}.ico` : (app.icon ? app.icon.replace(/\.(png|webp)$/, '.ico') : '');
    const iconHtml = `<img src="assets/icons/${iconFileName}" alt="${appName}" class="app-icon-img" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fa-solid fa-cube\\'></i>';">`;

    card.innerHTML = `
        <div class="card-top">
            <div class="app-icon custom-app-icon">
                ${iconHtml}
            </div>
            ${badgeText ? `<span class="tag tag-auto">${badgeText}</span>` : ''}
            <button class="card-dots-btn" aria-label="Opciones" onclick="openAppModal('${escapeHtml(appName)}')">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
        </div>
        <h3>${appName}</h3>
        <p>${appDesc}</p>
        <div class="card-bottom">
            <span class="status ${app.is_disabled ? 'status-coming' : 'status-ready'}">
                <span class="dot"></span> ${app.is_disabled ? 'Disponible en Launcher' : 'Disponible en Launcher'}
            </span>
            <button class="btn-action btn-install" onclick="openAppModal('${escapeHtml(appName)}')">Obtener</button>
        </div>
    `;

    return card;
}

function escapeHtml(str) {
    return (str || '').replace(/'/g, "\\'");
}

// Filtrar según navegación activa
function filterContent() {
    const blocks = document.querySelectorAll('.category-block');
    blocks.forEach(block => {
        const cat = block.getAttribute('data-category');
        if (activeFilter === 'all' || activeFilter === cat) {
            block.style.display = 'block';
        } else {
            block.style.display = 'none';
        }
    });
}

// Búsqueda en tiempo real
const toolSearch = document.getElementById('toolSearch');
if (toolSearch) {
    toolSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const blocks = document.querySelectorAll('.category-block');

        blocks.forEach(block => {
            let visibleInBlock = 0;
            const cards = block.querySelectorAll('.tool-card');

            cards.forEach(card => {
                const name = card.getAttribute('data-name').toLowerCase();
                const text = card.textContent.toLowerCase();
                if (name.includes(query) || text.includes(query)) {
                    card.style.display = 'flex';
                    visibleInBlock++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (activeFilter === 'all' || block.getAttribute('data-category') === activeFilter) {
                block.style.display = visibleInBlock > 0 ? 'block' : 'none';
            }
        });
    });
}

// Footer Status
function updateFooterStatus() {
    const countElem = document.getElementById('statusCount');
    if (!countElem || !catalogData) return;
    const apps = Object.values(catalogData.apps || {}).filter(a => a.visible !== false);
    countElem.innerHTML = `<i class="fa-solid fa-check"></i> ${apps.length} herramientas sincronizadas con catalog.json • Catálogo Oficial`;
}

// Modal Helper
const modal = document.getElementById('appModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');

function openAppModal(appName) {
    if (!modal) return;
    modalTitle.textContent = `${appName}`;
    modalDesc.textContent = `"${appName}" se encuentra integrada y lista para ejecutar a través de MediaHub Launcher. Descarga e instala el lanzador oficial para utilizarla en tu PC.`;
    modal.classList.add('active');
}

function closeModal() {
    if (modal) modal.classList.remove('active');
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Sound Toggle
const btnSound = document.getElementById('btnSound');
const soundText = document.getElementById('soundText');
let soundEnabled = true;

if (btnSound) {
    btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = btnSound.querySelector('i');
        if (soundEnabled) {
            icon.className = 'fa-solid fa-volume-high';
            soundText.textContent = currentLang === 'es' ? 'Sonido: Activado' : 'Sound: Enabled';
            showToast('Sonido', 'Efectos activados');
        } else {
            icon.className = 'fa-solid fa-volume-xmark';
            soundText.textContent = currentLang === 'es' ? 'Sonido: Silenciado' : 'Sound: Muted';
            showToast('Sonido', 'Efectos silenciados');
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
            themeText.textContent = currentLang === 'es' ? 'Modo Claro' : 'Light Mode';
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            icon.className = 'fa-regular fa-moon';
            themeText.textContent = currentLang === 'es' ? 'Modo Oscuro' : 'Dark Mode';
        }
    });
}

// Language Toggle
const btnLang = document.getElementById('btnLang');
const langText = document.getElementById('langText');
if (btnLang) {
    btnLang.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        langText.textContent = currentLang === 'es' ? 'English' : 'Español';
        renderAll();
        showToast('Idioma', currentLang === 'es' ? 'Cambiado a Español' : 'Switched to English');
    });
}

// Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast) return;

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', loadCatalog);
