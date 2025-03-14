const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loginContainer = document.getElementById('login-container');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const inventoryDiv = document.getElementById('inventory');
const petalCountSpan = document.getElementById('petalCount');
const inventorySlotsDiv = document.getElementById('inventorySlots');
const errorMessage = document.getElementById('error-message');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: canvas.width / 2, y: canvas.height / 2, petals: 0, inventory: [] };
let mobs = [];
let petals = [];

let loggedIn = false;

loginButton.addEventListener('click', () => {
    errorMessage.textContent = "";
    if(!usernameInput.value || !passwordInput.value){
        errorMessage.textContent = "Please enter a username and password.";
        return;
    }
    socket.emit('login', { username: usernameInput.value, password: passwordInput.value });
});

registerButton.addEventListener('click', () => {
    errorMessage.textContent = "";
    if(!usernameInput.value || !passwordInput.value){
        errorMessage.textContent = "Please enter a username and password.";
        return;
    }
    socket.emit('register', { username: usernameInput.value, password: passwordInput.value });
});

socket.on('loginSuccess', (userData) => {
    player = userData;
    loggedIn = true;
    loginContainer.style.display = 'none';
    inventoryDiv.style.display = 'block';
    updateInventoryDisplay();
    gameLoop();
});

socket.on('loginFailure', (message) => {
    errorMessage.textContent = message;
});

socket.on('registerSuccess', (userData) => {
    errorMessage.textContent = "Register Successful, Logging in...";
    socket.emit('login', { username: userData.username, password: passwordInput.value });
    usernameInput.value = '';
    passwordInput.value = '';
});

socket.on('registerFailure', (message) => {
    errorMessage.textContent = message;
});

socket.on('gameUpdate', (gameData) => {
    mobs = gameData.mobs;
    petals = gameData.petals;
    player.petals = gameData.player.petals;
    updateInventoryDisplay();
});

canvas.addEventListener('click', (event) => {
    if (loggedIn) {
        socket.emit('playerAction', { x: event.clientX, y: event.clientY });
    }
});

// ... (rest of the drawing and inventory functions remain the same)

inventoryDiv.style.display = 'none';
