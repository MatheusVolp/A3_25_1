const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

let savedPasswords = [];
let nextId = 1;

app.get('/', (req, res) => {
    res.send('Servidor de API rodando!');
});

app.post('/api/passwords', (req, res) => {
    const { passwordValue, description } = req.body;

    if (!passwordValue) {
        return res.status(400).json({ message: 'O campo "passwordValue" é obrigatório.' });
    }

    const newPassword = {
        id: nextId++,
        passwordValue,
        description: description || 'Sem descrição',
        createdAt: new Date().toISOString()
    };

    savedPasswords.push(newPassword);

    res.status(201).json({
        message: 'Senha salva com sucesso!',
        data: newPassword
    });
});

app.get('/api/passwords', (req, res) => {
    res.status(200).json({
        message: 'Senhas recuperadas com sucesso!',
        data: savedPasswords
    });
});

// NOVA ROTA: GET para obter uma senha específica por ID
app.get('/api/passwords/:id', (req, res) => {
    const idToFind = parseInt(req.params.id);

    const foundPassword = savedPasswords.find(pwd => pwd.id === idToFind);

    if (foundPassword) {
        res.status(200).json({
            message: `Senha com ID ${idToFind} recuperada com sucesso!`,
            data: foundPassword
        });
    } else {
        res.status(404).json({ message: `Senha com ID ${idToFind} não encontrada.` });
    }
});


app.put('/api/passwords/:id', (req, res) => {
    const idToUpdate = parseInt(req.params.id);
    const { passwordValue, description } = req.body;

    const passwordIndex = savedPasswords.findIndex(pwd => pwd.id === idToUpdate);

    if (passwordIndex === -1) {
        return res.status(404).json({ message: `Senha com ID ${idToUpdate} não encontrada.` });
    }

    const updatedPassword = {
        id: savedPasswords[passwordIndex].id,
        passwordValue: passwordValue !== undefined ? passwordValue : savedPasswords[passwordIndex].passwordValue,
        description: description !== undefined ? description : savedPasswords[passwordIndex].description,
        createdAt: savedPasswords[passwordIndex].createdAt,
        updatedAt: new Date().toISOString()
    };

    if (updatedPassword.passwordValue === undefined || updatedPassword.passwordValue === null || updatedPassword.passwordValue === '') {
        return res.status(400).json({ message: 'O campo "passwordValue" não pode ser vazio na atualização.' });
    }

    savedPasswords[passwordIndex] = updatedPassword;
    console.log('Senha atualizada (PUT):', updatedPassword);
    res.status(200).json({
        message: `Senha com ID ${idToUpdate} atualizada completamente com sucesso!`,
        data: updatedPassword
    });
});

app.patch('/api/passwords/:id', (req, res) => {
    const idToUpdate = parseInt(req.params.id);
    const updates = req.body;

    const passwordIndex = savedPasswords.findIndex(pwd => pwd.id === idToUpdate);

    if (passwordIndex === -1) {
        return res.status(404).json({ message: `Senha com ID ${idToUpdate} não encontrada.` });
    }

    const existingPassword = savedPasswords[passwordIndex];
    const updatedPassword = {
        ...existingPassword,
        ...updates,
        id: existingPassword.id,
        createdAt: existingPassword.createdAt,
        updatedAt: new Date().toISOString()
    };

    if (updates.passwordValue !== undefined && (updates.passwordValue === null || updates.passwordValue === '')) {
        return res.status(400).json({ message: 'O campo "passwordValue" não pode ser vazio na atualização.' });
    }
    if (updatedPassword.passwordValue === undefined || updatedPassword.passwordValue === null || updatedPassword.passwordValue === '') {
        return res.status(400).json({ message: 'A senha resultante não pode ter o campo "passwordValue" vazio.' });
    }

    savedPasswords[passwordIndex] = updatedPassword;
    console.log('Senha atualizada (PATCH):', updatedPassword);
    res.status(200).json({
        message: `Senha com ID ${idToUpdate} atualizada parcialmente com sucesso!`,
        data: updatedPassword
    });
});


app.delete('/api/passwords/:id', (req, res) => {
    const idToDelete = parseInt(req.params.id);

    const initialLength = savedPasswords.length;
    savedPasswords = savedPasswords.filter(pwd => pwd.id !== idToDelete);

    if (savedPasswords.length < initialLength) {
        res.status(200).json({ message: `Senha com ID ${idToDelete} deletada com sucesso!` });
    } else {
        res.status(404).json({ message: `Senha com ID ${idToDelete} não encontrada.` });
    }
});

app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
});