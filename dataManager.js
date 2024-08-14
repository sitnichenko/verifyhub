// dataManager.js - Управление данными

export function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

export function createProject(name, description, platforms) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    const initialFolder = {
        id: generateId(),
        name: 'Untitled',
        cases: []
    };

    const project = {
        id: generateId(),
        name: name,
        description: description,
        platforms: platforms,
        tests: [],
        folders: [initialFolder]
    };

    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));

    return project;
}

export function createProjectold() {
    const projectName = document.getElementById('project-name-input').value;
    const projectDescription = document.getElementById('project-description-input').value;
    const projectPlatforms = []; // Замените на вашу логику получения платформ

    if (!projectName) {
        console.error('Название проекта не указано.');
        return;
    }

    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    // Создание начальной папки
    const initialFolder = {
        id: 'untitled-folder-' + new Date().getTime(),
        name: 'Untitled',
        cases: [] // Инициализация как массив
    };

    const project = {
        name: projectName,
        description: projectDescription,
        platforms: projectPlatforms,
        tests: [],
        folders: [initialFolder] // Инициализация как массив
    };

    projects.push(project);

    localStorage.setItem('projects', JSON.stringify(projects));

    loadProjects(); // Обновите список проектов
    loadRepository(); // Обновите список репозитория
}


export function deleteProject(projectId) {
    let projects = loadProjects();
    projects = projects.filter(project => project.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(projects));
}

export function deleteProjectold(index) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects.splice(index, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    showToast('Проект успешно удалён', 'warning');
}


export function updateProject(projectId, updatedData) {
    let projects = loadProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    if (projectIndex !== -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...updatedData };
        localStorage.setItem('projects', JSON.stringify(projects));
    }
}

export function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; // Очистка списка перед обновлением

    projects.forEach((project, index) => {
        const projectElement = document.createElement('div');
        projectElement.classList.add('project-card');
        
        // Получаем количество тестов
        const testCount = project.tests ? project.tests.length : 0;
        const testCountText = testCount > 0 ? `Количество тестов: ${testCount}` : 'Тесты отсутствуют';
        
        projectElement.innerHTML = `
            <h2>${project.name}</h2>
            <p>${project.description}</p>
            <p>Платформы: ${project.platforms.join(', ')}</p>
            <p>${testCountText}</p>
            <button onclick="viewProject(${index})">Открыть</button>
            <button onclick="editProject(${index})">Редактировать</button>
            <button onclick="deleteProject(${index})">Удалить</button>
        `;
        projectList.appendChild(projectElement);
    });
    return JSON.parse(localStorage.getItem('projects')) || [];
}

export function loadArchiveRuns() {
    const archivedRuns = JSON.parse(localStorage.getItem('archivedRuns')) || [];
    const archiveList = document.getElementById('archive-list');
    archiveList.innerHTML = '';
    archivedRuns.forEach((run, index) => {
        const runCard = document.createElement('div');
        runCard.className = 'run-card';
        runCard.innerHTML = `
            <h2>${run.projectName}</h2>
            <div>
                ${run.tests.map((test, testIndex) => `
                    <div class="test-card ${test.status}">
                        <h3>${test.name}</h3>
                        <p>${test.description}</p>
                        <p>Платформа: ${test.platform}</p>
                        <select disabled>
                            <option value="unchecked" ${test.status === 'unchecked' ? 'selected' : ''}>Не проверено</option>
                            <option value="checked" ${test.status === 'checked' ? 'selected' : ''}>Проверено</option>
                            <option value="error" ${test.status === 'error' ? 'selected' : ''}>Ошибка</option>
                            <option value="retest" ${test.status === 'retest' ? 'selected' : ''}>Ретест</option>
                        </select>
                    </div>
                `).join('')}
            </div>
        `;
        archiveList.appendChild(runCard);
    });
}

export function addProject() {
    const modal = document.getElementById('add-project-modal');
    modal.style.display = 'block';

    // Сбрасываем состояние платформ при открытии модального окна
    resetForm();

    const saveButton = document.getElementById('save-project-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('project-name-input').value;
        const descriptionInput = document.getElementById('project-description-input').value;
        const platforms = Array.from(document.querySelectorAll('.platform-tile.selected')).map(tile => tile.getAttribute('data-platform'));
        const nameError = document.getElementById('project-name-error');
        const descriptionError = document.getElementById('project-description-error');

        let isValid = true;

        // Проверяем поле ввода имени проекта
        if (!nameInput) {
            nameError.textContent = 'Пожалуйста, введите название проекта.';
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }

        // Если все поля заполнены, сохраняем проект
        if (isValid) {
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            projects.push({ name: nameInput, description: descriptionInput, platforms: platforms, tests: [] });
            localStorage.setItem('projects', JSON.stringify(projects));
            loadProjects();
            showPage('projects');
            resetForm(); // Сброс формы
            modal.style.display = 'none';
            showToast('Проект успешно создан', 'success');
        }
    };

    // Обработчик события для кнопки "Отмена" в модальном окне
    const cancelButton = document.getElementById('cancel-project-button');
    cancelButton.onclick = function() {
        resetForm(); // Сброс формы
        modal.style.display = 'none'; // Скрытие модального окна без сохранения данных
    };

    // Обработчик события для кнопки закрытия модального окна (крестик)
    const closeButton = document.getElementById('close-project-button');
    closeButton.onclick = function() {
        resetForm(); // Сброс формы
        modal.style.display = 'none'; // Скрытие модального окна без сохранения данных
    };

    // Обработчик события для клика вне модального окна (закрывает окно)
    window.onclick = function(event) {
        if (event.target === modal) {
            resetForm(); // Сброс формы
            modal.style.display = 'none'; // Скрытие модального окна без сохранения данных
        }
    };
}

// Функция для сброса формы
export function resetForm() {
    // Очищаем поля ввода
    document.getElementById('project-name-input').value = '';
    document.getElementById('project-description-input').value = '';

    // Сбрасываем состояние плиток платформ
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.classList.remove('selected');
    });

    // Очищаем текст ошибок
    document.getElementById('project-name-error').textContent = '';
    document.getElementById('project-description-error').textContent = '';
}
window.resetForm = resetForm;

// Функция инициализации обработчиков кликов для плиток платформ (вызывается один раз)
export function initializePlatformSelection() {
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.addEventListener('click', toggleTileSelection);
    });
}
window.initializePlatformSelection = initializePlatformSelection;

// Функция для переключения выбора плитки платформ
function toggleTileSelection() {
    this.classList.toggle('selected');
}
window. toggleTileSelection = toggleTileSelection;

// Вызываем инициализацию обработчиков плиток платформ один раз при загрузке страницы
window.onload = function() {
    initializePlatformSelection();
}

export function updateProjectList(projects) {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item';
        projectElement.innerHTML = `<h3>${project.name}</h3><p>${project.description}</p>`;
        projectList.appendChild(projectElement);
    });
}