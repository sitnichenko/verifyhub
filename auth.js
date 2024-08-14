
export function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const tokenExpiration = localStorage.getItem('authTokenExpiration');
    const currentTime = new Date().getTime();
    return tokenExpiration && currentTime < tokenExpiration;
}
window.isAuthenticated = isAuthenticated;

export function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('login-error');

    if (username === '2' && password === '2') {
        const token = 'exampleToken';
        const expirationTime = new Date().getTime() + 10800000; // 3 часа

        localStorage.setItem('authToken', token);
        localStorage.setItem('authTokenExpiration', expirationTime);

        showPage('dashboard');
    } else {
        loginError.textContent = 'Неверный логин или пароль.';
    }
}

export function logout() {
    // Удаляем токен и данные авторизации
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    localStorage.removeItem('currentPage'); // Удаляем сохраненную страницу

    // Перенаправляем на страницу авторизации
    showPage('login-page');
}
