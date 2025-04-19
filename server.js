const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.get('/api/prospects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM prospects');
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error al obtener prospectos' });
    }
});

app.post('/api/prospects', async (req, res) => {
    const { name, phone, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO prospects (name, phone, status) VALUES ($1, $2, $3) RETURNING *',
            [name, phone, status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Error al añadir prospecto' });
    }
});

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS prospects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL
            );
        `);
        console.log('Tabla "prospects" creada o ya existe');
    } catch (err) {
        console.error('Error al crear la tabla:', err.stack);
    }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    await initDb();
});
