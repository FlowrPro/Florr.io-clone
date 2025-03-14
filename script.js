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

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: canvas.width / 2, y: canvas.height / 2, petals: 0, inventory: [] };
let mobs = [];
let petals = [];

let loggedIn = false;

loginButton.addEventListener('click', () => {
    socket.emit('login', { username: usernameInput.value, password: passwordInput.value });
});

registerButton.addEventListener('click', () => {
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
    alert(message);
});

socket.on('registerSuccess', (userData) => {
    alert("Register Successful, Please Log in.");
});

socket.on('registerFailure', (message) => {
    alert(message);
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

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
}

function drawMobs() {
    mobs.forEach(mob => {
        ctx.beginPath();
        ctx.rect(mob.x,mob.y, 20, 20);
        ctx.fillStyle = 'red';
        ctx.fill();
    });
}

function drawPetals() {
    petals.forEach(petal => {
        ctx.beginPath();
        ctx.arc(petal.x, petal.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    });
}

function updateInventoryDisplay() {
    petalCountSpan.textContent = player.petals;
    inventorySlotsDiv.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.style.border = '1px solid black';
        slot.style.width = '30px';
        slot.style.height = '30px';
        slot.style.display = 'inline-block';
        slot.textContent = player.inventory[i] || ''; // Display petal name if available
        inventorySlotsDiv.appendChild(slot);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawMobs();
    drawPetals();
    requestAnimationFrame(gameLoop);
}

inventoryDiv.style.display = 'none';
