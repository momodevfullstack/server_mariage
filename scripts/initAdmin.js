import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le .env depuis le répertoire server/
dotenv.config({ path: join(__dirname, '..', '.env') });

const initAdmin = async () => {
  try {
    // Connecter à MongoDB
    await connectDB();

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('ℹ️  Un compte admin existe déjà:', existingAdmin.email);
      process.exit(0);
    }

    // Créer l'admin par défaut
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mariage.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('✅ Compte admin créé avec succès!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('⚠️  N\'oubliez pas de changer le mot de passe après la première connexion!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
};

initAdmin();

