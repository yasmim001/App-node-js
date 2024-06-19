const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

// Configuração do body-parser para obter dados de formulários HTML
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql2024',
    database: 'crud_nodejs'
  });

  db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL!');
  });

    // Configuração da rota para exibir o formulário HTML
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    // Rota para processar o formulário de cadastro
    app.post('/cadastro', (req, res) => {
        const {usuario, email, telefone } = req.body;
        const sql = 'INSERT INTO cadastro (usuario, email, telefone) VALUES (?, ?, ?)';
        db.query(sql, [usuario, email, telefone], (err, result) => {
        if (err) throw err;
        res.send('Cadastro Realizado com Sucesso!');
        });
    });

    // Rota para exibir os dados da tabela
    app.get('/lista', (req, res) => {
        const sql = 'SELECT * FROM cadastro';
        db.query(sql, (err, results) => {
        if (err) throw err;
   
        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Pessoas</title>
            </head>
            <body>
            <h1>Lista de Pessoas</h1>
            <table border="1">
                <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                </tr>`;
   
        results.forEach(person => {
            html += `
            <tr>
                <td>${person.id}</td>
                <td>${person.usuario}</td>
                <td>${person.email}</td>
                <td>${person.telefone}</td>
                <td>
                    <a href="/editar/${person.id}">Editar</a> |
                    <a href="#" onclick="deleteCadastro(${person.id})">Deletar</a>
                </td>
            </tr>`;
        });
   
        html += `
            </table>
            <script>
                function deleteCadastro(id) {
                    if (confirm('Você tem certeza que realmente quer apagar esse cadastro?')) {
                        fetch('/deletar/' + id, {
                            method: 'DELETE'
                        })
                        .then(response => response.text())
                        .then(data => {
                            alert(data);
                            location.reload();
                        })
                        .catch(error => console.error('Error:', error));
                    }
                }
            </script>
            </body>
            </html>`;
   
        res.send(html);
        });
    });
   
    app.get('/editar/:id', (req, res) => {
        const { id } = req.params;
        const sql = 'SELECT * FROM cadastro WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
                res.send('Não há nenhum registro com o esse ID especificado.');
                return;
            }
   
            const person = result[0];
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Editar Pessoa</title>
                </head>
                <body>
                <h1>Editar Pessoa</h1>
                <form action="/atualizar/${person.id}" method="POST">
                    <label for="usuario">Nome:</label>
                    <input type="text" id="usuario" name="usuario" value="${person.usuario}" required><br><br>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${person.email}" required><br><br>
                    <label for="telefone">Telefone:</label>
                    <input type="text" id="telefone" name="telefone" value="${person.telefone}" required><br><br>
                    <button type="submit">Atualizar</button>
                </form>
                </body>
                </html>`;
           
            res.send(html);
        });
    });
   
    // Rota PUT para atualizar um cadastro específico
    app.post('/atualizar/:id', (req, res) => {
        const { id } = req.params;
        const { usuario, email, telefone } = req.body;
        const sql = 'UPDATE cadastro SET usuario = ?, email = ?, telefone = ? WHERE id = ?';
        db.query(sql, [usuario, email, telefone, id], (err, result) => {
            if (err) throw err;
            if (result.affectedRows === 0) {
                res.send('Não há nenhum registro com o esse ID especificado.');
            } else {
                res.send('Cadastro atualizado!');
            }
        });
    });

    // Rota DELETE para remover um cadastro específico
    app.delete('/deletar/:id', (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM cadastro WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) throw err;
            if (result.affectedRows === 0) {
                res.send('Não há nenhum registro com o esse ID especificado.');
            } else {
                res.send('Cadastro deletado!');
            }
        });
    });

    // Iniciar o servidor
    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });