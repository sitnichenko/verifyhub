// dataManager.js - Управление данными

export let currentProjectId = null;

export function setCurrentProjectId(id) {
    console.log('setCurrentProjectId called with id:', id);
    currentProjectId = id;
}

document.addEventListener('DOMContentLoaded', function() {
    initializeProjectCreation();
});

function initializeProjectCreation() {
    const saveButton = document.getElementById('save-project-button');
    const cancelButton = document.getElementById('cancel-project-button');
    const closeButton = document.getElementById('close-project-button');
    const modal = document.getElementById('add-project-modal');

    // Убедитесь, что все элементы существуют перед их использованием
    if (!saveButton || !cancelButton || !closeButton || !modal) {
        console.error('Один или несколько элементов не найдены в DOM!');
        return;
    }

    // Привязка событий
    saveButton.addEventListener('click', handleSaveProject);
    cancelButton.addEventListener('click', () => modal.style.display = 'none');
    closeButton.addEventListener('click', () => modal.style.display = 'none');

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Инициализация платформ
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.addEventListener('click', function() {
            tile.classList.toggle('selected');
        });
    });
}

export function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

export function createProject(name, description, platforms) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    const initialFolder = {
        id: generateId(),
        name: 'Test Suites',
        cases: []
    };

    const project = {
        id: generateId(),
        name: name,
        description: description,
        type: 'project',  // Указание типа проекта
        platforms: platforms,
        testCount: 0,
        folders: [initialFolder],
        tests: []
    };

    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));

    return project;
}

export function updateProject(projectId, updatedData) {
    let projects = loadProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    if (projectIndex !== -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...updatedData };
        localStorage.setItem('projects', JSON.stringify(projects));
    }
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

export function loadProjectsAndRender() {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; // Очистка списка перед рендерингом

    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';

        // Создание элементов для отображения информации о проекте
        const projectName = document.createElement('h3');
        projectName.textContent = project.name;

        const projectDescription = document.createElement('p');
        projectDescription.textContent = project.description;

        const projectPlatforms = document.createElement('p');
        projectPlatforms.textContent = `Платформы: ${project.platforms.join(', ')}`;

        const projectTestCount = document.createElement('p');
        projectTestCount.textContent = `Количество тестов: ${project.testCount || 0}`; // Если testCount не определен, то 0

        // Кнопки для взаимодействия с проектом
        const openButton = document.createElement('button');
        openButton.textContent = 'Открыть';
        openButton.onclick = () => openProject(project.id);

        const editButton = document.createElement('button');
        editButton.textContent = 'Редактировать';
        editButton.onclick = () => editProject(project.id);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.onclick = () => deleteProject(project.id);

        // Добавление элементов в карточку проекта
        projectItem.appendChild(projectName);
        projectItem.appendChild(projectDescription);
        projectItem.appendChild(projectPlatforms);
        projectItem.appendChild(projectTestCount);
        projectItem.appendChild(openButton);
        projectItem.appendChild(editButton);
        projectItem.appendChild(deleteButton);

        // Добавление кликабельности всей карточке для открытия проекта
        projectItem.onclick = () => openProject(project.id);

        // Добавление карточки проекта в список проектов
        projectList.appendChild(projectItem);
    });
}
window.loadArchiveRuns = loadArchiveRuns;

// Функция для отображения проекта
export function viewProject(projectId) {
    console.log('viewProject called with projectId:', projectId);
    currentProjectId = projectId;
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        console.error('Проект не найден.');
        return;
    }
    
    // Обновляем содержимое элементов на странице
    document.getElementById('project-name').textContent = project.name;
    document.getElementById('project-description').textContent = project.description;
    
    const platformText = project.platforms.length > 0 ? `Платформы: ${project.platforms.join(', ')}` : 'Платформы не выбраны';
    document.getElementById('project-platform').textContent = platformText;
    
    loadTests(projectId); // Загрузка тестов для текущего проекта
    showPage('project-detail'); // Переход на раздел с деталями проекта
}
window.viewProject = viewProject;

// Функция для выбора проекта и загрузки тестов
export function selectProject(projectId) {
    console.log(`Выбор проекта с ID: ${projectId}`);
    setCurrentProjectId = projectId; // Устанавливаем текущий ID проекта
    loadTests(projectId); // Загрузить тесты для выбранного проекта
}
window.selectProject = selectProject;

// Функция для открытия проекта
export function openProject(projectId) {
    console.log(`Открытие проекта с ID: ${projectId}`);
    
    viewProject(projectId);
}
window.openProject = openProject;

// Функция для загрузки тестов 
function loadTests(projectId) {
    console.log(`Загрузка тестов для проекта с ID: ${projectId}`);
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.tests) {
        console.error('Тесты не найдены.');
        return;
    }
    
    // Логика отображения тестов проекта (например, обновление DOM)
    // Например:
    const testList = document.getElementById('test-list');
    testList.innerHTML = ''; // Очищаем список тестов
    
    project.tests.forEach(test => {
        const testItem = document.createElement('li');
        testItem.textContent = test.name;
        testList.appendChild(testItem);
    });
}


export function addProject() {
    const modal = document.getElementById('add-project-modal');
    modal.style.display = 'block';
    resetForm();

    function togglePlatformSelection() {
        this.classList.toggle('selected');
    }

    const saveButton = document.getElementById('save-project-button');
    saveButton.addEventListener('click', function() {
        // Проверяем, существуют ли элементы с нужными ID
        const nameInputElement = document.getElementById('project-name-input');
        const descriptionInputElement = document.getElementById('project-description-input');

        if (!nameInputElement || !descriptionInputElement) {
            console.error('Элементы ввода не найдены в DOM!');
            return;
        }

        // Получаем значения из полей
        const nameInput = nameInputElement.value.trim();
        const descriptionInput = descriptionInputElement.value.trim();

        // Получаем выбранные платформы
        const platforms = Array.from(document.querySelectorAll('.platform-tile.selected')).map(tile => tile.getAttribute('data-platform'));

        // Проверяем наличие имени проекта
        const nameError = document.getElementById('project-name-error');

        if (!nameInput) {
            nameError.textContent = 'Пожалуйста, введите название проекта.';
            nameError.style.display = 'block';
            return;  // Прерываем выполнение функции, если имя не введено
        } else {
            nameError.style.display = 'none';
        }

        // Формируем объект проекта
        const newProject = {
            id: generateId(),  // Уникальный ID
            name: nameInput,
            description: descriptionInput,
            type: 'project',  // Указание типа проекта
            platforms: platforms,
            testCount: 0,
            folders: [{
                id: generateId(),
                name: 'Test Suites',
                cases: []
            }],
            tests: []
        };

        // Получаем текущие проекты из localStorage
        const projects = JSON.parse(localStorage.getItem('projects')) || [];

        // Добавляем новый проект в массив
        projects.push(newProject);

        // Сохраняем обновленный массив проектов в localStorage
        localStorage.setItem('projects', JSON.stringify(projects));

        // Сброс формы и валидации
        resetForm();

        // Закрываем модальное окно
        modal.style.display = 'none';

        // Обновляем интерфейс (если требуется)
        loadProjectsAndRender();
    });

    // Обработчик для кнопки "Отмена"
    const cancelButton = document.getElementById('cancel-project-button');
    cancelButton.addEventListener('click', function() {
        resetForm();
        modal.style.display = 'none';
    });

    // Обработчик для закрытия окна
    const closeButton = document.getElementById('close-project-button');
    closeButton.addEventListener('click', function() {
        resetForm();
        modal.style.display = 'none';
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            resetForm();
            modal.style.display = 'none';
        }
    });
}

window.addProject = addProject;

export function handleSaveProject() {
    const nameInputElement = document.getElementById('project-name-input');
    const descriptionInputElement = document.getElementById('project-description-input');

    // Проверка существования элементов ввода
    if (!nameInputElement || !descriptionInputElement) {
        console.error('Элементы ввода не найдены!');
        return;
    }

    // Считывание значений из полей
    const nameInput = nameInputElement.value.trim();
    const descriptionInput = descriptionInputElement.value.trim();

    // Проверка имени проекта
    if (!nameInput) {
        const nameError = document.getElementById('project-name-error');
        nameError.textContent = 'Пожалуйста, введите название проекта.';
        nameError.style.display = 'block';
        return;
    }

    // Получение выбранных платформ
    const platforms = Array.from(document.querySelectorAll('.platform-tile.selected')).map(tile => tile.getAttribute('data-platform'));

    // Создание объекта проекта
    const newProject = {
        id: generateId(),  // Уникальный ID
        name: nameInput,
        description: descriptionInput,
        type: 'project',  // Указание типа проекта
        platforms: platforms,
        testCount: 0,
        folders: [{
            id: generateId(),
            name: 'Test Suites',
            cases: []
        }],
        tests: []
    };

    console.log('Созданный проект:', newProject);  // Лог проекта перед сохранением

    // Сохранение проекта в localStorage
    saveProjectToLocalStorage(newProject);

    // Сброс формы и закрытие модального окна
    resetForm();
    const modal = document.getElementById('add-project-modal');
    modal.style.display = 'none';

    // Обновление интерфейса
    loadProjectsAndRender();
}
window.handleSaveProject = handleSaveProject;

export function saveProjectToLocalStorage(project) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
}
window.saveProjectToLocalStorage = saveProjectToLocalStorage;


export function editProject(projectId) {
    // Открытие модального окна для редактирования проекта
    console.log(`Редактирование проекта с ID: ${projectId}`);
  
    const modal = document.getElementById('edit-project-modal');
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Поиск проекта по его уникальному ID
    const project = projects.find(proj => proj.id === projectId);

    if (!project) {
        console.error(`Проект с ID: ${projectId} не найден`);
        return;
    }

    // Заполняем поля данными текущего проекта
    document.getElementById('edit-project-name-input').value = project.name;
    document.getElementById('edit-project-description-input').value = project.description;

    // Установка состояния плиток и обработчиков кликов
    const platformTiles = document.querySelectorAll('#edit-project-modal .platform-tile');
    platformTiles.forEach(tile => {
        tile.classList.remove('selected');
    });

    project.platforms.forEach(platform => {
        const tile = document.querySelector(`#edit-project-modal .platform-tile[data-platform="${platform}"]`);
        if (tile) {
            tile.classList.add('selected');
        }
    });

    // Инициализация обработчиков кликов для плиток платформ
    platformTiles.forEach(tile => {
        tile.onclick = function() {
            tile.classList.toggle('selected');
        };
    });

    modal.style.display = 'block';

    const saveButton = document.getElementById('save-edit-project-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('edit-project-name-input').value.trim();
        const descriptionInput = document.getElementById('edit-project-description-input').value.trim();
        const selectedTiles = document.querySelectorAll('#edit-project-modal .platform-tile.selected');
        const platforms = Array.from(selectedTiles).map(tile => tile.getAttribute('data-platform'));
        const nameError = document.getElementById('edit-project-name-error');

        let isValid = true;

        // Проверка поля имени
        if (!nameInput) {
            nameError.textContent = 'Пожалуйста, введите название проекта.';
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }

        // Если все валидно, сохраняем изменения
        if (isValid) {
            project.name = nameInput;
            project.description = descriptionInput;
            project.platforms = platforms;

            // Сохранение изменений в localStorage
            localStorage.setItem('projects', JSON.stringify(projects));

            // Обновляем интерфейс
            loadProjectsAndRender();

            // Закрываем модальное окно
            modal.style.display = 'none';

            // Уведомляем пользователя об успешном обновлении
            showToast('Проект успешно обновлен', 'success');
        }
    };

    // Обработчик события для кнопки "Отмена" в модальном окне
    const cancelButton = document.getElementById('cancel-edit-project-button');
    cancelButton.onclick = function() {
        modal.style.display = 'none';
    };

    // Обработчик события для кнопки закрытия модального окна (крестик)
    const closeButton = document.getElementById('close-edit-project-button');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    // Обработчик события для клика вне модального окна (закрывает окно)
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

window.editProject = editProject;

export function deleteProject(projectId) {
    // Удаление проекта по ID
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const updatedProjects = projects.filter(project => project.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Перезагрузка списка проектов после удаления
    loadProjectsAndRender();
    console.log(`Удаление проекта с ID: ${projectId}`);
}
window. deleteProject = deleteProject;