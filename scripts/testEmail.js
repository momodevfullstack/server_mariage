import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendInvitationEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env') });

// Test avec un invité fictif
const testGuest = {
  name: 'Test Invité',
  email: process.env.TEST_EMAIL || 'bambahamed262@gmail.com', // Utiliser votre email pour tester
  status: 'confirmed',
  plusOne: false,
  relation: 'Ami',
  message: 'Test d\'envoi d\'email'
};

console.log('🧪 Test d\'envoi d\'email...\n');
console.log('Configuration:');
console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NON DÉFINI');
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Défini' : '❌ NON DÉFINI');
console.log('  Envoi à:', testGuest.email);
console.log('\n---\n');

sendInvitationEmail(testGuest)
  .then(result => {
    if (result.success) {
      console.log('\n✅ TEST RÉUSSI !');
      console.log('   MessageId:', result.messageId);
      console.log('   Vérifiez votre boîte email (et les spams)');
    } else {
      console.log('\n❌ TEST ÉCHOUÉ');
      console.log('   Erreur:', result.message || result.error);
      console.log('   Code:', result.code || 'N/A');
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    process.exit(1);
  });

