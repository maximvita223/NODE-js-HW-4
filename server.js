const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const joi = require('joi');

const app = express();
const USERS_FILE = path.join(__dirname, 'users.json');

const userSchema = joi.object({
    firstname: joi.string().min(3).required(),
    secondname: joi.string().min(3).required(),
    age: joi.number().min(18).required(),
    city: joi.string().min(3)
});

app.use(express.json());

// Функция для чтения данных из файла
async function readUsers() {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

// Функция для записи данных в файл
async function writeUsers(users) {
    const data = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_FILE, data, 'utf8');
}

app.get('/users', async (req, res) => {
    const users = await readUsers();
    res.send({ users });
});

app.get('/users/:id', async (req, res) => {
    const userId = +req.params.id;
    const users = await readUsers();
    const user = users.find(user => user.id === userId);

    if (user) {
        res.send({ user });
    } else {
        res.status(404).send({ user: null });
    }
});

app.post('/users', async (req, res) => {
    const users = await readUsers();
    const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;

    const newUser = {
        id: newId,
        ...req.body
    };

    users.push(newUser);
    await writeUsers(users);

    res.send({ id: newId });
});

app.put('/users/:id', async (req, res) => {
    const result = userSchema.validate(req.body);
    if (result.error) {
        return res.status(400).send({ error: result.error.details });
    }

    const userId = +req.params.id;
    const users = await readUsers();
    const user = users.find(user => user.id === userId);

    if (user) {
        const { firstname, secondname, age, city } = req.body;
        user.firstname = firstname;
        user.secondname = secondname;
        user.age = age;
        user.city = city;
        await writeUsers(users);
        res.send({ user });
    } else {
        res.status(404).send({ user: null });
    }
});

app.delete('/users/:id', async (req, res) => {
    const userId = +req.params.id;
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
        const [user] = users.splice(userIndex, 1);
        await writeUsers(users);
        res.send({ user });
    } else {
        res.status(404).send({ user: null });
    }
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
