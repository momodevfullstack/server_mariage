import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration du transporteur email
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  // Si service SMTP personnalisé avec host/port
  if (emailService === 'smtp' && process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true pour 465, false pour autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // Pour Gmail, Outlook, etc. (service prédéfini)
  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // App Password pour Gmail
    }
  });
};

// Template HTML de l'email
const createEmailTemplate = (guestName, weddingDate, weddingLocation, imageUrl = null) => {
  const formattedDate = new Date(weddingDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Section image (si URL fournie, sinon on utilise la pièce jointe)
  const imageSection = imageUrl ? `
        <!-- Image de la carte d'invitation -->
        <div style="text-align: center; margin: 30px 0;">
          <img src="${imageUrl}" alt="Carte d'Invitation" style="max-width: 100%; height: auto; border: 1px solid #E5DCD3;" />
        </div>
      ` : `
        <!-- L'image sera en pièce jointe -->
      `;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation au Mariage - Guy-Morel & Olive</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #FDFBF9; color: #2C2C2C;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 40px 30px;">
        
        <!-- En-tête -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #E5DCD3; padding-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: 300; color: #2C2C2C; margin: 0 0 10px 0; font-style: italic;">
            Guy-Morel & Olive
          </h1>
          <p style="font-size: 12px; color: #A69382; text-transform: uppercase; letter-spacing: 0.3em; margin: 0;">
            Célébration de Mariage
          </p>
        </div>

        <!-- Message de bienvenue -->
        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; line-height: 1.8; color: #2C2C2C; margin: 0 0 20px 0;">
            Cher(e) <strong>${guestName}</strong>,
          </p>
          <p style="font-size: 16px; line-height: 1.8; color: #2C2C2C; margin: 0 0 20px 0;">
            Nous sommes ravis de vous confirmer votre invitation à notre mariage !
          </p>
        </div>

        <!-- Informations importantes -->
        <div style="background-color: #FDFBF9; border: 1px solid #E5DCD3; padding: 30px; margin: 30px 0; text-align: center;">
          <h2 style="font-size: 20px; color: #2C2C2C; margin: 0 0 20px 0; font-weight: 400;">
            📅 Date du Mariage
          </h2>
          <p style="font-size: 24px; color: #2C2C2C; margin: 0 0 10px 0; font-weight: 300;">
            <strong>${formattedDate}</strong>
          </p>
          <p style="font-size: 16px; color: #A69382; margin: 20px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">
            📍 ${weddingLocation}
          </p>
        </div>

        <!-- Message personnalisé -->
        <div style="margin: 30px 0;">
          <p style="font-size: 16px; line-height: 1.8; color: #2C2C2C; margin: 0 0 20px 0;">
            Votre présence nous tient à cœur et nous serions honorés de partager ce moment spécial avec vous.
          </p>
          <p style="font-size: 16px; line-height: 1.8; color: #2C2C2C; margin: 0;">
            ${imageUrl ? 'Veuillez trouver ci-dessous votre carte d\'invitation personnalisée.' : 'Veuillez trouver ci-joint votre carte d\'invitation personnalisée.'}
          </p>
        </div>

        ${imageSection}

        <!-- Note -->
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E5DCD3;">
          <p style="font-size: 14px; color: #A69382; margin: 0; text-align: center; font-style: italic;">
            Nous avons hâte de célébrer ce jour avec vous !
          </p>
          <p style="font-size: 14px; color: #A69382; margin: 10px 0 0 0; text-align: center;">
            Avec toute notre affection,<br>
            <strong style="color: #2C2C2C;">Guy-Morel & Olive</strong>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};

// Fonction pour obtenir le chemin ou l'URL de l'image de la carte d'invitation
const getInvitationCard = () => {
  // Si une URL publique est définie (pour la production)
  if (process.env.INVITATION_CARD_URL) {
    return { type: 'url', value: process.env.INVITATION_CARD_URL };
  }

  // Essayer plusieurs chemins possibles pour un fichier local
  const possiblePaths = [
    // Chemin depuis le serveur vers le dossier public du frontend
    join(__dirname, '../../public/assets/CARTE INVITATION DE MARIAGE.png'),
    // Chemin relatif si le serveur est dans le même repo
    join(process.cwd(), 'public/assets/CARTE INVITATION DE MARIAGE.png'),
    // Chemin absolu si défini dans les variables d'environnement
    process.env.INVITATION_CARD_PATH
  ];

  for (const path of possiblePaths) {
    if (path && fs.existsSync(path)) {
      return { type: 'file', value: path };
    }
  }

  return null;
};

// Fonction principale pour envoyer l'email d'invitation
export const sendInvitationEmail = async (guest) => {
  try {
    console.log(`📧 Tentative d'envoi d'email à ${guest.email}...`);
    
    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Variables d\'environnement EMAIL_USER et EMAIL_PASSWORD non configurées. Email non envoyé.');
      console.error('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Défini' : '❌ Manquant');
      console.error('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Défini' : '❌ Manquant');
      return { success: false, message: 'Configuration email manquante' };
    }

    console.log(`   Service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    console.log(`   Utilisateur: ${process.env.EMAIL_USER}`);
    
    const transporter = createTransporter();
    
    // Tester la connexion
    try {
      await transporter.verify();
      console.log('   ✅ Connexion au serveur email réussie');
    } catch (verifyError) {
      console.error('   ❌ Erreur de connexion au serveur email:', verifyError.message);
      return { success: false, error: verifyError.message, message: 'Erreur de connexion au serveur email' };
    }

    // Obtenir le chemin ou l'URL de l'image
    const imageInfo = getInvitationCard();
    
    // Préparer les pièces jointes et l'URL de l'image
    const attachments = [];
    let imageUrl = null;
    
    if (imageInfo) {
      if (imageInfo.type === 'file' && fs.existsSync(imageInfo.value)) {
        // Fichier local - utiliser comme pièce jointe
        attachments.push({
          filename: 'Carte_Invitation_Mariage.png',
          path: imageInfo.value,
          cid: 'invitation-card'
        });
      } else if (imageInfo.type === 'url') {
        // URL publique (pour la production) - intégrer dans le HTML
        imageUrl = imageInfo.value;
      } else {
        console.warn('⚠️ Image de la carte d\'invitation non trouvée. Email envoyé sans pièce jointe.');
      }
    } else {
      console.warn('⚠️ Image de la carte d\'invitation non trouvée. Email envoyé sans pièce jointe.');
    }

    // Données du mariage (depuis constants.ts ou variables d'environnement)
    const weddingDate = process.env.WEDDING_DATE || '2026-02-13T09:30:00';
    const weddingLocation = process.env.WEDDING_LOCATION || 'Résidence Hôtel HELMA, Angré château, Côte d\'Ivoire';

    // Créer le template HTML
    const htmlContent = createEmailTemplate(
      guest.name,
      weddingDate,
      weddingLocation,
      imageUrl
    );

    // Options de l'email
    const mailOptions = {
      from: `"Guy-Morel & Olive" <${process.env.EMAIL_USER}>`,
      to: guest.email,
      subject: '🎉 Votre Invitation au Mariage - Guy-Morel & Olive',
      html: htmlContent,
      attachments: attachments,
      text: `
        Cher(e) ${guest.name},
        
        Nous sommes ravis de vous confirmer votre invitation à notre mariage !
        
        📅 Date du Mariage: ${new Date(weddingDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
        
        📍 Lieu: ${weddingLocation}
        
        Veuillez trouver ci-joint votre carte d'invitation personnalisée.
        
        Nous avons hâte de célébrer ce jour avec vous !
        
        Avec toute notre affection,
        Guy-Morel & Olive
      `
    };

    // Envoyer l'email
    console.log(`   📤 Envoi de l'email en cours...`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email envoyé avec succès à ${guest.email}`);
    console.log(`   MessageId: ${info.messageId}`);
    console.log(`   Réponse: ${info.response || 'N/A'}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email envoyé avec succès'
    };

  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${guest.email}:`);
    console.error('   Type:', error.constructor.name);
    console.error('   Message:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    if (error.response) {
      console.error('   Réponse serveur:', error.response);
    }
    if (error.responseCode) {
      console.error('   Code réponse:', error.responseCode);
    }
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      message: 'Erreur lors de l\'envoi de l\'email'
    };
  }
};

export default { sendInvitationEmail };

