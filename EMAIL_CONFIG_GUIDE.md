# 📧 Guide de Configuration de l'Envoi d'Emails

Ce guide vous explique comment configurer l'envoi automatique d'emails avec la carte d'invitation lorsque les invités s'inscrivent.

## 🔧 Configuration

### 1. Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` du serveur :

```env
# Configuration Email
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-app-password

# Informations du mariage (optionnel, valeurs par défaut utilisées si non définies)
WEDDING_DATE=2026-02-13T09:30:00
WEDDING_LOCATION=Résidence Hôtel HELMA, Angré château, Côte d'Ivoire

# URL publique de l'image de la carte d'invitation (pour la production)
# Si définie, l'image sera intégrée dans le HTML de l'email
# Sinon, le service cherchera le fichier local
INVITATION_CARD_URL=https://votre-site.vercel.app/assets/CARTE%20INVITATION%20DE%20MARIAGE.png
```

### 2. Configuration Gmail (Recommandé)

#### Étape 1 : Activer la validation en 2 étapes
1. Allez sur [Google Account Security](https://myaccount.google.com/security)
2. Activez la "Validation en deux étapes" si ce n'est pas déjà fait

#### Étape 2 : Créer un "App Password"
1. Allez sur [App Passwords](https://myaccount.google.com/apppasswords)
2. Sélectionnez "Mail" comme application
3. Sélectionnez "Autre (nom personnalisé)" comme appareil
4. Entrez "Wedding Backend" comme nom
5. Cliquez sur "Générer"
6. **Copiez le mot de passe généré** (16 caractères sans espaces)
7. Utilisez ce mot de passe dans `EMAIL_PASSWORD` (pas votre mot de passe Gmail normal)

### 3. Configuration Outlook/Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=votre-email@outlook.com
EMAIL_PASSWORD=votre-mot-de-passe
```

### 4. Configuration avec un autre service SMTP

Si vous utilisez un autre service (SendGrid, Mailgun, etc.) :

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.votre-service.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre-email
EMAIL_PASSWORD=votre-mot-de-passe
```

Puis modifiez `server/services/emailService.js` pour utiliser ces paramètres :

```javascript
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

## 📋 Fonctionnalités

### Ce qui est envoyé par email :

1. **Sujet** : "🎉 Votre Invitation au Mariage - Guy-Morel & Olive"
2. **Contenu HTML** :
   - Message de bienvenue personnalisé avec le nom de l'invité
   - Date du mariage clairement affichée (format français)
   - Lieu du mariage
   - Message personnalisé
   - Image de la carte d'invitation (intégrée dans le HTML si URL publique, ou en pièce jointe si fichier local)
3. **Pièce jointe** : La carte d'invitation (`CARTE INVITATION DE MARIAGE.png`) - uniquement si fichier local disponible

### Format de la date

La date est formatée en français :
- Exemple : "vendredi 13 février 2026 à 09:30"

## 🚀 Déploiement

### Sur Railway

1. Allez dans les **Variables d'environnement** de votre projet Railway
2. Ajoutez les variables `EMAIL_USER` et `EMAIL_PASSWORD`
3. Redéployez votre application

### Sur Vercel (si backend sur Vercel)

1. Allez dans **Settings > Environment Variables**
2. Ajoutez les variables nécessaires
3. Redéployez

## ⚠️ Notes importantes

- **L'envoi d'email est non-bloquant** : Si l'email échoue, l'invité est quand même créé dans la base de données
- **L'image doit être accessible** : 
  - En **production** : Définissez `INVITATION_CARD_URL` avec l'URL publique de l'image (ex: `https://votre-site.vercel.app/assets/CARTE%20INVITATION%20DE%20MARIAGE.png`)
  - En **développement local** : Le service cherche automatiquement l'image dans `public/assets/CARTE INVITATION DE MARIAGE.png`
- **En cas d'erreur** : Les erreurs sont loggées dans la console mais n'empêchent pas la création de l'invité
- **Format de l'image** : Si vous utilisez une URL, encodez les espaces avec `%20` dans l'URL

## 🧪 Test

Pour tester l'envoi d'email :

1. Configurez les variables d'environnement
2. Créez un invité via le formulaire RSVP
3. Vérifiez votre boîte email (et les spams)
4. Vérifiez les logs du serveur pour voir si l'email a été envoyé

## 📝 Exemple de fichier .env

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/wedding

# JWT
JWT_SECRET=votre-secret-jwt-super-securise

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=mariage.guy.olive@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# Mariage (optionnel)
WEDDING_DATE=2026-02-13T09:30:00
WEDDING_LOCATION=Résidence Hôtel HELMA, Angré château, Côte d'Ivoire

# URL publique de l'image (pour la production sur Railway/Vercel)
INVITATION_CARD_URL=https://votre-site.vercel.app/assets/CARTE%20INVITATION%20DE%20MARIAGE.png
```

