import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Guest from '../models/Guest.js';
import connectDB from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le .env depuis le répertoire server/
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearDatabase = async () => {
  try {
    // Connecter à MongoDB
    await connectDB();

    // Compter les invités avant suppression
    const countBefore = await Guest.countDocuments();
    console.log(`📊 Nombre d'invités dans la base : ${countBefore}`);

    if (countBefore === 0) {
      console.log('✅ La base de données est déjà vide.');
      process.exit(0);
    }

    // Demander confirmation
    console.log(`\n⚠️  ATTENTION : Vous êtes sur le point de supprimer ${countBefore} invité(s) de la base de données.`);
    console.log('Cette action est irréversible.\n');

    // Supprimer tous les invités
    const result = await Guest.deleteMany({});
    
    console.log(`\n✅ ${result.deletedCount} invité(s) supprimé(s) avec succès !`);
    console.log('🗑️  La base de données a été nettoyée.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    process.exit(1);
  }
};

clearDatabase();

