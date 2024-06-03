let currentProjectIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    showPage('dashboard');
});

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}


function refreshPage() {
    localStorage.clear();
    location.reload();
}

function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';
    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectList.appendChild(projectCard);
    });
}

function createProjectCard(project, index) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.innerHTML = `
        <h2>${project.name}</h2>
        <p>${project.description}</p>
        <p>Платформы: ${project.platforms.length > 0 ? project.platforms.join(', ') : 'Не выбраны'}</p>
        <button onclick="viewProject(${index})">Открыть</button>
        <button onclick="editProject(${index})">Редактировать</button>
        <button onclick="deleteProject(${index})">Удалить</button>
    `;
    return projectCard;
}

function addProject() {
    const modal = document.getElementById('add-project-modal');
    modal.style.display = 'block';

    const saveButton = document.getElementById('save-project-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('project-name-input').value;
        const descriptionInput = document.getElementById('project-description-input').value;
        const platforms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
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
            modal.style.display = 'none';
            document.getElementById('project-name-input').value = '';
            document.getElementById('project-description-input').value = '';
        }
    };

    // Обработчик события для кнопки "Отмена" в модальном окне
    const cancelButton = document.getElementById('cancel-project-button');
    cancelButton.onclick = function() {
        modal.style.display = 'none'; // Скрытие модального окна без сохранения данных
        // Очищаем текст ошибок
        document.getElementById('project-name-error').textContent = '';
        document.getElementById('project-description-error').textContent = '';
    };

    // Обработчик события для кнопки закрытия модального окна (крестик)
    const closeButton = document.getElementById('close-project-button');
    closeButton.onclick = function() {
        modal.style.display = 'none'; // Скрытие модального окна без сохранения данных
        // Очищаем текст ошибок
        document.getElementById('project-name-error').textContent = '';
        document.getElementById('project-description-error').textContent = '';
    };

    // Обработчик события для клика вне модального окна (закрывает окно)
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none'; // Скрытие модального окна без сохранения данных
            // Очищаем текст ошибок
            document.getElementById('project-name-error').textContent = '';
            document.getElementById('project-description-error').textContent = '';
        }
    };
}

function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';
    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h2>${project.name}</h2>
            <p>${project.description}</p>
            <p>Платформы: ${project.platforms.length > 0 ? project.platforms.join(', ') : 'Не выбраны'}</p>
            <button onclick="viewProject(${index})">Открыть</button>
            <button onclick="editProject(${index})">Редактировать</button>
            <button onclick="deleteProject(${index})">Удалить</button>
        `;
        projectList.appendChild(projectCard);
    });
}



function editProject(index) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects[index];

    // Заполнение полей модального окна данными текущего проекта
    document.getElementById('edit-project-name-input').value = project.name;
    document.getElementById('edit-project-description-input').value = project.description;
    document.getElementById('edit-project-web-checkbox').checked = project.platforms.includes('web');
    document.getElementById('edit-project-android-checkbox').checked = project.platforms.includes('android');
    document.getElementById('edit-project-ios-checkbox').checked = project.platforms.includes('ios');

    const editModal = document.getElementById('edit-project-modal');
    editModal.style.display = 'block';

    const saveButton = document.getElementById('save-edit-project-button');
    saveButton.onclick = function() {
        const nameInput = document.getElementById('edit-project-name-input').value;
        const descriptionInput = document.getElementById('edit-project-description-input').value;
        const webCheckbox = document.getElementById('edit-project-web-checkbox').checked;
        const androidCheckbox = document.getElementById('edit-project-android-checkbox').checked;
        const iosCheckbox = document.getElementById('edit-project-ios-checkbox').checked;

        const platforms = [];
        if (webCheckbox) platforms.push('web');
        if (androidCheckbox) platforms.push('android');
        if (iosCheckbox) platforms.push('ios');

        const nameError = document.getElementById('edit-project-name-error');
        const descriptionError = document.getElementById('edit-project-description-error');

        let isValid = true;

        if (!nameInput) {
            nameError.textContent = 'Пожалуйста, введите название проекта.';
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }

        if (isValid) {
            projects[index].name = nameInput;
            projects[index].description = descriptionInput;
            projects[index].platforms = platforms;
            localStorage.setItem('projects', JSON.stringify(projects));
            loadProjects();
            editModal.style.display = 'none';
        }
    };

    const cancelButton = document.getElementById('cancel-edit-project-button');
    cancelButton.onclick = function() {
        editModal.style.display = 'none';
    };

    const closeButton = document.getElementById('close-edit-project-button');
    closeButton.onclick = function() {
        editModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    };
}


function deleteProject(index) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects.splice(index, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
}

function viewProject(index) {
    currentProjectIndex = index;
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects[index];
    document.getElementById('project-name').textContent = project.name;
    document.getElementById('project-description').textContent = project.description;
    
    // Формируем строку с платформами
    const platformText = project.platforms.length > 0 ? `Платформы: ${project.platforms.join(', ')}` : 'Платформы не выбраны';
    document.getElementById('project-platform').textContent = platformText;
    
    loadTests();
    showPage('project-detail');
}

function loadTests() {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects[currentProjectIndex];
    const testList = document.getElementById('test-list');
    testList.innerHTML = '';
    project.tests.forEach((test, testIndex) => {
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <h3>${test.name}</h3>
            <p>${test.description}</p>
            <p>Платформа: ${test.platform}</p>
            <button onclick="editTest(${testIndex})">Редактировать</button>
            <button onclick="deleteTest(${testIndex})">Удалить</button>
            
        `;
        testList.appendChild(testCard);
    });
}

function addTest() {
    const name = prompt('Введите название теста:');
    const description = prompt('Введите описание теста:');
    const platform = prompt('Введите платформу теста:');
    if (name && description && platform) {
        const projects = JSON.parse(localStorage.getItem('projects'));
        projects[currentProjectIndex].tests.push({ name, description, platform, status: 'unchecked' });
        localStorage.setItem('projects', JSON.stringify(projects));
        loadTests();
    }
}

function editTest(testIndex) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const test = projects[currentProjectIndex].tests[testIndex];
    const name = prompt('Введите название теста:', test.name);
    const description = prompt('Введите описание теста:', test.description);
    const platform = prompt('Введите платформу теста:', test.platform);
    if (name && description && platform) {
        test.name = name;
        test.description = description;
        test.platform = platform;
        localStorage.setItem('projects', JSON.stringify(projects));
        loadTests();
    }
}


function deleteTest(testIndex) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects[currentProjectIndex].tests.splice(testIndex, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadTests();
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
    loadArchiveRuns();
});