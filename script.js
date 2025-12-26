
document.addEventListener('DOMContentLoaded', () => {
    // Получаем последнюю сохраненную страницу из localStorage
    const savedPage = localStorage.getItem('currentPage');

    // Проверка авторизации при загрузке страницы
    if (!isAuthenticated()) {
        showPage('login-page');
    } else {
        // Если страница сохранена, показываем её, иначе показываем дашборд
        if (savedPage) {
            showPage(savedPage);
        } else {
            showPage('dashboard');
        }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});


const USERNAME = '1';
const PASSWORD = '1';

function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const tokenExpiration = localStorage.getItem('authTokenExpiration');
    const currentTime = new Date().getTime();
    return tokenExpiration && currentTime < tokenExpiration;
}

function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('login-error');

    if (username === 'roma@paperpaper.ru' && password === 'IKrestmaynHHP00') {
        const token = 'exampleToken';
        const expirationTime = new Date().getTime() + 10800000; // 3 часа

        localStorage.setItem('authToken', token);
        localStorage.setItem('authTokenExpiration', expirationTime);

        showPage('dashboard');
    } else {
        loginError.textContent = 'Неверный логин или пароль.';
    }
}

function logout() {
    // Удаляем токен и данные авторизации
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    localStorage.removeItem('currentPage'); // Удаляем сохраненную страницу

    // Перенаправляем на страницу авторизации
    showPage('login-page');
}


function showPage(pageId) {
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
}

function loadProjects() {
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
}

function createProject() {
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



// Функция инициализации обработчиков кликов для плиток платформ (вызывается один раз)
function initializePlatformSelection() {
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.addEventListener('click', toggleTileSelection);
    });
}

// Функция для переключения выбора плитки платформ
function toggleTileSelection() {
    this.classList.toggle('selected');
}

function addProject() {
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
function resetForm() {
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

// Функция инициализации обработчиков кликов для плиток платформ (вызывается один раз)
function initializePlatformSelection() {
    const platformTiles = document.querySelectorAll('.platform-tile');
    platformTiles.forEach(tile => {
        tile.addEventListener('click', toggleTileSelection);
    });
}

// Функция для переключения выбора плитки платформ
function toggleTileSelection() {
    this.classList.toggle('selected');
}

// Вызываем инициализацию обработчиков плиток платформ один раз при загрузке страницы
window.onload = function() {
    initializePlatformSelection();
}

function editProject(index) {
    const modal = document.getElementById('edit-project-modal');
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects[index];

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
    initializePlatformSelection();

    modal.style.display = 'block';

    const saveButton = document.getElementById('save-edit-project-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('edit-project-name-input').value;
        const descriptionInput = document.getElementById('edit-project-description-input').value;
        const selectedTiles = document.querySelectorAll('#edit-project-modal .platform-tile.selected');
        const platforms = Array.from(selectedTiles).map(tile => tile.getAttribute('data-platform'));
        const nameError = document.getElementById('edit-project-name-error');
        const descriptionError = document.getElementById('edit-project-description-error');

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
            projects[index].name = nameInput;
            projects[index].description = descriptionInput;
            projects[index].platforms = platforms;
            localStorage.setItem('projects', JSON.stringify(projects));
            loadProjects();
            modal.style.display = 'none';
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


function deleteProject(index) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects.splice(index, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    showToast('Проект успешно удалён', 'warning');
}


function viewProject(index) {
    currentProjectIndex = index;
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects[index];
    
    if (!project) {
        console.error('Проект не найден.');
        return;
    }
    
    document.getElementById('project-name').textContent = project.name;
    document.getElementById('project-description').textContent = project.description;
    
    const platformText = project.platforms.length > 0 ? `Платформы: ${project.platforms.join(', ')}` : 'Платформы не выбраны';
    document.getElementById('project-platform').textContent = platformText;
    
    loadTests(); // Загрузка тестов для текущего проекта
    showPage('project-detail');
}

function selectProject(index) {
    currentProjectIndex = index;
    loadTests(); // Загрузить тесты для выбранного проекта
}

// Функция для загрузки тестов в карточку проекта и папки
function loadTests() {
    if (currentProjectIndex === null || currentProjectIndex === undefined) {
        console.error('Текущий проект не установлен.');
        return;
    }

    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects[currentProjectIndex];

    if (!project) {
        console.error('Текущий проект не найден.');
        return;
    }

    const testList = document.getElementById('test-list');
    const testCountElement = document.getElementById('test-count');
    const folderCaseContainers = document.querySelectorAll('.case-container');

    testList.innerHTML = '';

    folderCaseContainers.forEach(container => container.innerHTML = ''); // Очистка контейнеров

    if (!project.tests || project.tests.length === 0) {
        testList.innerHTML = '<p>Тесты отсутствуют.</p>';
        testCountElement.textContent = '';
        return;
    }

    testCountElement.textContent = `Количество тестов: ${project.tests.length}`;

    project.tests.forEach((test, testIndex) => {
        // Создание карточки теста
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <h3>${test.name}</h3>
            <p>${test.description}</p>
            <p>Платформа: ${test.platform.join(', ')}</p>
            <button onclick="editTest(${testIndex}, ${currentProjectIndex})">Редактировать</button>
            <button onclick="deleteTest(${testIndex}, ${currentProjectIndex})">Удалить</button>
        `;
        testList.appendChild(testCard);

        // Обновление папок
        project.folders.forEach(folder => {
            const folderCaseContainer = document.getElementById(`folder-${folder.id}-cases`);
            if (folderCaseContainer) {
                const caseElement = document.createElement('div');
                caseElement.className = 'case';
                caseElement.innerHTML = `<span>${test.name}</span>`;
                folderCaseContainer.appendChild(caseElement);
            }
        });
    });
}


function addTest() {
    const modal = document.getElementById('add-test-modal');
    const platformTilesContainer = document.getElementById('test-platform-tiles');

    if (!platformTilesContainer) {
        console.error('Элемент с ID "test-platform-tiles" не найден в DOM.');
        return;
    }

    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const currentProject = projects[currentProjectIndex];

    if (!currentProject || !Array.isArray(currentProject.platforms)) {
        console.error('Данные о текущем проекте или платформах отсутствуют.');
        return;
    }

    platformTilesContainer.innerHTML = '';

    const allPlatforms = ['web', 'android', 'ios'];
    allPlatforms.forEach(platform => {
        const tile = document.createElement('div');
        tile.className = 'platform-tile';
        tile.setAttribute('data-platform', platform);
        tile.textContent = capitalize(platform);
        if (currentProject.platforms.includes(platform)) {
            tile.classList.add('selected');
        }
        tile.onclick = function() {
            this.classList.toggle('selected');
        };
        platformTilesContainer.appendChild(tile);
    });

    modal.style.display = 'block';

    const saveButton = document.getElementById('save-test-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('test-name-input').value;
        const descriptionInput = document.getElementById('test-description-input').value;
        const selectedTiles = document.querySelectorAll('#test-platform-tiles .platform-tile.selected');
        const platforms = Array.from(selectedTiles).map(tile => tile.getAttribute('data-platform'));

        const nameError = document.getElementById('test-name-error');
        const platformError = document.getElementById('test-platform-error');

        let isValid = true;

        if (!nameInput) {
            nameError.textContent = 'Пожалуйста, введите название теста.';
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }

        if (isValid) {
            if (currentProjectIndex !== null && projects[currentProjectIndex]) {
                const project = projects[currentProjectIndex];

                if (!Array.isArray(project.folders)) {
                    console.error('Свойство folders должно быть массивом.');
                    project.folders = [];
                }

                if (project.folders.length === 0) {
                    // Создание начальной папки, если нет папок
                    const initialFolder = {
                        id: 'untitled-folder-' + new Date().getTime(),
                        name: 'Untitled',
                        cases: []
                    };
                    project.folders.push(initialFolder);
                }

                // Добавление теста в проект
                project.tests.push({
                    name: nameInput,
                    description: descriptionInput,
                    platform: platforms,
                    status: 'unchecked'
                });

                // Добавление теста в первую папку
                if (project.folders.length > 0) {
                    const folder = project.folders[0]; // Выберите нужную папку
                    folder.cases.push({
                        name: nameInput
                    });
                }

                localStorage.setItem('projects', JSON.stringify(projects));
                loadTests(); // Обновите список тестов
                modal.style.display = 'none';
                clearTestModalFields();
                showToast('Тест успешно добавлен', 'success');
            }
        }
    };

    const cancelButton = document.getElementById('cancel-test-button');
    cancelButton.onclick = function() {
        modal.style.display = 'none';
        clearTestModalFields();
    };

    const closeButton = document.getElementById('close-add-test-button');
    closeButton.onclick = function() {
        modal.style.display = 'none';
        clearTestModalFields();
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            clearTestModalFields();
        }
    };
}



function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function clearTestModalFields() {
    document.getElementById('test-name-input').value = '';
    document.getElementById('test-description-input').value = '';
    document.querySelectorAll('#test-platform-tiles .platform-tile').forEach(tile => tile.classList.remove('selected'));
    document.getElementById('test-name-error').style.display = 'none';
    document.getElementById('test-platform-error').style.display = 'none';
}


function editTest(testIndex, projectIndex) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const test = projects[projectIndex]?.tests[testIndex];

    if (!test) {
        console.error('Тест не найден.');
        return;
    }

    // Предзаполнение данных теста в модальное окно
    document.getElementById('edit-test-name-input').value = test.name;
    document.getElementById('edit-test-description-input').value = test.description;

    const modal = document.getElementById('edit-test-modal');
    const platformTilesContainer = document.getElementById('edit-test-platform-tiles');
    platformTilesContainer.innerHTML = '';

    const allPlatforms = ['web', 'android', 'ios'];
    allPlatforms.forEach(platform => {
        const tile = document.createElement('div');
        tile.className = 'platform-tile';
        tile.setAttribute('data-platform', platform);
        tile.textContent = capitalize(platform);

        if (test.platform.includes(platform)) {
            tile.classList.add('selected');
        }

        tile.onclick = function() {
            this.classList.toggle('selected');
        };

        platformTilesContainer.appendChild(tile);
    });

    modal.style.display = 'block';

    const saveButton = document.getElementById('save-edit-test-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('edit-test-name-input').value;
        const descriptionInput = document.getElementById('edit-test-description-input').value;
        const selectedTiles = document.querySelectorAll('#edit-test-platform-tiles .platform-tile.selected');
        const platforms = Array.from(selectedTiles).map(tile => tile.getAttribute('data-platform'));

        const nameError = document.getElementById('edit-test-name-error');
        let isValid = true;

        if (!nameInput) {
            nameError.textContent = 'Пожалуйста, введите название теста.';
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }

        if (isValid) {
            projects[projectIndex].tests[testIndex] = {
                ...test,
                name: nameInput,
                description: descriptionInput,
                platform: platforms
            };

            localStorage.setItem('projects', JSON.stringify(projects));
            
            loadTests(); // Обновляем тесты на странице проекта
            loadRepository(); // Обновляем тесты на странице репозитория
            
            modal.style.display = 'none';
            clearEditTestModalFields();
            showToast('Тест успешно обновлен', 'info');
        }
    };

    const cancelButton = document.getElementById('cancel-edit-test-button');
    const closeButton = document.getElementById('close-edit-test-button');

    cancelButton.onclick = function() {
        modal.style.display = 'none';
        clearEditTestModalFields();
    };

    closeButton.onclick = function() {
        modal.style.display = 'none';
        clearEditTestModalFields();
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            clearEditTestModalFields();
        }
    };

    function clearEditTestModalFields() {
        document.getElementById('edit-test-name-input').value = '';
        document.getElementById('edit-test-description-input').value = '';
        document.querySelectorAll('#edit-test-platform-tiles .platform-tile').forEach(tile => tile.classList.remove('selected'));
        document.getElementById('edit-test-name-error').style.display = 'none';
    }
}

function updateTestInProjectDOM(testIndex, projectIndex, updatedTest) {
    const projectContainers = document.querySelectorAll('.project-container');
    const testCards = projectContainers[projectIndex]?.querySelectorAll('.test-card');

    if (testCards && testCards[testIndex]) {
        const testCard = testCards[testIndex];
        testCard.innerHTML = `
            <h3>${updatedTest.name}</h3>
            <p>${updatedTest.description}</p>
            <p>Платформа: ${updatedTest.platform.join(', ')}</p>
            <button onclick="editTest(${testIndex}, ${projectIndex})">Редактировать</button>
            <button onclick="deleteTest(${testIndex}, ${projectIndex})">Удалить</button>
        `;
    }
}

function deleteTest(testIndex, projectIndex) {
    // Установка currentProjectIndex на индекс текущего проекта
    currentProjectIndex = projectIndex;

    // Проверка наличия проектов
    const projects = JSON.parse(localStorage.getItem('projects'));
    if (!projects || projectIndex >= projects.length) {
        console.error('Индекс проекта некорректен или проект не найден.');
        return;
    }

    // Получение текущего проекта
    const project = projects[projectIndex];
    
    // Проверка наличия тестов и корректность индекса теста
    if (!project.tests || testIndex >= project.tests.length) {
        console.error('Тест не найден.');
        return;
    }

    // Удаление теста
    project.tests.splice(testIndex, 1);
    localStorage.setItem('projects', JSON.stringify(projects));

    // Обновление отображения тестов и репозитория
    if (document.getElementById('project-detail')) {
        loadTests(); // Обновляем тесты на странице проекта
    }

    loadRepository(); // Обновляем репозиторий на странице

    showToast('Тест удален успешно', 'warning');
}

function createRun(projectName, testCount) {
    const tests = [];
    for (let i = 0; i < testCount; i++) {
        tests.push({
            name: `Тест ${i + 1}`,
            description: `Описание теста ${i + 1}`,
            platform: `Платформа ${i + 1}`,
            status: 'unchecked' // Устанавливаем статус "Не проверено" для каждого теста
        });
    }

    const newRun = {
        projectName: projectName,
        tests: tests
    };

    const runs = JSON.parse(localStorage.getItem('runs')) || [];
    runs.push(newRun);
    localStorage.setItem('runs', JSON.stringify(runs));

    loadRuns(); // Загружаем прогоны с обновленными данными
}

function loadRepository() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const repositoryList = document.getElementById('repository-list');
    repositoryList.innerHTML = ''; // Очистка предыдущего содержимого

    projects.forEach((project, projectIndex) => {
        const projectContainer = document.createElement('div');
        projectContainer.className = 'project-container';

        const projectTitle = document.createElement('h2');
        projectTitle.textContent = project.name;
        projectContainer.appendChild(projectTitle);

        const testCount = project.tests ? project.tests.length : 0;
        const testCountText = testCount > 0 ? `Количество тестов: ${testCount}` : 'Тесты отсутствуют';
        
        const testCountElement = document.createElement('p');
        testCountElement.textContent = testCountText;
        projectContainer.appendChild(testCountElement);

        if (project.tests && project.tests.length > 0) {
            const testList = document.createElement('div');
            testList.className = 'test-list';

            project.tests.forEach((test, testIndex) => {
                const platforms = Array.isArray(test.platform) ? test.platform : [test.platform];

                const testCard = document.createElement('div');
                testCard.className = 'test-card';
                testCard.innerHTML = `
                    <h3>${test.name}</h3>
                    <p>${test.description}</p>
                    <p>Платформа: ${platforms.join(', ')}</p>
                    <button onclick="editTest(${testIndex}, ${projectIndex})">Редактировать</button>
                    <button onclick="deleteTest(${testIndex}, ${projectIndex})">Удалить</button>
                `;
                testList.appendChild(testCard);
            });

            projectContainer.appendChild(testList);
        } else {
            `Количество тестов: ${testCount}`
        }

        repositoryList.appendChild(projectContainer);
    });
}

function updateFolderView() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects[currentProjectIndex];

    if (!project || !project.folders) return;

    // Очистка существующих папок
    const folderContainers = document.querySelectorAll('.folder');
    folderContainers.forEach(container => container.querySelector('.case-container').innerHTML = '');

    project.folders.forEach(folder => {
        const folderContainer = document.getElementById(`folder-${folder.id}-cases`);
        if (folderContainer) {
            folder.cases.forEach(folderTest => {
                const caseElement = document.createElement('div');
                caseElement.className = 'case';
                caseElement.innerHTML = `<span>${folderTest.name}</span>`;
                folderContainer.appendChild(caseElement);
            });
        }
    });
}


function loadRuns() {
    const runs = JSON.parse(localStorage.getItem('runs')) || [];
    const runList = document.getElementById('run-list');
    runList.innerHTML = '';
    runs.forEach((run, index) => {
        const totalTests = run.tests.length;
        const completedTests = run.tests.filter(test => test.status !== 'unchecked').length;
        const completionPercentage = Math.round((completedTests / totalTests) * 100);

        // Статистика по статусам тестов
        const statusCounts = {
            checked: 0,
            unchecked: 0,
            error: 0,
            retest: 0
        };
        run.tests.forEach(test => {
            statusCounts[test.status]++;
        });

        const runCard = document.createElement('div');
        runCard.className = 'run-card';
        runCard.innerHTML = `
            <h2>${run.projectName}</h2>
            <div class="run-stats">
                <p>Общее количество тестов: ${totalTests}</p>
                <p>Проверено: ${statusCounts.checked}</p>
                <p>Не проверено: ${statusCounts.unchecked}</p>
                <p>Ошибка: ${statusCounts.error}</p>
                <p>Ретест: ${statusCounts.retest}</p>
                <p>Процент выполненных тестов: ${completionPercentage}%</p>
            </div>
            <div>
                ${run.tests.map((test, testIndex) => `
                    <div class="test-card ${test.status}">
                        <h3>${test.name}</h3>
                        <p>${test.description}</p>
                        <p>Платформа: ${test.platform}</p>
                        <select onchange="updateTestStatus(${index}, ${testIndex}, this.value)">
                            <option value="unchecked" ${test.status === 'unchecked' ? 'selected' : ''}>Не проверено</option>
                            <option value="checked" ${test.status === 'checked' ? 'selected' : ''}>Проверено</option>
                            <option value="error" ${test.status === 'error' ? 'selected' : ''}>Ошибка</option>
                            <option value="retest" ${test.status === 'retest' ? 'selected' : ''}>Ретест</option>
                        </select>
                    </div>
                `).join('')}
            </div>
            <button onclick="finishRun(${index})">Завершить прогон</button>
        `;
        runList.appendChild(runCard);
    });
}


function updateTestStatus(runIndex, testIndex, newStatus) {
    const runs = JSON.parse(localStorage.getItem('runs')) || [];
    const run = runs[runIndex];
    if (run) {
        run.tests[testIndex].status = newStatus;
        localStorage.setItem('runs', JSON.stringify(runs));
        loadRuns(); // Перезагрузка списка прогонов после обновления статуса
    } else {
        console.error(`Прогон с индексом ${runIndex} не найден.`);
    }
}


function countTestStatuses(tests) {
    const statusCounts = {
        checked: 0,
        unchecked: 0,
        error: 0,
        retest: 0
    };
    tests.forEach(test => {
        statusCounts[test.status]++;
    });
    return Object.values(statusCounts);
}

function calculateCompletionPercentage(tests) {
    const totalTests = tests.length;
    const completedTests = tests.filter(test => test.status !== 'unchecked').length;
    return Math.round((completedTests / totalTests) * 100);
}

function updateRunStatistics(runIndex) {
    const run = JSON.parse(localStorage.getItem('runs'))[runIndex];
    const totalTests = run.tests.length;
    const completedTests = run.tests.filter(test => test.status !== 'unchecked').length;
    const completionPercentage = Math.round((completedTests / totalTests) * 100);

    // Статистика по статусам тестов
    const statusCounts = {
        checked: 0,
        unchecked: 0,
        error: 0,
        retest: 0
    };
    run.tests.forEach(test => {
        statusCounts[test.status]++;
    });

    // Обновляем соответствующие элементы DOM с новыми данными
    const runCard = document.getElementById(`run-${runIndex}`);
    runCard.querySelector('.run-total-tests').textContent = `Общее количество тестов: ${totalTests}`;
    runCard.querySelector('.run-checked-tests').textContent = `Проверено: ${statusCounts.checked}`;
    runCard.querySelector('.run-unchecked-tests').textContent = `Не проверено: ${statusCounts.unchecked}`;
    runCard.querySelector('.run-error-tests').textContent = `Ошибка: ${statusCounts.error}`;
    runCard.querySelector('.run-retest-tests').textContent = `Ретест: ${statusCounts.retest}`;
    runCard.querySelector('.run-completion-percentage').textContent = `Процент выполненных тестов: ${completionPercentage}%`;
}


function addRun() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    if (projects.length === 0) {
        alert('Сначала создайте хотя бы один проект.');
        return;
    }

    const projectIndex = prompt(`Введите номер проекта (от 1 до ${projects.length}):`);
    if (projectIndex && projectIndex > 0 && projectIndex <= projects.length) {
        const project = projects[projectIndex - 1];
        const runs = JSON.parse(localStorage.getItem('runs')) || [];
        runs.push({ projectName: project.name, tests: project.tests.map(test => ({ ...test })) });
        localStorage.setItem('runs', JSON.stringify(runs));
        loadRuns();
        showPage('runs');
    }
}

function finishRun(runIndex) {
    const runs = JSON.parse(localStorage.getItem('runs'));
    const finishedRun = runs.splice(runIndex, 1)[0];
    let archivedRuns = JSON.parse(localStorage.getItem('archivedRuns')) || [];
    archivedRuns.push(finishedRun);
    localStorage.setItem('runs', JSON.stringify(runs));
    localStorage.setItem('archivedRuns', JSON.stringify(archivedRuns));
    loadRuns();
    loadArchiveRuns();
}

function loadArchiveRuns() {
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

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadArchiveRuns();
    showPage(savedPage);

    // Инициализация модальных окон для добавления и редактирования тестов
    document.getElementById('add-test-modal').style.display = 'none';
    document.getElementById('edit-test-modal').style.display = 'none';
});

document.getElementById('toggle-sidebar').addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    sidebar.classList.toggle('hidden');
    container.classList.toggle('shifted');
});

function showToast(message, type = 'info') {
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

function exportData() {
    // Собираем данные из localStorage
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const runs = JSON.parse(localStorage.getItem('runs')) || [];
    const archivedRuns = JSON.parse(localStorage.getItem('archivedRuns')) || [];

    // Создаем объект для экспорта
    const data = {
        projects: projects,
        runs: runs,
        archivedRuns: archivedRuns
    };

    // Преобразуем объект в JSON-строку
    const jsonData = JSON.stringify(data, null, 2);

    // Создаем Blob для скачивания
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Создаем временный элемент для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-export.json';
    document.body.appendChild(a);
    a.click();

    // Удаляем временный элемент и освобождаем URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
document.getElementById('export-button').addEventListener('click', exportData);

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);

            if (jsonData.projects && jsonData.runs && jsonData.archivedRuns) {
                // Считываем текущие данные из localStorage
                const currentProjects = JSON.parse(localStorage.getItem('projects')) || [];
                const currentRuns = JSON.parse(localStorage.getItem('runs')) || [];
                const currentArchivedRuns = JSON.parse(localStorage.getItem('archivedRuns')) || [];

                // Объединяем текущие данные с импортированными
                const newProjects = [...currentProjects, ...jsonData.projects];
                const newRuns = [...currentRuns, ...jsonData.runs];
                const newArchivedRuns = [...currentArchivedRuns, ...jsonData.archivedRuns];

                // Сохраняем объединенные данные обратно в localStorage
                localStorage.setItem('projects', JSON.stringify(newProjects));
                localStorage.setItem('runs', JSON.stringify(newRuns));
                localStorage.setItem('archivedRuns', JSON.stringify(newArchivedRuns));

                alert('Данные успешно импортированы!');

                // Сброс текущего проекта
                currentProjectIndex = null;

                // Обновляем отображение проектов, прогонов и архивов
                loadProjects();
                loadRuns();
                loadArchiveRuns();
                loadRepository(); // Обновляем страницу репозитория
            } else {
                alert('Некорректная структура данных в JSON файле.');
            }
        } catch (error) {
            alert('Ошибка при чтении или парсинге файла: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Функции loadRuns и loadArchiveRuns остаются без изменений
// Они будут автоматически отображать новые данные после импорта

document.getElementById('export-button').addEventListener('click', exportData);
document.getElementById('import-file').addEventListener('change', importData);

// Первоначальный рендер данных, если он необходим
loadProjects();
loadRuns();
loadArchiveRuns();
loadRepository();


function refreshPage() {
    localStorage.clear();
    location.reload();
}

const forgotLink = document.getElementById('forgot-password-link');
const forgotPage = document.getElementById('forgot-password-page');
const backToLogin = document.getElementById('back-to-login');
const loginPage = document.getElementById('login-page');

if (forgotLink) {
  forgotLink.addEventListener('click', () => {
    loginPage.classList.add('hidden');
    loginPage.classList.remove('flex');

    forgotPage.classList.remove('hidden');
    forgotPage.classList.add('flex');
  });
}

if (backToLogin) {
  backToLogin.addEventListener('click', () => {
    forgotPage.classList.add('hidden');
    forgotPage.classList.remove('flex');

    loginPage.classList.remove('hidden');
    loginPage.classList.add('flex');
  });
}

const forgotForm = document.getElementById('forgot-password-form');
const forgotSuccessPage = document.getElementById('forgot-success-page');
const successBackToLogin = document.getElementById('success-back-to-login');

if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();

    forgotPage.classList.add('hidden');
    forgotPage.classList.remove('flex');

    forgotSuccessPage.classList.remove('hidden');
    forgotSuccessPage.classList.add('flex');
  });
}

if (successBackToLogin) {
  successBackToLogin.addEventListener('click', () => {
    forgotSuccessPage.classList.add('hidden');
    forgotSuccessPage.classList.remove('flex');

    loginPage.classList.remove('hidden');
    loginPage.classList.add('flex');
  });
}

const registerPage = document.getElementById('register-page');
const goToRegister = document.getElementById('go-to-register');
const backFromRegister = document.getElementById('back-to-login-from-register');

if (goToRegister) {
  goToRegister.addEventListener('click', () => {
    loginPage.classList.add('hidden');
    loginPage.classList.remove('flex');

    registerPage.classList.remove('hidden');
    registerPage.classList.add('flex');
  });
}

if (backFromRegister) {
  backFromRegister.addEventListener('click', () => {
    registerPage.classList.add('hidden');
    registerPage.classList.remove('flex');

    loginPage.classList.remove('hidden');
    loginPage.classList.add('flex');
  });
}