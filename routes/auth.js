import express from 'express';
import { User } from '../models/index.js';

const router = express.Router();

// Page de connexion
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, actif: true } });

    if (!user || !(await user.validatePassword(password))) {
      console.error('❌ Échec de la connexion: Email ou mot de passe incorrect pour', email);
      return res.render('auth/login', { error: 'Email ou mot de passe incorrect' });
    }

    req.session.user = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role
    };

    console.log(`✅ Utilisateur connecté: ${user.nom} (${user.role})`);
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/technicien/dashboard');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.render('auth/login', { error: 'Erreur de connexion' });
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Erreur lors de la déconnexion:', err);
    }
    res.redirect('/auth/login');
  });
});

export default router;
