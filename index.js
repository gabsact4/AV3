const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.post('/api/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        username: usuario,
        password: senha
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token: user.username
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/aeronaves', async (req, res) => {
  try {
    const aeronaves = await prisma.aircraft.findMany();
    res.json(aeronaves);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aeronaves' });
  }
});

app.post('/api/aeronaves', async (req, res) => {
  try {
    const { codigo, modelo, tipo, capacidade, alcance } = req.body;

    const aeronave = await prisma.aircraft.create({
      data: {
        code: codigo,
        model: modelo,
        type: tipo,
        capacity: capacidade,
        range: alcance
      }
    });

    res.status(201).json(aeronave);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar aeronave' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});