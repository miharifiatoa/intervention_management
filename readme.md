# Instructions de déploiement - Application Gestion Interventions

## 📁 Structure des dossiers à créer

```
gestion-interventions/
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── models/
│   ├── index.js
│   ├── User.js
│   ├── Client.js
│   └── Intervention.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   └── technicien.js
├── scripts/
│   └── init.js
├── views/
│   ├── auth/
│   │   └── login.ejs
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── interventions.ejs
│   │   ├── nouvelle-intervention.ejs
│   │   ├── techniciens.ejs
│   │   └── clients.ejs
│   └── technicien/
│       ├── dashboard.ejs
│       └── intervention-detail.ejs
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── .env
├── .env.example
├── .gitignore
├── server.js
├── package.json
├── README.md
├── Dockerfile
└── docker-compose.yml
```

## 🚀 Étapes d'installation

### 1. Créer le projet
```bash
mkdir gestion-interventions
cd gestion-interventions
```

### 2. Initialiser npm
```bash
npm init -y
```

### 3. Installer les dépendances
```bash
npm install express sequelize pg pg-hstore bcryptjs express-session connect-session-sequelize ejs
npm install --save-dev nodemon
```

### 4. Créer la structure des dossiers
```bash
mkdir -p config middleware models routes scripts views/auth views/admin views/technicien public/css public/js public/images
```

### 5. Configuration PostgreSQL

#### Option A: Installation locale
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS avec Homebrew
brew install postgresql
brew services start postgresql

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE gestion_interventions;
CREATE USER gestion_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE gestion_interventions TO gestion_user;
\q
```

#### Option B: Docker PostgreSQL
```bash
docker run --name postgres-gestion \
  -e POSTGRES_DB=gestion_interventions \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 6. Configuration des variables d'environnement
```bash
# Créer le fichier .env
cp .env.example .env

# Éditer selon votre configuration
nano .env
```

### 7. Fichiers à créer manuellement

Copiez le contenu des artifacts dans leurs fichiers respectifs :

1. **package.json** - Utilisez le contenu du premier artifact
2. **server.js** - Code du serveur principal
3. **config/database.js** - Configuration base de données
4. **models/** - Tous les modèles (User.js, Client.js, Intervention.js, index.js)
5. **middleware/auth.js** - Middleware d'authentification
6. **routes/** - Toutes les routes (auth.js, admin.js, technicien.js)
7. **views/** - Toutes les vues EJS
8. **scripts/init.js** - Script d'initialisation

### 8. Initialiser la base de données
```bash
node scripts/init.js
```

### 9. Démarrer l'application
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🐳 Déploiement avec Docker

### Option complète avec Docker Compose
```bash
# Créer les fichiers Dockerfile et docker-compose.yml
# Puis démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Build manuel
```bash
# Construire l'image
docker build -t gestion-interventions .

# Lancer avec PostgreSQL externe
docker run -d \
  --name gestion-app \
  -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=gestion_interventions \
  -e DB_USER=postgres \
  -e DB_PASSWORD=password \
  gestion-interventions
```

## 🔧 Configuration de production

### Variables d'environnement importantes
```bash
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_interventions
DB_USER=your_user
DB_PASSWORD=your_secure_password
SESSION_SECRET=your-very-secure-session-secret
```

### Sécurité supplémentaire (recommandé)
```bash
npm install helmet cors express-rate-limit
```

Ajoutez dans server.js :
```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

## 📱 Test de l'application

### Comptes de test disponibles

**Administrateur :**
- Email: admin@test.com
- Mot de passe: admin123

**Techniciens :**
- Email: tech@test.com / Mot de passe: tech123
- Email: jean.dupont@test.com / Mot de passe: tech123
- Email: marie.martin@test.com / Mot de passe: tech123

### Fonctionnalités à tester

#### En tant qu'administrateur :
1. Connexion au dashboard admin
2. Création d'une nouvelle intervention
3. Attribution d'un technicien à une intervention
4. Création d'un nouveau technicien
5. Création d'un nouveau client
6. Visualisation des statistiques

#### En tant que technicien :
1. Connexion au dashboard technicien
2. Visualisation des interventions assignées
3. Commencer une intervention
4. Mettre à jour le rapport d'intervention
5. Terminer une intervention avec rapport complet

## 🚨 Résolution des problèmes courants

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Vérifier la configuration
psql -h localhost -U postgres -d gestion_interventions
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 3000
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)
```

### Erreurs de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📈 Monitoring et maintenance

### Logs de l'application
```bash
# Avec PM2 (recommandé pour la production)
npm install -g pm2
pm2 start server.js --name gestion-interventions
pm2 logs gestion-interventions
pm2 monit
```

### Sauvegarde de la base de données
```bash
# Sauvegarde
pg_dump -h localhost -U postgres gestion_interventions > backup.sql

# Restauration
psql -h localhost -U postgres gestion_interventions < backup.sql
```

## 🎯 Prochaines étapes d'amélioration

1. **API REST** pour applications mobiles
2. **WebSocket** pour notifications temps réel
3. **Upload de fichiers** pour rapports photo
4. **Géolocalisation** des interventions
5. **Système de notifications** email/SMS
6. **Rapports PDF** générés automatiquement
7. **Interface mobile responsive** améliorée
8. **Tests automatisés** (Jest, Supertest)

## 📞 Support technique

L'application est maintenant prête à être déployée ! Toutes les fonctionnalités principales sont implémentées :

✅ Authentification sécurisée
✅ Gestion des rôles (admin/technicien)
✅ CRUD complet pour interventions, clients, techniciens
✅ Dashboard avec statistiques
✅ Interface responsive avec Bootstrap
✅ Base de données PostgreSQL avec Sequelize
✅ Sessions sécurisées
✅ Données de test intégrées

L'application est professionnelle, opérationnelle et prête pour un environnement de production.
