const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'atlanticopalace',
    password: 'admin',
    port: 5432,
});

// ============================================================
// USUÁRIOS
// ============================================================

app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome_completo, email, telefone, cpf FROM usuarios ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/usuarios/login', async (req, res) => {
    try {
        const { login, senha } = req.body;
        const result = await pool.query(
            `SELECT * FROM usuarios WHERE (email = $1 OR regexp_replace(telefone, '\\D', '', 'g') = $2)`,
            [login, login.replace(/\D/g, '')]
        );
        const usuario = result.rows[0];
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        if (usuario.senha !== senha) return res.status(401).json({ erro: 'Senha incorreta.' });
        const { senha: _, ...usuarioSemSenha } = usuario;
        res.json(usuarioSemSenha);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/usuarios', async (req, res) => {
    try {
        const { nome_completo, email, telefone, cpf, senha, genero, data_nascimento, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
        const duplicado = await pool.query('SELECT id FROM usuarios WHERE email=$1 OR cpf=$2', [email, cpf.replace(/\D/g, '')]);
        if (duplicado.rows.length > 0) return res.status(409).json({ erro: 'E-mail ou CPF já cadastrado.' });
        const result = await pool.query(
            `INSERT INTO usuarios
                (nome_completo, email, telefone, cpf, senha, genero, data_nascimento, cep, rua, numero, complemento, bairro, cidade, estado)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             RETURNING id, nome_completo, email, telefone, cpf, genero, data_nascimento, cep, rua, numero, complemento, bairro, cidade, estado`,
            [nome_completo, email, telefone, cpf.replace(/\D/g, ''), senha, genero, data_nascimento, cep, rua, numero, complemento || null, bairro, cidade, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});


// Verifica se o email do token existe (página de redefinição)
app.get('/usuarios/verificar-token', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ erro: 'Token inválido.' });
        const result = await pool.query('SELECT nome_completo FROM usuarios WHERE email=$1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ erro: 'Token inválido.' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ erro: err.message }); }
});

// Redefine a senha após o usuário clicar no link
app.patch('/usuarios/redefinir-senha', async (req, res) => {
    try {
        const { email, nova_senha } = req.body;
        if (!email || !nova_senha) return res.status(400).json({ erro: 'Dados inválidos.' });
        const result = await pool.query(
            'UPDATE usuarios SET senha=$1 WHERE email=$2 RETURNING id',
            [nova_senha, email]
        );
        if (result.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        res.json({ ok: true });
    } catch (err) { res.status(500).json({ erro: err.message }); }
});

app.post('/usuarios/recuperar-senha', async (req, res) => {
    try {
        const { contato } = req.body;
        const result = await pool.query(
            `SELECT email, nome_completo FROM usuarios WHERE email=$1 OR regexp_replace(telefone,'\\D','','g')=$2`,
            [contato, contato.replace(/\D/g, '')]
        );
        if (result.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        res.json({ email: result.rows[0].email, nome: result.rows[0].nome_completo });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// COLABORADORES
// ============================================================

app.get('/colaboradores', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome, email, cargo, nivel, telefone, ativo FROM colaboradores WHERE ativo=true ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/colaboradores/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const result = await pool.query('SELECT * FROM colaboradores WHERE email=$1 AND ativo=true', [email]);
        const colab = result.rows[0];
        if (!colab) return res.status(404).json({ erro: 'Colaborador não encontrado.' });
        if (colab.senha !== senha) return res.status(401).json({ erro: 'Senha incorreta.' });
        const { senha: _, ...colabSemSenha } = colab;
        res.json(colabSemSenha);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/colaboradores', async (req, res) => {
    try {
        const { nome, email, cargo, nivel, senha, telefone } = req.body;
        const result = await pool.query(
            'INSERT INTO colaboradores (nome, email, cargo, nivel, senha, telefone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, nome, email, cargo, nivel, telefone, ativo',
            [nome, email, cargo, nivel, senha, telefone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.patch('/colaboradores/:id/desativar', async (req, res) => {
    try {
        await pool.query('UPDATE colaboradores SET ativo=false WHERE id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// QUARTOS
// ============================================================

app.get('/quartos', async (req, res) => {
    try {
        const { checkin, checkout } = req.query;
        // Sem datas: retorna todos (painel admin)
        if (!checkin || !checkout) {
            const result = await pool.query('SELECT * FROM quartos ORDER BY preco_diaria asc');
            return res.json(result.rows);
        }
        // Com datas: retorna só os disponíveis (sem conflito de reserva)
        const result = await pool.query(`
            SELECT * FROM quartos
            WHERE id NOT IN (
                SELECT ri.quarto_id
                FROM reserva_itens ri
                JOIN reservas r ON r.id = ri.reserva_id
                WHERE r.checkin < $2
                AND r.checkout > $1
            )
            ORDER BY preco_diaria ASC
        `, [checkin, checkout]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/quartos', async (req, res) => {
    try {
        const count = await pool.query('SELECT COUNT(*) FROM quartos');
        if (parseInt(count.rows[0].count) >= 10)
            return res.status(400).json({ erro: 'Limite máximo de 10 quartos atingido.' });
        const { nome, preco_diaria, imagem, descricao, capacidade, cama } = req.body;
        const result = await pool.query(
            'INSERT INTO quartos (nome, preco_diaria, imagem, descricao, capacidade, cama) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
            [nome, preco_diaria, imagem, descricao, capacidade, cama]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/quartos/:id', async (req, res) => {
    try {
        const { nome, preco_diaria, imagem, descricao, capacidade, cama } = req.body;
        const result = await pool.query(
            'UPDATE quartos SET nome=$1, preco_diaria=$2, imagem=$3, descricao=$4, capacidade=$5, cama=$6 WHERE id=$7 RETURNING *',
            [nome, preco_diaria, imagem, descricao, capacidade, cama, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/quartos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM quartos WHERE id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// SERVIÇOS
// ============================================================

app.get('/servicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM servicos ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/servicos', async (req, res) => {
    try {
        const { icone, nome, descricao, imagem } = req.body;
        const result = await pool.query(
            'INSERT INTO servicos (icone, nome, descricao, imagem) VALUES ($1,$2,$3,$4) RETURNING *',
            [icone, nome, descricao, imagem]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/servicos/:id', async (req, res) => {
    try {
        const { icone, nome, descricao, imagem } = req.body;
        const result = await pool.query(
            'UPDATE servicos SET icone=$1, nome=$2, descricao=$3, imagem=$4 WHERE id=$5 RETURNING *',
            [icone, nome, descricao, imagem, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/servicos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM servicos WHERE id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// RESERVAS
// ============================================================

app.get('/reservas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reservas ORDER BY criado_em DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/reservas/usuario/:usuario_id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM reservas WHERE usuario_id=$1 AND finalizado=false ORDER BY criado_em DESC',
            [req.params.usuario_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Finalizar reserva (admin)
app.patch('/reservas/:id/finalizar', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE reservas SET finalizado=true WHERE id=$1 RETURNING *',
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ erro: 'Reserva não encontrada.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/reservas', async (req, res) => {
    try {
        const { usuario_id, checkin, checkout, noites, total, itens } = req.body;
        const reserva = await pool.query(
            'INSERT INTO reservas (usuario_id, checkin, checkout, noites, total) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [usuario_id, checkin, checkout, noites, total]
        );
        const reservaId = reserva.rows[0].id;
        if (itens && itens.length > 0) {
            for (const item of itens) {
                await pool.query(
                    'INSERT INTO reserva_itens (reserva_id, quarto_id, quantidade) VALUES ($1,$2,$3)',
                    [reservaId, item.quarto_id, item.quantidade]
                );
            }
        }
        res.status(201).json(reserva.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// AVALIAÇÕES
// ============================================================

app.get('/avaliacoes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM avaliacoes ORDER BY criado_em DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/avaliacoes', async (req, res) => {
    try {
        const { usuario_id, nome_autor, estrelas, comentario, data_avaliacao } = req.body;
        const result = await pool.query(
            'INSERT INTO avaliacoes (usuario_id, nome_autor, estrelas, comentario, data_avaliacao) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [usuario_id, nome_autor, estrelas, comentario, data_avaliacao]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.patch('/avaliacoes/:id/responder', async (req, res) => {
    try {
        const { resposta } = req.body;
        const result = await pool.query(
            'UPDATE avaliacoes SET resposta=$1, resposta_data=NOW() WHERE id=$2 RETURNING *',
            [resposta, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/avaliacoes/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM avaliacoes WHERE id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// CHATS
// ============================================================

app.get('/chats/:email_usuario', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM chats WHERE usuario_email=$1 ORDER BY timestamp ASC',
            [decodeURIComponent(req.params.email_usuario)]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/chats', async (req, res) => {
    try {
        const { usuario_email, remetente, texto } = req.body;
        const result = await pool.query(
            'INSERT INTO chats (usuario_email, remetente, texto) VALUES ($1,$2,$3) RETURNING *',
            [usuario_email, remetente, texto]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ============================================================
// DASHBOARD (dados agregados para o painel colaborador)
// ============================================================

app.get('/dashboard', async (req, res) => {
    try {
        const [usuarios, reservas, avaliacoes, chats] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM usuarios'),
            pool.query('SELECT COUNT(*) FROM reservas'),
            pool.query('SELECT COUNT(*) FROM avaliacoes'),
            pool.query('SELECT COUNT(DISTINCT usuario_email) FROM chats'),
        ]);
        res.json({
            usuarios: parseInt(usuarios.rows[0].count),
            reservas: parseInt(reservas.rows[0].count),
            avaliacoes: parseInt(avaliacoes.rows[0].count),
            chats: parseInt(chats.rows[0].count),
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/relatorios', async (req, res) => {
    try {
        const [usuarios, reservas, avaliacoes, faturamento, ultimas, reservasFuturas, totalQuartos] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM usuarios'),
            pool.query('SELECT COUNT(*) FROM reservas'),
            pool.query('SELECT AVG(estrelas) FROM avaliacoes'),
            pool.query('SELECT COALESCE(SUM(total),0) AS total FROM reservas'),
            pool.query('SELECT * FROM reservas ORDER BY criado_em DESC LIMIT 5'),
            // Reservas com check-in futuro (ainda não realizadas)
            pool.query("SELECT COUNT(*) FROM reservas WHERE checkin > NOW()::date"),
            // Total de quartos reservados (soma das quantidades em reserva_itens)
            pool.query('SELECT COALESCE(SUM(quantidade),0) AS total FROM reserva_itens'),
        ]);
        res.json({
            total_usuarios: parseInt(usuarios.rows[0].count),
            total_reservas: parseInt(reservas.rows[0].count),
            media_avaliacoes: parseFloat(avaliacoes.rows[0].avg || 0).toFixed(1),
            faturamento_total: parseFloat(faturamento.rows[0].total).toFixed(2),
            ultimas_reservas: ultimas.rows,
            reservas_futuras: parseInt(reservasFuturas.rows[0].count),
            total_quartos_reservados: parseInt(totalQuartos.rows[0].total),
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));