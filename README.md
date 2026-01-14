# Backend API - Wedding Platform

Backend Node.js avec Express et MongoDB pour la plateforme de mariage.

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- MongoDB (local ou MongoDB Atlas)

## 🚀 Installation

1. **Installer les dépendances :**
```bash
cd server
npm install
```

2. **Configurer les variables d'environnement :**
Créer un fichier `.env` dans le dossier `server/` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wedding-db
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
ADMIN_EMAIL=admin@wedding.com
ADMIN_PASSWORD=admin123
```

3. **Démarrer MongoDB :**
Assurez-vous que MongoDB est en cours d'exécution.

4. **Créer le compte admin par défaut :**
```bash
node scripts/initAdmin.js
```

5. **Démarrer le serveur :**
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:5000`

## 📚 API Routes

### Invités (Guests)

- `POST /api/guests` - Créer un nouvel invité (RSVP) - **Public**
- `GET /api/guests` - Récupérer tous les invités - **Admin**
- `GET /api/guests/stats` - Récupérer les statistiques - **Admin**
- `GET /api/guests/:id` - Récupérer un invité par ID - **Admin**
- `PUT /api/guests/:id` - Mettre à jour un invité - **Admin**
- `DELETE /api/guests/:id` - Supprimer un invité - **Admin**

### Authentification

- `POST /api/auth/register` - Créer un compte admin - **Public** (devrait être protégé en production)
- `POST /api/auth/login` - Authentifier un admin - **Public**
- `GET /api/auth/me` - Récupérer l'utilisateur connecté - **Private**

## 🔐 Authentification

Les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

Le token est retourné lors de la connexion (`/api/auth/login`).

## 📝 Exemples d'utilisation

### Créer un invité (RSVP)
```bash
POST /api/guests
Content-Type: application/json

{
  "name": "Mr & Mme Sylla",
  "email": "sylla@example.com",
  "status": "confirmed",
  "plusOne": true,
  "message": "Merci pour l'invitation!"
}
```

### Connexion admin
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@wedding.com",
  "password": "admin123"
}
```

### Récupérer tous les invités (avec authentification)
```bash
GET /api/guests
Authorization: Bearer <token>
```

## 🗂️ Structure du projet

```
server/
├── config/
│   └── database.js       # Configuration MongoDB
├── middleware/
│   └── auth.js           # Middleware d'authentification
├── models/
│   ├── Guest.js          # Modèle Mongoose pour les invités
│   └── User.js           # Modèle Mongoose pour les admins
├── routes/
│   ├── guestRoutes.js    # Routes pour les invités
│   └── authRoutes.js     # Routes d'authentification
├── scripts/
│   └── initAdmin.js      # Script d'initialisation admin
├── server.js             # Point d'entrée du serveur
└── package.json
```

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Authentification JWT pour les routes protégées
- Validation des données d'entrée
- Gestion des erreurs centralisée

## 📦 Dépendances principales

- **express** - Framework web
- **mongoose** - ODM pour MongoDB
- **cors** - Gestion CORS
- **bcryptjs** - Hashage des mots de passe
- **jsonwebtoken** - Génération de tokens JWT
- **dotenv** - Gestion des variables d'environnement


