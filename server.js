import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import guestRoutes from './routes/guestRoutes.js';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis le répertoire server/
dotenv.config({ path: join(__dirname, '.env') });

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/guests', guestRoutes);
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Wedding - Backend opérationnel! 🎉',
    version: '1.0.0'
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 API disponible sur http://localhost:${PORT}`);
  console.log(`📚 Documentation des routes:`);
  console.log(`   - POST   /api/guests (créer un invité)`);
  console.log(`   - GET    /api/guests (admin - liste tous les invités)`);
  console.log(`   - POST   /api/auth/login (authentification admin)`);
});

