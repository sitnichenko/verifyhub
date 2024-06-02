function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');

    // Простая проверка логина и пароля
    if (username === 'admin' && password === 'admin') {
        // В случае успеха перенаправляем пользователя на другую страницу
        window.location.href = 'file:///C:/Users/roman/Downloads/verifyhub/index.html';
    } else {
        // В случае ошибки выводим сообщение об ошибке
        errorElement.textContent = 'Неверный логин или пароль';
        errorElement.style.display = 'block';
    }
}

