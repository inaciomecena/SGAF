const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

const envCandidates = [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '.env.production')];
const envPath = envCandidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const produtorRoutes = require('./routes/produtorRoutes');
const aterRoutes = require('./routes/aterRoutes');
const recursoRoutes = require('./routes/recursoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tabelaRoutes = require('./routes/tabelaRoutes');
const syncRoutes = require('./routes/syncRoutes');
const frotaRoutes = require('./routes/frotaRoutes');
const pmafRoutes = require('./routes/pmafRoutes');
const simRoutes = require('./routes/simRoutes');

const app = express();
const frontendDistCandidates = [
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, '../../clientsaf'),
  path.resolve(process.cwd(), '../clientsaf')
];
const frontendDistPath = frontendDistCandidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html'))) || frontendDistCandidates[0];

// Middlewares Globais
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rural', produtorRoutes);
app.use('/api/ater', aterRoutes);
app.use('/api/recursos', recursoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tabelas', tabelaRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/frota', frotaRoutes);
app.use('/api/pmaf', pmafRoutes);
app.use('/api/sim', simRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'API SGAF Online', version: '1.0.0' });
  });
}

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

module.exports = app;
