// uiManager.js - Управление интерфейсом



export function showPage(pageId) {
    const mainContent = document.getElementById('main-content');
    const loginPage = document.getElementById('login-page');

    if (pageId === 'login-page') {
        // Если это страница авторизации, скрываем основной контент
        mainContent.style.display = 'none';
        loginPage.style.display = 'flex';
        localStorage.removeItem('currentPage'); // Очищаем сохраненную страницу
        return;
    }

    // Если пользователь не авторизован и пытается попасть на другую страницу, кроме авторизации, перенаправляем на авторизацию
    if (!isAuthenticated()) {
        showPage('login-page');
        return;
    }

    // Отображаем основной контент и скрываем страницу авторизации
    mainContent.style.display = 'block';
    loginPage.style.display = 'none';

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });

    const currentPage = document.getElementById(pageId);
    if (currentPage) {
        currentPage.style.display = 'block'; // Показываем нужную страницу
        localStorage.setItem('currentPage', pageId); // Сохраняем текущую страницу
    }

    // Проверяем, является ли это страницей с деталями проекта
    if (pageId === 'project-detail') {
        const projectId = currentProjectId; // Убедитесь, что currentProjectId задан

        if (!projectId) {
            console.error('Идентификатор текущего проекта не установлен.');
            return;
        }

        // Загружаем и отображаем информацию о текущем проекте
        viewProject(projectId);
    }
}

window.showPage = showPage;

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    resetForm();
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    resetForm();
}

export function resetForm() {
    document.getElementById('project-name-input').value = '';
    document.getElementById('project-description-input').value = '';
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.classList.remove('selected');
    });
    document.getElementById('project-name-error').textContent = '';
    document.getElementById('project-description-error').textContent = '';
}

export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100); // Slight delay to trigger the CSS transition
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 500); // Duration of the hide animation
    }, 3000); // Duration to show the toast
}
window. showToast = showToast;

export function initializePlatformSelection() {
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.addEventListener('click', toggleTileSelection);
    });
}

export function toggleTileSelection() {
    this.classList.toggle('selected');
}

export function refreshPage() {
    localStorage.clear();
    location.reload();
}
window.refreshPage = refreshPage;

