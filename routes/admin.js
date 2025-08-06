import express from 'express';
import { User, Client, Intervention } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware pour authentification et rôle admin
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard admin
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalInterventions: await Intervention.count(),
      interventionsEnAttente: await Intervention.count({ where: { status: 'en_attente' } }),
      interventionsEnCours: await Intervention.count({ where: { status: 'en_cours' } }),
      totalTechniciens: await User.count({ where: { role: 'technicien', actif: true } }),
      totalClients: await Client.count()
    };

    const interventionsRecentes = await Intervention.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Client, as: 'client' },
        { model: User, as: 'technicien' }
      ]
    });

    res.render('admin/dashboard', { user: req.session.user, stats, interventions: interventionsRecentes, title: 'Dashboard' });
  } catch (error) {
    console.error('❌ Erreur dans /admin/dashboard:', error);
    res.status(500).render('error', { user: req.session.user, error: 'Erreur serveur', title: 'Erreur' });
  }
});

// Liste des interventions
router.get('/interventions', async (req, res) => {
  try {
    const interventions = await Intervention.findAll({
      include: [
        { model: Client, as: 'client' },
        { model: User, as: 'technicien' }
      ],
      order: [['createdAt', 'DESC']]
    });
    const techniciens = await User.findAll({
      where: { role: 'technicien', actif: true },
      order: [['nom', 'ASC']]
    });
    res.render('admin/interventions', { user: req.session.user, interventions, techniciens, title: 'Interventions' });
  } catch (error) {
    console.error('❌ Erreur dans /admin/interventions:', error);
    res.status(500).render('error', { user: req.session.user, error: 'Erreur serveur', title: 'Erreur' });
  }
});

// Nouvelle intervention
router.get('/interventions/nouvelle', async (req, res) => {
  try {
    const clients = await Client.findAll({ order: [['nom', 'ASC']] });
    const techniciens = await User.findAll({
      where: { role: 'technicien', actif: true },
      order: [['nom', 'ASC']]
    });
    res.render('admin/nouvelle-intervention', { user: req.session.user, clients, techniciens, title: 'Nouvelle Intervention' });
  } catch (error) {
    console.error('❌ Erreur dans /admin/interventions/nouvelle:', error);
    res.status(500).render('error', { user: req.session.user, error: 'Erreur serveur', title: 'Erreur' });
  }
});

// Créer intervention
router.post('/interventions', async (req, res) => {
  try {
    await Intervention.create(req.body);
    res.redirect('/admin/interventions');
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'intervention:', error);
    const clients = await Client.findAll({ order: [['nom', 'ASC']] });
    const techniciens = await User.findAll({
      where: { role: 'technicien', actif: true },
      order: [['nom', 'ASC']]
    });
    res.render('admin/nouvelle-intervention', {
      user: req.session.user,
      clients,
      techniciens,
      error: 'Erreur lors de la création de l\'intervention',
      title: 'Nouvelle Intervention'
    });
  }
});

// Détails d'une intervention
router.get('/interventions/:id', async (req, res) => {
  try {
    const intervention = await Intervention.findOne({
      where: { id: req.params.id },
      include: [
        { model: Client, as: 'client' },
        { model: User, as: 'technicien' }
      ]
    });
    if (!intervention) {
      return res.status(404).render('error', { user: req.session.user, error: 'Intervention non trouvée', title: 'Erreur' });
    }
    res.render('admin/intervention-detail', { user: req.session.user, intervention, title: 'Détails Intervention' });
  } catch (error) {
    console.error('❌ Erreur dans /admin/interventions/:id:', error);
    res.status(500).render('error', { user: req.session.user, error: 'Erreur serveur', title: 'Erreur' });
  }
});

// Annuler une intervention
router.post('/interventions/:id/annuler', async (req, res) => {
  try {
    await Intervention.update(
      { status: 'annulee' },
      { where: { id: req.params.id } }
    );
    res.redirect('/admin/interventions');
  } catch (error) {
    console.error('❌ Erreur lors de l\'annulation de l\'intervention:', error);
    res.render('admin/interventions', {
      user: req.session.user,
      interventions: await Intervention.findAll({
        include: [{ model: Client, as: 'client' }, { model: User, as: 'technicien' }],
        order: [['createdAt', 'DESC']]
      }),
      techniciens: await User.findAll({ where: { role: 'technicien', actif: true }, order: [['nom', 'ASC']] }),
      error: 'Erreur lors de l\'annulation',
      title: 'Interventions'
    });
  }
});

// Attribuer technicien
router.post('/interventions/:id/attribuer', async (req, res) => {
  try {
    const { technicien_id } = req.body;
    await Intervention.update(
      { technicien_id, status: 'en_cours' },
      { where: { id: req.params.id } }
    );
    res.redirect('/admin/interventions');
  } catch (error) {
    console.error('❌ Erreur lors de l\'attribution du technicien:', error);
    res.render('admin/interventions', {
      user: req.session.user,
      interventions: await Intervention.findAll({
        include: [{ model: Client, as: 'client' }, { model: User, as: 'technicien' }],
        order: [['createdAt', 'DESC']]
      }),
      techniciens: await User.findAll({ where: { role: 'technicien', actif: true }, order: [['nom', 'ASC']] }),
      error: 'Erreur lors de l\'attribution',
      title: 'Interventions'
    });
  }
});

// Gestion des techniciens
router.get('/techniciens', async (req, res) => {
  try {
    const techniciens = await User.findAll({
      where: { role: 'technicien' },
      order: [['nom', 'ASC']]
    });
    res.render('admin/techniciens', { user: req.session.user, techniciens, title: 'Techniciens' });
  } catch (error) {
    console.error('❌ Erreur dans /admin/techniciens:', error);
    res.status(500).render('error', { user: req.session.user, error: 'Erreur serveur', title: 'Erreur' });
  }
});

// Nouveau technicien
router.post('/techniciens', async (req, res) => {
  try {
    await User.create({ ...req.body, role: 'technicien' });
    res.redirect('/admin/techniciens');
  } catch (error) {
    console.error('❌ Erreur lors de la création du technicien:', error);
    res.render('admin/techniciens', {
      user: req.session.user,
      techniciens: await User.findAll({ where: { role: 'technicien' }, order: [['nom', 'ASC']] }),
      error: 'Erreur lors de la création du technicien',
      title: 'Techniciens'
    });
  }
});

// Gestion des clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.findAll({ order: [['nom', 'ASC']] });
    res.render('admin/clients', { user: req.session.user, clients, title: 'Clients' });
  } catch (error) {
    console.error('❌ Erreur dans /admin/clients:', error);
    res.status(500).render('error', { user: req.session.user, error: 'Erreur serveur', title: 'Erreur' });
  }
});

// Nouveau client
router.post('/clients', async (req, res) => {
  try {
    const { nom, email, telephone, adresse, latitude, longitude } = req.body;
    await Client.create({
      nom,
      email: email || null,
      telephone: telephone || null,
      adresse: adresse || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });
    res.redirect('/admin/clients');
  } catch (error) {
    console.error('❌ Erreur lors de la création du client:', error);
    res.render('admin/clients', {
      user: req.session.user,
      clients: await Client.findAll({ order: [['nom', 'ASC']] }),
      error: 'Erreur lors de la création du client',
      title: 'Clients'
    });
  }
});

export default router;
