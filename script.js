// User data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Sample movie data
const moviesData = [
    {
        id: 1,
        title: "The Last Adventure",
        year: 2024,
        genre: "action",
        rating: 8.2,
        description: "An epic action movie with stunning visuals and heart-pounding sequences.",
        poster: "action"
    },
    {
        id: 2,
        title: "Cosmic Journey",
        year: 2024,
        genre: "sci-fi",
        rating: 7.9,
        description: "A mind-bending sci-fi adventure through space and time.",
        poster: "sci-fi"
    },
    {
        id: 3,
        title: "Love in Paris",
        year: 2024,
        genre: "romance",
        rating: 8.5,
        description: "A beautiful romantic story set in the city of love.",
        poster: "romance"
    },
    {
        id: 4,
        title: "Laugh Out Loud",
        year: 2023,
        genre: "comedy",
        rating: 7.4,
        description: "The funniest comedy of the year that will keep you laughing.",
        poster: "comedy"
    },
    {
        id: 5,
        title: "The Haunted Mansion",
        year: 2023,
        genre: "horror",
        rating: 6.8,
        description: "A terrifying horror experience that will keep you up at night.",
        poster: "horror"
    },
    {
        id: 6,
        title: "Drama Queen",
        year: 2024,
        genre: "drama",
        rating: 8.7,
        description: "An emotional drama about life, love, and everything in between.",
        poster: "drama"
    }
];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const closeAuth = document.getElementById('close-auth');
const showLogin = document.getElementById('show-login');
const showRegister = document.getElementById('show-register');
const loginFormElement = document.getElementById('loginForm');
const registerFormElement = document.getElementById('registerForm');
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const userGreeting = document.getElementById('user-greeting');
const displayName = document.getElementById('display-name');
const userContent = document.getElementById('user-content');
const guestContent = document.getElementById('guest-content');
const contentLogin = document.getElementById('content-login');
const contentRegister = document.getElementById('content-register');
const logoutBtn = document.getElementById('logout-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');

// Email function
async function sendWelcomeEmail(email, name) {
    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log("✅ Email sent successfully!");
            showMessage('Welcome email sent! Check your inbox! 🎬', 'success');
            return true;
        } else {
            console.log("❌ Email failed:", result.error);
            showMessage('Account created but email failed. ' + result.error, 'error');
            return false;
        }
    } catch (error) {
        console.log("❌ Cannot connect to email server");
        showMessage('Account created but email service is offline', 'warning');
        return false;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    generateMovies();
    updateWatchlistDisplay();
});

function initializeApp() {
    checkAuthStatus();
    startLoadingAnimation();
}

function startLoadingAnimation() {
    let progress = 0;
    const totalTime = 2500;
    const interval = 30;
    
    const progressInterval = setInterval(() => {
        progress += (interval / totalTime) * 100;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            
            setTimeout(() => {
                hideLoadingScreen();
            }, 300);
        } else {
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
        }
    }, interval);
}

function setupEventListeners() {
    // Auth modal triggers
    loginBtn.addEventListener('click', () => showAuthModal('login'));
    registerBtn.addEventListener('click', () => showAuthModal('register'));
    contentLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('login');
    });
    contentRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('register');
    });
    
    // Auth modal controls
    closeAuth.addEventListener('click', hideAuthModal);
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('register');
    });
    
    // Form submissions
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Genre cards
    document.querySelectorAll('.genre-card').forEach(card => {
        card.addEventListener('click', function() {
            const genre = this.getAttribute('data-genre');
            switchSection('movies');
            showMessage(`Showing ${genre} movies`, 'success');
        });
    });
    
    // Watch buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('watch-btn')) {
            if (!currentUser) {
                showAuthModal('login');
                showMessage('Please login to add to watchlist', 'error');
            } else {
                const movieCard = e.target.closest('.movie-card');
                const title = movieCard.querySelector('h4').textContent;
                addToWatchlist(title);
            }
        }
    });
    
    // Close modal on outside click
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            hideAuthModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
            hideAuthModal();
        }
    });
    
    // Search functionality
    const movieSearch = document.getElementById('movie-search');
    if (movieSearch) {
        movieSearch.addEventListener('input', filterMovies);
    }
    
    // Filter functionality
    const genreFilter = document.getElementById('genre-filter');
    const yearFilter = document.getElementById('year-filter');
    
    if (genreFilter) genreFilter.addEventListener('change', filterMovies);
    if (yearFilter) yearFilter.addEventListener('change', filterMovies);
}

// Navigation Functions
function switchSection(sectionName) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    if (sectionName === 'watchlist') {
        updateWatchlistDisplay();
    }
}

// Movie Functions
function generateMovies() {
    const moviesGrid = document.querySelector('.movies-grid.large');
    if (!moviesGrid) return;
    
    moviesGrid.innerHTML = '';
    
    moviesData.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <div class="movie-poster" style="background: linear-gradient(45deg, ${getPosterColor(movie.poster)})">
                ${getPosterEmoji(movie.poster)}
            </div>
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <p>${movie.year} • ${movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}</p>
                <p class="movie-description">${movie.description}</p>
                <div class="rating">⭐ ${movie.rating}/10</div>
                <button class="watch-btn">Add to Watchlist</button>
            </div>
        `;
        moviesGrid.appendChild(movieCard);
    });
}

function filterMovies() {
    const searchTerm = document.getElementById('movie-search').value.toLowerCase();
    const genreFilter = document.getElementById('genre-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    
    let filteredMovies = moviesData.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm) || 
                            movie.description.toLowerCase().includes(searchTerm);
        const matchesGenre = !genreFilter || movie.genre === genreFilter;
        const matchesYear = !yearFilter || movie.year.toString() === yearFilter;
        
        return matchesSearch && matchesGenre && matchesYear;
    });
    
    const moviesGrid = document.querySelector('.movies-grid.large');
    moviesGrid.innerHTML = '';
    
    filteredMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <div class="movie-poster" style="background: linear-gradient(45deg, ${getPosterColor(movie.poster)})">
                ${getPosterEmoji(movie.poster)}
            </div>
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <p>${movie.year} • ${movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}</p>
                <p class="movie-description">${movie.description}</p>
                <div class="rating">⭐ ${movie.rating}/10</div>
                <button class="watch-btn">Add to Watchlist</button>
            </div>
        `;
        moviesGrid.appendChild(movieCard);
    });
}

function getPosterColor(posterType) {
    const colors = {
        'action': '#ff6b6b, #ee5a24',
        'sci-fi': '#4834d4, #686de0',
        'romance': '#00d2d3, #54a0ff',
        'comedy': '#feca57, #ff9ff3',
        'horror': '#57606f, #2f3542',
        'drama': '#00b894, #00cec9'
    };
    return colors[posterType] || '#333, #555';
}

function getPosterEmoji(posterType) {
    const emojis = {
        'action': '💥',
        'sci-fi': '🚀',
        'romance': '💕',
        'comedy': '😂',
        'horror': '👻',
        'drama': '🎭'
    };
    return emojis[posterType] || '🎬';
}

// Watchlist Functions
function addToWatchlist(title) {
    if (!watchlist.includes(title)) {
        watchlist.push(title);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        updateWatchlistDisplay();
        showMessage(`"${title}" added to watchlist!`, 'success');
    } else {
        showMessage(`"${title}" is already in your watchlist`, 'error');
    }
}

function updateWatchlistDisplay() {
    const emptyWatchlist = document.getElementById('empty-watchlist');
    const watchlistContent = document.getElementById('watchlist-content');
    const watchlistGrid = document.querySelector('.watchlist-grid');
    const watchlistCount = document.getElementById('watchlist-count');
    const watchedCount = document.getElementById('watched-count');
    
    if (watchlist.length === 0) {
        if (emptyWatchlist) emptyWatchlist.classList.remove('hidden');
        if (watchlistContent) watchlistContent.classList.add('hidden');
    } else {
        if (emptyWatchlist) emptyWatchlist.classList.add('hidden');
        if (watchlistContent) watchlistContent.classList.remove('hidden');
        
        if (watchlistGrid) {
            watchlistGrid.innerHTML = '';
            watchlist.forEach(item => {
                const watchlistItem = document.createElement('div');
                watchlistItem.className = 'movie-card';
                watchlistItem.innerHTML = `
                    <div class="movie-poster" style="background: linear-gradient(45deg, #333, #555)">🎬</div>
                    <div class="movie-info">
                        <h4>${item}</h4>
                        <p>Added to your watchlist</p>
                        <button class="watch-btn remove-btn" onclick="removeFromWatchlist('${item}')">Remove</button>
                    </div>
                `;
                watchlistGrid.appendChild(watchlistItem);
            });
        }
    }
    
    if (watchlistCount) watchlistCount.textContent = watchlist.length;
    if (watchedCount) watchedCount.textContent = Math.floor(watchlist.length / 2);
}

function removeFromWatchlist(title) {
    watchlist = watchlist.filter(item => item !== title);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistDisplay();
    showMessage(`"${title}" removed from watchlist`, 'success');
}

// Loading Screen Functions
function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        showMainContent();
    }, 500);
}

function showLoadingScreen() {
    mainContent.classList.remove('visible');
    mainContent.classList.add('hidden');
    
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
    
    startLoadingAnimation();
}

function showMainContent() {
    mainContent.classList.remove('hidden');
    setTimeout(() => {
        mainContent.classList.add('visible');
    }, 50);
}

// Auth Modal Functions
function showAuthModal(formType) {
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    switchAuthForm(formType);
}

function hideAuthModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
    clearForms();
}

function switchAuthForm(formType) {
    if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    clearErrors();
}

// Auth Handlers
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    showLoadingScreen();
    
    setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            hideAuthModal();
            updateUI();
            showMessage('Login successful! Welcome back!', 'success');
        } else {
            showMessage('Invalid email or password', 'error');
        }
        
        hideLoadingScreen();
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const terms = document.querySelector('input[name="terms"]').checked;
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!terms) {
        showMessage('Please accept the terms and conditions', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    showLoadingScreen();
    
    setTimeout(async () => {
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Send welcome email
        await sendWelcomeEmail(email, name);
        
        hideAuthModal();
        updateUI();
        showMessage('Registration successful! Welcome to MovieHub! 🎬', 'success');
        
        hideLoadingScreen();
    }, 1500);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
    showMessage('Logged out successfully!', 'success');
}

function checkAuthStatus() {
    if (currentUser) {
        updateUI();
    }
}

function updateUI() {
    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userContent.classList.remove('hidden');
        guestContent.classList.add('hidden');
        
        userGreeting.textContent = `Welcome, ${currentUser.name.split(' ')[0]}!`;
        displayName.textContent = currentUser.name;
        updateWatchlistDisplay();
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
        userContent.classList.add('hidden');
        guestContent.classList.remove('hidden');
    }
}

// Utility Functions
function showMessage(message, type = 'success') {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `success-message ${type === 'error' ? 'error-message' : ''}`;
    messageDiv.textContent = message;
    
    if (type === 'error') {
        messageDiv.style.background = '#e74c3c';
    } else if (type === 'warning') {
        messageDiv.style.background = '#f39c12';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

function clearForms() {
    document.querySelectorAll('form').forEach(form => form.reset());
    clearErrors();
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error', 'success');
    });
}

// Make functions globally available
window.switchSection = switchSection;
window.removeFromWatchlist = removeFromWatchlist;

// Clear all data function
function clearAllData() {
    if (confirm("Clear ALL user data? This will log you out and delete all accounts!")) {
        localStorage.clear();
        users = [];
        currentUser = null;
        watchlist = [];
        
        updateUI();
        showMessage('🧹 All data cleared! You can register again.', 'success');
        
        // Refresh the page
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

// Add event listener for the button
document.addEventListener('DOMContentLoaded', function() {
    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
});