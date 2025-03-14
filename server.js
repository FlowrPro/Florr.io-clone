const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(express.static(__dirname));
app.use(bodyParser.json());

let users = {};
let mobs = [];
let petals = [];

function generateMobs() {
    if (mobs.length < 10) {
        mobs.push({ x: Math.random() * 800, y: Math.random() * 600 });
    }
}

function generatePetals() {
    if (petals.length < 20) {
        petals.push({ x: Math.random() * 800, y: Math.random() * 600 });
    }
}

setInterval(generateMobs, 5000);
setInterval(generatePetals, 2000);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('login', (data) => {
        if (users[data.username] && users[data.username].password === data.password) {
            socket.username = data.username;
            socket.emit('loginSuccess', users[data.username]);
        } else {
            socket.emit('loginFailure', 'Invalid username or password');
        }
    });

    socket.on('register', (data) => {
        if (users[data.username]) {
            socket.emit('registerFailure', 'Username already exists');
        } else {
            users[data.username] = { username: data.username, password: data.password, x: 100, y: 100, petals: 0, inventory: [] };
            //Immediately send the login success
            socket.username = data.username;
            socket.emit('loginSuccess', users[data.username]);
        }
    });

    socket.on('playerAction', (data) => {
        if (socket.username) {
            users[socket.username].x = data.x;
            users[socket.username].y = data.y;

            petals = petals.filter(petal => {
                if (Math.abs(users[socket.username].x - petal.x) < 20 && Math.abs(users[socket.username].y - petal.y) < 20) {
                    users[socket.username].petals++;
                    return false;
                }
                return true;
            });

            mobs = mobs.filter(mob => {
                if (Math.abs(users[socket.username].x - mob.x) < 20 && Math.abs(users[socket.username].y - mob.y) < 20) {
                    return false;
                }
                return true;
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
