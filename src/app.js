const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const produtorRoutes = require('./routes/produtorRoutes');
const aterRoutes = require('./routes/aterRoutes');
const recursoRoutes = require('./routes/recursoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares Globais
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rural', produtorRoutes);
app.use('/api/ater', aterRoutes);
app.use('/api/recursos', recursoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de Health Check
app.get('/', (req, res) => {
  res.json({ message: 'API SGAF Online', version: '1.0.0' });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

module.exports = app;
