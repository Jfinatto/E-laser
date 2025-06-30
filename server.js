const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Rotas para o catálogo de peças ---

// Crie a tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS catalogo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo INTEGER,
    nome TEXT,
    material TEXT,
    metodoCalculo TEXT,
    largura REAL,
    comprimento REAL,
    area REAL,
    peso REAL,
    espessura REAL,
    quantidade INTEGER,
    dobras INTEGER,
    grauDificuldade INTEGER,
    imagemBase64 TEXT
)`);

// Listar catálogo
app.get('/api/catalogo', (req, res) => {
    db.all('SELECT * FROM catalogo', [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

// Adicionar peça ao catálogo
app.post('/api/catalogo', (req, res) => {
    const p = req.body;
    db.run(
        `INSERT INTO catalogo (codigo, nome, material, metodoCalculo, largura, comprimento, area, peso, espessura, quantidade, dobras, grauDificuldade, imagemBase64)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.codigo, p.nome, p.material, p.metodoCalculo, p.largura, p.comprimento, p.area, p.peso, p.espessura, p.quantidade, p.dobras, p.grauDificuldade, p.imagemBase64],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({id: this.lastID});
        }
    );
});

// Remover peça do catálogo
app.delete('/api/catalogo/:id', (req, res) => {
    db.run('DELETE FROM catalogo WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ok: true});
    });
});

// --- Rotas para as peças do orçamento ---

// Crie a tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS pecas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo INTEGER,
    nome TEXT,
    material TEXT,
    metodoCalculo TEXT,
    largura REAL,
    comprimento REAL,
    area REAL,
    peso REAL,
    espessura REAL,
    quantidade INTEGER,
    dobras INTEGER,
    grauDificuldade INTEGER,
    imagemBase64 TEXT
)`);

// Listar peças
app.get('/api/pecas', (req, res) => {
    db.all('SELECT * FROM pecas', [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

// Adicionar peça
app.post('/api/pecas', (req, res) => {
    const p = req.body;
    db.run(
        `INSERT INTO pecas (codigo, nome, material, metodoCalculo, largura, comprimento, area, peso, espessura, quantidade, dobras, grauDificuldade, imagemBase64)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.codigo, p.nome, p.material, p.metodoCalculo, p.largura, p.comprimento, p.area, p.peso, p.espessura, p.quantidade, p.dobras, p.grauDificuldade, p.imagemBase64],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({id: this.lastID});
        }
    );
});

// Atualizar peça
app.put('/api/pecas/:id', (req, res) => {
    const p = req.body;
    db.run(
        `UPDATE pecas SET codigo=?, nome=?, material=?, metodoCalculo=?, largura=?, comprimento=?, area=?, peso=?, espessura=?, quantidade=?, dobras=?, grauDificuldade=?, imagemBase64=?
         WHERE id=?`,
        [p.codigo, p.nome, p.material, p.metodoCalculo, p.largura, p.comprimento, p.area, p.peso, p.espessura, p.quantidade, p.dobras, p.grauDificuldade, p.imagemBase64, req.params.id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ok: true});
        }
    );
});

// Remover peça
app.delete('/api/pecas/:id', (req, res) => {
    db.run('DELETE FROM pecas WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ok: true});
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});