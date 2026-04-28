const express = require('express');
const { Pool } = require ('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Konfigurasi Database
const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//1.EndPoint SIGN UP (Pendaftaran)
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        //Enkripsi password sebelum disimpan
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //Simpan ke database
        const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email';
        const values = [name, email, hashedPassword];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "User berhasil didaftarkan",
            user: result.rows[0]
        });
    } catch (err) {
        // Cek jika error disebabkan karena nama/email sudah ada (Unique Constraint)
        if(err.code === '23505') {
            res.status(400).json({ message: "Nama atau email sudah terdaftar" });
        } else {
            console.error(err);
            res.status(500).json({ message: "Terjadi kesalahan pada server" });
        }
    }
});

// 2. Endpoint LOGIN
app.post('/api/login', async (req, res) => {
    const { name, password } =  req.body;

    try {
        // Cari user berdasarkan nama
        const userQuery = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

        if(userQuery.rows.length === 0) {
            return res.status(400).json({message: "User tidak ditemukan!" });
        }

        const user = userQuery.rows[0];

        //Bandingkan password yang di ketik dengan password yang di hash di db
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ message: "Password salah!" });
        }

        // Jika berhasil, kirim data user ke frontend
        res.json({
            message: "Login Berhasil",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});

const PORT_SERVER =  process.env.PORT || 5000;
app.listen(PORT_SERVER, () => {
    console.log(`Server R&D berjalan di http://localhost:${PORT_SERVER}`);
});