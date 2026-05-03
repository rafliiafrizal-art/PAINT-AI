const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Groq = require('groq-sdk').default;

dotenv.config();
console.log('GROQ KEY:', process.env.GROQ_API_KEY ? 'ADA ✓' : 'TIDAK ADA ✗');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PAINT_SYSTEM_PROMPT = `Kamu adalah AI Paint Specialist — konsultan cat profesional yang ahli dalam:
- Rekomendasi warna cat interior dan eksterior
- Pemilihan jenis cat (tembok, kayu, besi, waterproof, anti-jamur, dll)
- Estimasi kebutuhan cat berdasarkan luas ruangan (1 liter cat ≈ 10-12 m², 2 lapis)
- Tips aplikasi cat yang benar (persiapan dinding, primer, teknik pengecatan)
- Kombinasi warna yang harmonis berdasarkan color wheel
- Perbandingan merek cat: Dulux, Nippon Paint, Jotun, Mowilex, Avitex, dll
- Penanganan masalah cat: mengelupas, berjamur, tidak merata

Aturan menjawab:
1. Jawab dalam Bahasa Indonesia yang ramah dan mudah dipahami
2. Jika user menyebut luas ruangan, HITUNG kebutuhan cat secara otomatis
3. Selalu berikan rekomendasi produk spesifik beserta kisaran harga
4. Jika pertanyaan tidak terkait cat, arahkan kembali dengan sopan`;

// 1. Endpoint SIGN UP.
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email';
        const result = await pool.query(query, [name, email, hashedPassword]);
        res.status(201).json({
            message: "User berhasil didaftarkan",
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ message: "Nama atau email sudah terdaftar" });
        } else {
            console.error(err);
            res.status(500).json({ message: "Terjadi kesalahan pada server" });
        }
    }
});

// 2. Endpoint LOGIN.
app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ message: "User tidak ditemukan!" });
        }
        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password salah!" });
        }
        res.json({
            message: "Login Berhasil",
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});

// 3. Endpoint AI Paint Specialist
app.post('/api/ai-paint', async (req, res) => {
    const { message, userId, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ message: "Pesan tidak boleh kosong" });
    }

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: PAINT_SYSTEM_PROMPT },
                ...conversationHistory.slice(-10).map(m => ({
                    role: m.role,
                    content: m.content
                })),
                { role: 'user', content: message }
            ],
            max_tokens: 1024,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        if (userId) {
            await pool.query(
                `INSERT INTO chat_history (user_id, user_message, ai_response)
                 VALUES ($1, $2, $3)`,
                [userId, message, aiResponse]
            );
        }

        res.json({ success: true, response: aiResponse });

    } catch (err) {
        console.error('=== ERROR AI PAINT ===');
        console.error('Message:', err.message);
        console.error('Status:', err.status);

        if (err.status === 401) {
            return res.status(500).json({ message: "API Key Groq tidak valid" });
        }
        if (err.status === 429) {
            return res.status(429).json({ message: "Terlalu banyak permintaan, coba lagi sebentar" });
        }

        res.status(500).json({ message: `Error: ${err.message}` });
    }
});

// 4. Endpoint Riwayat Chat (tetap dipertahankan)
app.get('/api/ai-paint/history/:userId', async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    try {
        const result = await pool.query(
            `SELECT id, user_message, ai_response, created_at
             FROM chat_history
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        res.json({ success: true, history: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil riwayat chat" });
    }
});

// ── Endpoint Chat Sessions ────────────────────────────────────────────────────

// 5. INSERT session baru
app.post('/api/chat-sessions', async (req, res) => {
    const { userId, title, messages } = req.body;

    if (!userId || !title || !messages) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO chat_sessions (user_id, title, messages)
             VALUES ($1, $2, $3)
             RETURNING id, title, messages, created_at`,
            [userId, title, JSON.stringify(messages)]
        );
        res.json({ success: true, session: result.rows[0] });
    } catch (err) {
        console.error('=== ERROR SIMPAN SESSION ===', err.message);
        res.status(500).json({ message: "Gagal menyimpan sesi percakapan" });
    }
});

// 6. UPDATE session yang sudah ada
app.put('/api/chat-sessions/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { userId, title, messages } = req.body;

    if (!userId || !title || !messages) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
        const result = await pool.query(
            `UPDATE chat_sessions
             SET title = $1, messages = $2, created_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND user_id = $4
             RETURNING id, title, messages, created_at`,
            [title, JSON.stringify(messages), sessionId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Sesi tidak ditemukan" });
        }

        res.json({ success: true, session: result.rows[0] });
    } catch (err) {
        console.error('=== ERROR UPDATE SESSION ===', err.message);
        res.status(500).json({ message: "Gagal mengupdate sesi percakapan" });
    }
});

// 7. Ambil semua chat sessions milik user
app.get('/api/chat-sessions/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, title, messages, created_at
             FROM chat_sessions
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        const sessions = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            messages: typeof row.messages === 'string'
                ? JSON.parse(row.messages)
                : row.messages
        }));

        res.json({ success: true, sessions });
    } catch (err) {
        console.error('=== ERROR AMBIL SESSIONS ===', err.message);
        res.status(500).json({ message: "Gagal mengambil sesi percakapan" });
    }
});

// 8. Hapus satu chat session
app.delete('/api/chat-sessions/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId diperlukan" });
    }

    try {
        await pool.query(
            `DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2`,
            [sessionId, userId]
        );
        res.json({ success: true, message: "Sesi berhasil dihapus" });
    } catch (err) {
        console.error('=== ERROR HAPUS SESSION ===', err.message);
        res.status(500).json({ message: "Gagal menghapus sesi percakapan" });
    }
});

// ── TAMBAHAN FITUR 1: Hapus SEMUA chat sessions milik satu user ──────────────
// Dipanggil dari tombol "Hapus Semua History Log" di Setelan → Umum
app.delete('/api/chat-sessions/clear/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM chat_sessions WHERE user_id = $1`,
            [userId]
        );
        res.json({
            success: true,
            message: `Berhasil menghapus ${result.rowCount} sesi percakapan`
        });
    } catch (err) {
        console.error('=== ERROR HAPUS SEMUA SESSION ===', err.message);
        res.status(500).json({ message: "Gagal menghapus semua sesi percakapan" });
    }
});
// ─────────────────────────────────────────────────────────────────────────────

const PORT_SERVER = process.env.PORT || 5000;
app.listen(PORT_SERVER, () => {
    console.log(`Server R&D berjalan di http://localhost:${PORT_SERVER}`);
});