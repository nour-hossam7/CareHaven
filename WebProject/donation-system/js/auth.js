const API_BASE = localStorage.getItem('apiBaseUrl') || 'http://localhost:5000/api';

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
}

function getUserRole(user) {
    return user ? (user.role || user.userType || 'donor') : null;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(!options.skipAuth ? getAuthHeaders() : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        body: options.body && typeof options.body !== 'string'
            ? JSON.stringify(options.body)
            : options.body
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const details = Array.isArray(data.details) ? ` ${data.details.join(', ')}` : '';
        throw new Error(`${data.message || 'Request failed'}${details}`);
    }

    return data;
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = getStoredUser();
    return token && user ? user : null;
}

function requireAuth() {
    const user = checkAuth();
    if (!user) {
        const redirect = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
        window.location.href = `login.html?redirect=${redirect}`;
        return null;
    }
    return user;
}

async function refreshCurrentUser() {
    if (!localStorage.getItem('token')) return null;

    try {
        const response = await apiRequest('/auth/me');
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
    } catch (error) {
        console.warn('Could not refresh user profile:', error.message);
        return getStoredUser();
    }
}

function routeToDashboard(user) {
    const role = getUserRole(user);
    if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else if (role === 'ngo') {
        window.location.href = 'ngo-dashboard.html';
    } else {
        window.location.href = 'donor-dashboard.html';
    }
}

function getDashboardPath(user) {
    const role = getUserRole(user);
    if (role === 'admin') return 'admin-dashboard.html';
    if (role === 'ngo') return 'ngo-dashboard.html';
    return 'donor-dashboard.html';
}

function isNgoApproved(user) {
    return getUserRole(user) !== 'ngo' || user.ngoStatus === 'Approved';
}

function showApprovalBanner(user, containerId = 'approvalBanner') {
    const banner = document.getElementById(containerId);
    if (!banner || getUserRole(user) !== 'ngo') return;

    if (user.ngoStatus === 'Pending') {
        banner.className = 'approval-banner pending';
        banner.innerHTML = '<strong>Account pending approval.</strong> An admin must approve your NGO before you can create campaigns.';
        banner.hidden = false;
    } else if (user.ngoStatus === 'Rejected') {
        banner.className = 'approval-banner rejected';
        banner.innerHTML = `<strong>NGO registration rejected.</strong> ${escapeHTML(user.rejectionReason || 'Please contact support for more information.')}`;
        banner.hidden = false;
    } else {
        banner.hidden = true;
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }
}

function setLoading(form, isLoading) {
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = isLoading;
        button.dataset.originalText = button.dataset.originalText || button.textContent;
        button.textContent = isLoading ? 'Please wait...' : button.dataset.originalText;
    }
}

async function registerUser(userData, form) {
    setLoading(form, true);

    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            skipAuth: true,
            body: userData
        });

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        showMessage(response.message || 'Account created successfully.', 'success');

        setTimeout(() => routeToDashboard(response.user), 800);
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(form, false);
    }
}

async function loginUser(credentials, form) {
    setLoading(form, true);

    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            skipAuth: true,
            body: credentials
        });

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        showMessage('Welcome back to CareHaven.', 'success');

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        setTimeout(() => {
            if (redirect) {
                window.location.href = redirect;
            } else {
                routeToDashboard(response.user);
            }
        }, 800);
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        setLoading(form, false);
    }
}

async function logout() {
    try {
        if (localStorage.getItem('token')) {
            await apiRequest('/auth/logout', { method: 'POST' });
        }
    } catch (error) {
        console.warn('Logout request failed:', error.message);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const userTypeSelect = document.getElementById('userType');
    const ngoFields = document.getElementById('ngoFields');
    const adminFields = document.getElementById('adminFields');
    const user = checkAuth();
    const isAdminSignup = new URLSearchParams(window.location.search).get('admin') === '1';

    if (user && (window.location.pathname.includes('login.html') ||
                 window.location.pathname.includes('register.html'))) {
        routeToDashboard(user);
        return;
    }

    if (user && window.location.pathname.endsWith('index.html')) {
        routeToDashboard(user);
        return;
    }

    if (userTypeSelect && ngoFields) {
        const toggleRoleFields = () => {
            const role = userTypeSelect.value;
            const isNGO = role === 'ngo';
            const isAdmin = role === 'admin';
            ngoFields.hidden = !isNGO;
            if (adminFields) adminFields.hidden = !isAdmin;
            ngoFields.querySelectorAll('input, textarea').forEach((field) => {
                field.required = isNGO && field.dataset.required === 'true';
            });
        };

        if (isAdminSignup) {
            userTypeSelect.innerHTML += '<option value="admin">Admin (Platform Manager)</option>';
            userTypeSelect.value = 'admin';
        }

        userTypeSelect.addEventListener('change', toggleRoleFields);
        toggleRoleFields();
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                role: document.getElementById('userType').value,
                password
            };

            if (formData.role === 'ngo') {
                formData.organizationName = document.getElementById('organizationName').value.trim();
                formData.phone = document.getElementById('phone').value.trim();
                formData.registrationNumber = document.getElementById('registrationNumber').value.trim();
                formData.website = document.getElementById('website').value.trim();
                formData.description = document.getElementById('description').value.trim();
            }

            if (formData.role === 'admin') {
                formData.adminRegistrationKey = document.getElementById('adminRegistrationKey').value.trim();
            }

            registerUser(formData, registerForm);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            loginUser({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            }, loginForm);
        });
    }
});
