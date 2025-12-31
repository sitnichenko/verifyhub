
document.addEventListener('DOMContentLoaded', () => {
    // Получаем последнюю сохраненную страницу из localStorage
    const savedPage = localStorage.getItem('currentPage');

const sidebarPages = [
  'dashboard',
  'projects',
  'repository',
  'runs',
  'archive',
  'account'
];

function showPage(pageId) {
  // active state — только для sidebar-страниц
  if (sidebarPages.includes(pageId)) {
    setActiveSidebar(pageId);
    localStorage.setItem('currentPage', pageId);
  }

  // auth guard
  if (pageId !== 'login-page' && !isAuthenticated()) {
    showPage('login-page');
    return;
  }

  // скрываем все страницы
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });

  // показываем нужную
  const currentPage = document.getElementById(pageId);
  if (currentPage) {
    currentPage.classList.remove('hidden');
  }

  // login / app layout
  const mainContent = document.getElementById('main-content');
  const loginPage = document.getElementById('login-page');

  if (pageId === 'login-page') {
    mainContent.style.display = 'none';
    loginPage.style.display = 'flex';
  } else {
    mainContent.style.display = 'block';
    loginPage.style.display = 'none';
  }

  
  if (pageId === 'dashboard') {
  updateDashboardStats();
    renderLatestProjects();
     renderLatestRuns();
}
  if (pageId === 'runs') {
    loadRuns();
    setTimeout(highlightRunFromDashboard, 50);
  }
  if (pageId === 'repository') {
  loadRepository();
}

  setActiveSidebar(pageId);
}
window.showPage = showPage;




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
let currentRunId = null;

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

    if (username === 'roma@paperpaper.ru' && password === '123') {
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

// ===== Run storage helpers =====

function getRuns() {
  return JSON.parse(localStorage.getItem('runs')) || [];
}

function setRuns(runs) {
  localStorage.setItem('runs', JSON.stringify(runs));
}

function getArchivedRuns() {
  return JSON.parse(localStorage.getItem('archivedRuns')) || [];
}

function setArchivedRuns(runs) {
  localStorage.setItem('archivedRuns', JSON.stringify(runs));
}

function updateDashboardStats() {
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const runs = getRuns() || [];

  // Проекты
  const projectsCount = projects.length;

  // Все тесты во всех проектах
  const testsCount = projects.reduce((sum, project) => {
    return sum + (project.tests ? project.tests.length : 0);
  }, 0);

  // Прогоны
  const runsCount = runs.length;

  // Ошибки (error в активных прогонах)
  let errorsCount = 0;
  runs.forEach(run => {
    run.tests.forEach(test => {
      if (test.status === 'error') {
        errorsCount++;
      }
    });
  });

  // Рендер
  document.getElementById('dashboard-projects').textContent = projectsCount;
  document.getElementById('dashboard-tests').textContent = testsCount;
  document.getElementById('dashboard-runs').textContent = runsCount;
  document.getElementById('dashboard-errors').textContent = errorsCount;
}




function loadProjects() {
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const container = document.getElementById('project-list');

  if (!container) return;
  container.innerHTML = '';

  // Empty state
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="col-span-full rounded-xl border bg-white p-8 text-center">
        <p class="text-sm text-gray-500">
          Проекты ещё не созданы
        </p>
        <button
          class="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
          onclick="addProject()"
        >
          Создать первый проект
        </button>
      </div>
    `;
    return;
  }

  projects.forEach((project, index) => {
    const testsCount = project.tests?.length || 0;
    const platforms =
      project.platforms?.length
        ? project.platforms.join(', ')
        : '—';

    const card = document.createElement('div');
    card.className =
      'rounded-xl border bg-white p-4 hover:shadow transition cursor-pointer flex flex-col justify-between';

    card.innerHTML = `
      <div class="space-y-2">
        <h3 class="font-medium truncate">
          ${project.name}
        </h3>

        <p class="text-sm text-gray-500 line-clamp-2">
          ${project.description || 'Без описания'}
        </p>
      </div>

      <div class="mt-4 text-xs text-gray-400 space-y-1">
        <div>Платформы: ${platforms}</div>
        <div>Тестов: ${testsCount}</div>
      </div>

      <div class="mt-4 flex gap-2">
        <button
          class="flex-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
          onclick="event.stopPropagation(); viewProject(${index})"
        >
          Открыть
        </button>

        <button
          class="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
          onclick="event.stopPropagation(); editProject(${index})"
        >
          ✏️
        </button>

        <button
          class="rounded-md border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          onclick="event.stopPropagation(); deleteProject(${index})"
        >
          🗑
        </button>
      </div>
    `;

    // клик по карточке → открыть проект
    card.onclick = () => viewProject(index);

    container.appendChild(card);
  });
}

function createProject() {
  const name = document.getElementById('project-name-input').value;
  const description = document.getElementById('project-description-input').value;
  const platforms = [];

  if (!name) return;

  const projects = JSON.parse(localStorage.getItem('projects')) || [];

  projects.push({
    name,
    description,
    platforms,
    tests: []
  });

  localStorage.setItem('projects', JSON.stringify(projects));
  loadProjects();
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


// Функция для переключения выбора плитки платформ
function toggleTileSelection() {
    this.classList.toggle('selected');
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
    setActiveSidebar('projects'); // 👈 ВАЖНО

}

function openProject(projectId) {
  showPage('project-detail');
  setActiveSidebar('projects');
}

function loadTests() {
  if (currentProjectIndex == null) return;

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const project = projects[currentProjectIndex];
  if (!project) return;

  const testList = document.getElementById('test-list');
  const testCount = document.getElementById('test-count');

  testList.innerHTML = '';

  if (!project.tests || project.tests.length === 0) {
    testList.innerHTML = `
      <div class="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
        В проекте пока нет тестов
      </div>
    `;
    testCount.textContent = '';
    return;
  }

  testCount.textContent = `Тестов: ${project.tests.length}`;

  project.tests.forEach((test, index) => {
    const card = document.createElement('div');
    card.id = test.id;
    card.className = 'rounded-xl border bg-white p-4 flex justify-between';

    card.innerHTML = `
      <div>
        <div class="font-medium">${test.name}</div>
        <div class="text-sm text-gray-500">${test.description || ''}</div>
        <div class="text-xs text-gray-400">
          Платформы: ${Array.isArray(test.platform) ? test.platform.join(', ') : test.platform}
        </div>
      </div>

      <div class="flex gap-2">
        <button onclick="editTest(${index}, ${currentProjectIndex})">✏️</button>
        <button onclick="deleteTest(${index}, ${currentProjectIndex})">🗑</button>
      </div>
    `;

    testList.appendChild(card);
  });
  loadProjects();
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

function quickAddTest() {
  const input = document.getElementById('quick-test-input');
  const name = input.value.trim();
  if (!name) return;

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const project = projects[currentProjectIndex];
  if (!project) return;

  const test = {
    id: 'test-' + Date.now(),
    name,
    description: '',
    platform: project.platforms || [],
    status: 'unchecked'
  };

  project.tests.push(test);
  localStorage.setItem('projects', JSON.stringify(projects));

  input.value = '';
  loadTests();
  scrollToTest(test.id);

  loadProjects();

}


document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;

  const input = document.getElementById('quick-test-input');
  if (!input) return;

  if (document.activeElement === input) {
    e.preventDefault();
    quickAddTest();
  }
});

function scrollToTest(testId) {
  setTimeout(() => {
    const el = document.getElementById(testId);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    el.classList.add('ring', 'ring-black');

    setTimeout(() => {
      el.classList.remove('ring', 'ring-black');
    }, 1500);
  }, 50);
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


    showToast('Тест удален успешно', 'warning');
}


function loadRepository() {
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const container = document.getElementById('repository-list');
  if (!container) return;

  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
        Проекты отсутствуют
      </div>
    `;
    return;
  }

  projects.forEach((project, index) => {
    const tests = project.tests || [];

    // wrapper — даёт отступы между проектами
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-6';

    // project card
    const card = document.createElement('div');
card.className =
  'rounded-xl border bg-white p-4 cursor-pointer hover:shadow-md transition';

card.innerHTML = `
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <h2 class="text-lg font-semibold text-black">
        ${project.name}
      </h2>

      <div class="text-sm text-gray-500">
        Платформы: ${
          Array.isArray(project.platforms) && project.platforms.length
            ? project.platforms.join(', ')
            : '—'
        }
      </div>

      <div class="text-xs text-gray-400">
        Тестов: ${tests.length}
      </div>
    </div>

 <div class="repo-arrow text-gray-400 text-sm select-none">
  ▶
</div>
  </div>
`;

    // container for tests (collapsed by default)
const testsContainer = document.createElement('div');
testsContainer.className = 'hidden mt-4 space-y-2';

    if (tests.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-sm text-gray-400 px-2';
      empty.textContent = 'В проекте нет тестов';
      testsContainer.appendChild(empty);
    } else {
      tests.forEach(test => {
        const item = document.createElement('div');
        item.className =
          'rounded-md border px-3 py-2 text-sm bg-gray-50';

item.innerHTML = `
  <div class="font-medium text-black">
    ${test.name}
  </div>
  <div class="text-sm text-gray-500">
    ${test.description || ''}
  </div>
`;

        testsContainer.appendChild(item);
      });
    }

    // toggle logic
    card.onclick = () => {
      const isOpen = !testsContainer.classList.contains('hidden');

      // закрываем все остальные
      document
        .querySelectorAll('#repository-list .repo-tests')
        .forEach(el => el.classList.add('hidden'));

      document
        .querySelectorAll('#repository-list .repo-arrow')
        .forEach(el => (el.textContent = '▶'));

      if (!isOpen) {
        testsContainer.classList.remove('hidden');
        arrow.textContent = '▼';
      }
    };

    // arrow reference
    const arrow = card.querySelector('.repo-arrow');
    testsContainer.classList.add('repo-tests');
    arrow.classList.add('repo-arrow');

    wrapper.appendChild(card);
    wrapper.appendChild(testsContainer);
    container.appendChild(wrapper);
  });
}



function loadRuns() {
    normalizeRuns();
  const runs = getRuns() || [];
  const container = document.getElementById('runs-list');
  if (!container) return;

  container.innerHTML = '';

  if (runs.length === 0) {
    container.innerHTML = `
      <div class="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
        Прогоны отсутствуют
      </div>
    `;
    return;
  }

  runs.forEach(run => {
    const tests = run.tests || [];
    const total = tests.length;

    const stats = {
      checked: 0,
      unchecked: 0,
      error: 0,
      retest: 0
    };

    tests.forEach(t => {
      if (stats[t.status] !== undefined) {
        stats[t.status]++;
      }
    });

    const completed = total - stats.unchecked;
    const percent = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    const card = document.createElement('div');
    card.className =
      'rounded-xl border bg-white p-4 space-y-4 hover:shadow-md transition';

    card.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
        <h2 class="font-medium text-black">
  ${run.name || run.projectName}
</h2>
          <p class="text-sm text-gray-500">
            Тестов: ${total}
          </p>
        </div>

        <div class="text-sm text-gray-400">
          ${percent}%
        </div>
      </div>

      <!-- Progress -->
      <div class="h-2 w-full rounded bg-gray-100 overflow-hidden">
        <div
          class="h-full bg-black transition-all"
          style="width: ${percent}%"
        ></div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-2 text-xs">
        <div class="text-green-600">
          Проверено: ${stats.checked}
        </div>
        <div class="text-red-600">
          Ошибки: ${stats.error}
        </div>
        <div class="text-yellow-600">
          Ретест: ${stats.retest}
        </div>
        <div class="text-gray-400">
          Не проверено: ${stats.unchecked}
        </div>
      </div>
    `;

      card.onclick = () => openRun(run.id);
      card.classList.add('cursor-pointer');

    container.appendChild(card);
  });
}

function saveRunName() {
  const runs = getRuns() || [];
  const run = runs.find(r => r.id === currentRunId);
  if (!run) return;

  const input = document.getElementById('run-name-input');
  run.name = input.value.trim() || run.projectName;

  setRuns(runs);
  showToast('Название прогона обновлено', 'success');
}


function openRunModal() {
  const modal = document.getElementById('run-modal');
  const select = document.getElementById('run-project-select');

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  select.innerHTML = '';

  projects.forEach((project, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = project.name;
    select.appendChild(option);
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeRunModal() {
  const modal = document.getElementById('run-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function confirmAddRun() {
  clearRunModalError();

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  if (projects.length === 0) {
    showRunModalError('Нет доступных проектов');
    return;
  }

  const select = document.getElementById('run-project-select');
  const projectIndex = Number(select.value);
  const project = projects[projectIndex];

  if (!project || !project.tests || project.tests.length === 0) {
    showRunModalError('В выбранном проекте нет тестов');
    return;
  }

  const runs = getRuns() || [];

const nameInput =
  document.getElementById('run-name-create-input');

const runName =
  nameInput.value.trim() ||
  `Run ${new Date().toLocaleDateString()}`;

const run = {
  id: 'run-' + Date.now(),
  name: runName,                // 👈 ВАЖНО
  projectName: project.name,
  tests: project.tests.map(test => ({
    ...test,
    status: 'unchecked'
  })),
  createdAt: Date.now()
};

  runs.push(run);
  setRuns(runs);

  closeRunModal();
  loadRuns();

  normalizeRuns();

  openRun(run.id); // 👈 сразу открываем прогон
  nameInput.value = '';
}

let currentRunMode = 'active';

function openRun(runId) {
  const run =
    getRuns().find(r => r.id === runId) ||
    getArchivedRuns().find(r => r.id === runId);
    renderRunDetail(run || archivedRun);
 setActiveSidebar(run ? 'runs' : 'archive');

  if (!run) {
    showPage('runs');
    return;
  }

  currentRunId = run.id;
  showPage('run-detail');
 renderRunDetail(run || archivedRun);
setActiveSidebar(run.finishedAt ? 'archive' : 'runs');
}

function isArchivedRun(run) {
  return Boolean(run.finishedAt);
}

function loadRunDetail() {
  const runs = getRuns();
  const archived = getArchivedRuns();

  // ищем и в активных, и в архиве
  let run = runs.find(r => r.id === currentRunId);
  const isArchived = !run;

  if (!run) {
    run = archived.find(r => r.id === currentRunId);
  }

  if (!run) {
    console.error('Run not found:', currentRunId);
    showPage('runs');
    return;
  }

  // заголовок
  document.getElementById('run-project-name').textContent =
    run.projectName;

  const container = document.getElementById('run-tests');
  container.innerHTML = '';

  if (!run.tests || run.tests.length === 0) {
    container.innerHTML = `
      <div class="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
        В прогоне нет кейсов
      </div>
    `;
    return;
  }

 run.tests.map(normalizeTest).forEach((test, index) => {
    const row = document.createElement('div');

    row.className = `
      rounded-xl border p-4
      flex items-center justify-between gap-4
      ${isArchived ? 'bg-gray-50 opacity-80' : 'bg-white'}
    `;

    row.innerHTML = `
      <div class="flex-1">
        <div class="font-medium text-black">
          ${test.name}
        </div>
        <div class="text-sm text-gray-500">
          ${test.description || ''}
        </div>
      </div>

      ${
        isArchived
          ? `<span class="text-sm text-gray-500">${statusLabel(test.status)}</span>`
          : `
            <select
              class="rounded-md border px-2 py-1 text-sm"
              onchange="updateRunTestStatus(${index}, this.value)"
            >
              <option value="unchecked" ${test.status === 'unchecked' ? 'selected' : ''}>⏳ Не проверен</option>
              <option value="checked" ${test.status === 'checked' ? 'selected' : ''}>✔ Успешно</option>
              <option value="error" ${test.status === 'error' ? 'selected' : ''}>✖ Ошибка</option>
              <option value="retest" ${test.status === 'retest' ? 'selected' : ''}>🔁 Перепроверка</option>
            </select>
          `
      }
    `;

    container.appendChild(row);
  });

  // кнопка завершения — только для активных
const finishBtn = document.getElementById('finish-run-btn');
if (finishBtn) {
  finishBtn.classList.toggle(
    'hidden',
    currentRunMode === 'archived'
  );
}
}

function statusLabel(status) {
  switch (status) {
    case 'checked': return '✔ Успешно';
    case 'error': return '✖ Ошибка';
    case 'retest': return '🔁 Ретест';
    default: return '⏳ Не проверен';
  }
}


function finishCurrentRun() {
  const runs = getRuns() || [];
  const archived = JSON.parse(localStorage.getItem('archivedRuns')) || [];

  const index = runs.findIndex(r => r.id === currentRunId);
  if (index === -1) return;

  const run = runs.splice(index, 1)[0];
  run.finishedAt = Date.now();

  archived.push(run);

  setRuns(runs);
  localStorage.setItem('archivedRuns', JSON.stringify(archived));

  loadRuns();
  loadArchiveRuns(); // ← 🔥 КЛЮЧЕВО
  showToast('Прогон завершён', 'info');
  showPage('runs');
}


function normalizeRuns() {
  const runs = getRuns() || [];
  let changed = false;

  runs.forEach(run => {
    if (!run.id) {
      run.id = 'run-' + Date.now() + Math.random().toString(16).slice(2);
      changed = true;
    }
  });

  if (changed) {
    setRuns(runs);
  }
}

function normalizeTest(test) {
  return {
    name: test.name || 'Без названия',
    description: test.description || '',
    platform: test.platform || [],
    status: test.status || 'unchecked'
  };
}

function renderRunDetail(run) {
  const archived = isArchivedRun(run);

  // name
  const nameInput = document.getElementById('run-name-input');
  nameInput.value = run.name || run.projectName;
  nameInput.disabled = archived;

  // project
  document.getElementById('run-project-name').textContent =
    run.projectName;

  // buttons
  document.getElementById('finish-run-btn').style.display =
    archived ? 'none' : 'inline-flex';

  document.getElementById('edit-run-btn').style.display =
    archived ? 'none' : 'inline-flex';

  // tests
  renderRunTests(run, archived);
}

function renderRunTestsEditor() {
  const runs = getRuns() || [];
  const projects = JSON.parse(localStorage.getItem('projects')) || [];

  const run = runs.find(r => r.id === currentRunId);
  if (!run) return;

  const project = projects.find(p => p.name === run.projectName);
  if (!project) return;

  const container = document.getElementById('run-tests-editor');
  container.innerHTML = '';

  project.tests.forEach(test => {
    const checked = run.tests.some(t => t.name === test.name);

    container.innerHTML += `
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          data-test-name="${test.name}"
          ${checked ? 'checked' : ''}
        />
        ${test.name}
      </label>
    `;
  });
}

function saveRunTests() {
  const runs = getRuns() || [];
  const projects = JSON.parse(localStorage.getItem('projects')) || [];

  const run = runs.find(r => r.id === currentRunId);
  const project = projects.find(p => p.name === run.projectName);
  if (!run || !project) return;

  const selected = Array.from(
    document.querySelectorAll('#run-tests-editor input:checked')
  ).map(i => i.dataset.testName);

  run.tests = project.tests
    .filter(t => selected.includes(t.name))
    .map(t => ({
      ...t,
      status: 'unchecked'
    }));

  setRuns(runs);
  loadRunDetail();
  showToast('Кейсы обновлены', 'success');
}

function renderRunTests(run, archived) {
  const container = document.getElementById('run-tests');
  container.innerHTML = '';

  if (!run.tests.length) {
    container.innerHTML = `
      <div class="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
        Нет кейсов
      </div>
    `;
    return;
  }

  run.tests.forEach((test, index) => {
    const row = document.createElement('div');
    row.className =
      'rounded-xl border p-4 flex items-center justify-between';

    row.innerHTML = `
      <div>
        <div class="font-medium">${test.name}</div>
        <div class="text-sm text-gray-500">${test.description || ''}</div>
      </div>

      ${
        archived
          ? `<span class="text-sm text-gray-500">${statusLabel(test.status)}</span>`
          : `
            <select
              class="rounded-md border px-2 py-1 text-sm"
              onchange="updateRunTestStatus(${index}, this.value)"
            >
              <option value="unchecked" ${test.status === 'unchecked' ? 'selected' : ''}>⏳ Не проверен</option>
              <option value="checked" ${test.status === 'checked' ? 'selected' : ''}>✔ Проверен</option>
              <option value="error" ${test.status === 'error' ? 'selected' : ''}>✖ Ошибка</option>
              <option value="retest" ${test.status === 'retest' ? 'selected' : ''}>🔁 Ретест</option>
            </select>
          `
      }
    `;

    container.appendChild(row);
  });
}

function loadArchiveRuns() {
  const archivedRuns =
    JSON.parse(localStorage.getItem('archivedRuns')) || [];

  const list = document.getElementById('archive-list');
  const empty = document.getElementById('archive-empty');

  if (!list || !empty) return;

  list.innerHTML = '';

  if (archivedRuns.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  archivedRuns.forEach(run => {
    const tests = run.tests || [];
    const total = tests.length;

    const stats = {
      checked: 0,
      unchecked: 0,
      error: 0,
      retest: 0
    };

    tests.forEach(t => {
      if (stats[t.status] !== undefined) {
        stats[t.status]++;
      }
    });

    const completed = total - stats.unchecked;
    const percent = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    const date = run.finishedAt
      ? new Date(run.finishedAt).toLocaleDateString()
      : '—';

   const card = document.createElement('div');
card.classList.add('cursor-pointer');
card.onclick = () => openRun(run.id);
    card.className =
      'rounded-xl border bg-white p-4 space-y-4 opacity-90';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium text-black">
            ${run.name || run.projectName}
          </h3>
          <p class="text-sm text-gray-500">
            ${run.projectName} · ${date}
          </p>
        </div>

        <div class="text-sm text-gray-400">
          ${percent}%
        </div>
      </div>

      <div class="h-2 w-full rounded bg-gray-100 overflow-hidden">
        <div
          class="h-full bg-black"
          style="width: ${percent}%"
        ></div>
      </div>

      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-md bg-green-100 px-2 py-1 text-green-700">
          ${stats.checked} passed
        </span>
        <span class="rounded-md bg-red-100 px-2 py-1 text-red-700">
          ${stats.error} errors
        </span>
        <span class="rounded-md bg-yellow-100 px-2 py-1 text-yellow-700">
          ${stats.retest} retest
        </span>
        <span class="rounded-md bg-gray-100 px-2 py-1 text-gray-600">
          ${stats.unchecked} skipped
        </span>
      </div>
    `;

    list.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadArchiveRuns();
  initializePlatformSelection();

  if (!isAuthenticated()) {
    showPage('login-page');
  } else {
    showPage(localStorage.getItem('currentPage') || 'dashboard');
  }
  

    // Инициализация модальных окон для добавления и редактирования тестов
    document.getElementById('add-test-modal').style.display = 'none';
    document.getElementById('edit-test-modal').style.display = 'none';

    
});

const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
const sidebar = document.getElementById('sidebar');
const mainContainer = document.getElementById('main-container');

let sidebarOpen = true;

document.addEventListener('DOMContentLoaded', () => {
  const finishBtn = document.getElementById('finish-run-btn');

  if (finishBtn) {
    finishBtn.addEventListener('click', finishCurrentRun);
  }
});

function openSidebar() {
  sidebarOpen = true;
  sidebar.classList.remove('-translate-x-full');

  mainContainer.classList.remove('ml-0', 'pl-12');
  mainContainer.classList.add('ml-64');

  sidebarOpenBtn.classList.add('hidden');
}

function closeSidebar() {
  sidebarOpen = false;
  sidebar.classList.add('-translate-x-full');

  mainContainer.classList.remove('ml-64');
  mainContainer.classList.add('ml-0', 'pl-12');

  sidebarOpenBtn.classList.remove('hidden');
}

if (toggleSidebarBtn) {
  toggleSidebarBtn.addEventListener('click', closeSidebar);
}

if (sidebarOpenBtn) {
  sidebarOpenBtn.addEventListener('click', openSidebar);
}

const sidebarLinks = document.querySelectorAll('.sidebar-link');

function setActiveSidebar(pageId) {
  sidebarLinks.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
}


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
    const runs = getRuns() || [];
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
                const currentRuns = getRuns() || [];
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

function renderLatestProjects(limit = 3) {
  const projects =
    JSON.parse(localStorage.getItem('projects')) || [];

  const container = document.getElementById(
    'dashboard-latest-projects'
  );

  if (!container) return;

  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-sm text-gray-500">
        Проекты ещё не созданы
      </div>
    `;
    return;
  }

  // Берём последние N проектов
  const latestProjects = projects.slice(-limit).reverse();

  latestProjects.forEach((project, index) => {
    const testsCount = project.tests
      ? project.tests.length
      : 0;

    const platforms =
      project.platforms && project.platforms.length > 0
        ? project.platforms.join(', ')
        : '—';

    const card = document.createElement('div');
    card.className =
      'rounded-xl border bg-white p-4 hover:shadow transition cursor-pointer';

    card.innerHTML = `
      <h3 class="font-medium truncate">
        ${project.name}
      </h3>

      <p class="text-sm text-gray-500 truncate">
        ${project.description || 'Без описания'}
      </p>

      <div class="mt-3 text-xs text-gray-400 space-y-1">
        <div>Платформы: ${platforms}</div>
        <div>Тестов: ${testsCount}</div>
      </div>
    `;

    // Клик → открыть проект
    card.onclick = () => {
      const realIndex = projects.length - 1 - index;
      viewProject(realIndex);
    };

    container.appendChild(card);
  });
}

function renderLatestRuns(limit = 3) {
  const runs = getRuns() || [];
  const container = document.getElementById('dashboard-latest-runs');

  if (!container) return;

  container.innerHTML = '';

  if (runs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'col-span-full text-sm text-gray-500';
    empty.textContent = 'Прогоны ещё не создавались';
    container.appendChild(empty);
    return;
  }

  const latestRuns = runs.slice(-limit).reverse();

  latestRuns.forEach(run => {
    const total = run.tests.length;

    const stats = { checked: 0, unchecked: 0, error: 0, retest: 0 };
    run.tests.forEach(t => stats[t.status]++);

    const completed = total - stats.unchecked;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 🔹 card объявляется ЗДЕСЬ
    const card = document.createElement('div');
    card.className = 'rounded-xl border bg-white p-4 hover:shadow transition cursor-pointer';

    card.innerHTML = `
      <h3 class="font-medium truncate">${run.projectName}</h3>
      <p class="text-sm text-gray-500">Тестов: ${total}</p>

      <div class="mt-3">
        <div class="h-2 w-full rounded bg-gray-100 overflow-hidden">
          <div class="h-full bg-black" style="width:${percent}%"></div>
        </div>
        <div class="mt-1 text-xs text-gray-500">Выполнено ${percent}%</div>
      </div>

      <div class="mt-3 text-xs text-gray-400 space-y-1">
        <div>Проверено: ${stats.checked}</div>
        <div>Не проверено: ${stats.unchecked}</div>
        <div class="text-red-500">Ошибки: ${stats.error}</div>
        <div>Ретест: ${stats.retest}</div>
      </div>
    `;

    // ✅ КЛИК — ТОЛЬКО ЗДЕСЬ
    card.onclick = () => {
      if (run.id) {
        localStorage.setItem('highlightRunId', run.id);
      }
      showPage('runs');
    };

    container.appendChild(card);
  });
}

function showRunModalError(message) {
  const el = document.getElementById('run-modal-error');
  if (!el) return;

  el.textContent = message;
  el.classList.remove('hidden');
}

function clearRunModalError() {
  const el = document.getElementById('run-modal-error');
  if (!el) return;

  el.textContent = '';
  el.classList.add('hidden');
}

function highlightRunFromDashboard() {
  const runId = localStorage.getItem('highlightRunId');
  if (!runId) return;

  const el = document.getElementById(runId);
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('ring', 'ring-black');

  setTimeout(() => {
    el.classList.remove('ring', 'ring-black');
    localStorage.removeItem('highlightRunId');
  }, 2000);
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

document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;

    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
});



