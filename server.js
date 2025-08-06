import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import SequelizeStoreConstructor from 'connect-session-sequelize';
import expressEjsLayouts from 'express-ejs-layouts';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import technicienRoutes from './routes/technicien.js';
import { setLocals, requireAuth, requireAdmin } from './middleware/auth.js';
import { User } from './models/index.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vérification des variables d'environnement critiques
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && process.env[envVar] !== '') {
    console.error(`❌ Variable d'environnement ${envVar} manquante dans .env`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS et layouts
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressEjsLayouts);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Configuration des sessions
const SequelizeStore = SequelizeStoreConstructor(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'intervention-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));
app.use(setLocals);

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/technicien', technicienRoutes);

// Route racine
app.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/technicien/dashboard');
    }
  }
  res.redirect('/auth/login');
});

// Initialisation de la base de données et démarrage du serveur
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie.');

    // Synchroniser les modèles sans recréer les tables
    await sequelize.sync();
    console.log('✅ Synchronisation des modèles terminée.');

    await sessionStore.sync();
    console.log('✅ Synchronisation du store de sessions terminée.');

    // Vérifier si l'admin existe
    if (process.env.NODE_ENV !== 'production') {
      const adminExists = await User.findOne({ where: { email: 'admin@techzone.com' } });
      if (!adminExists) {
        const { initializeDatabase } = await import('./scripts/init.js');
        await initializeDatabase();
        console.log('✅ Données de test initialisées.');
      } else {
        console.log('ℹ️ Admin déjà présent, initialisation ignorée.');
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📱 Application accessible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

startServer();
