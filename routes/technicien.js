import express from 'express';
import { User, Client, Intervention } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware pour authentification
router.use(requireAuth);

// Dashboard technicien
router.get('/dashboard', async (req, res) => {
  try {
    const mesInterventions = await Intervention.findAll({
      where: { technicien_id: req.session.user.id },
      include: [{ model: Client, as: 'client' }],
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      total: mesInterventions.length,
      enCours: mesInterventions.filter(i => i.status === 'en_cours').length,
      terminees: mesInterventions.filter(i => i.status === 'terminee').length
    };

    res.render('technicien/dashboard', {
      user: req.session.user,
      interventions: mesInterventions,
      stats
    });
  } catch (error) {
    console.error('❌ Erreur dans /technicien/dashboard:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Détail intervention
router.get('/interventions/:id', async (req, res) => {
  try {
    const intervention = await Intervention.findOne({
      where: {
        id: req.params.id,
        technicien_id: req.session.user.id
      },
      include: [{ model: Client, as: 'client' }]
    });

    if (!intervention) {
      console.error(`❌ Intervention non trouvée: ID ${req.params.id} pour technicien ${req.session.user.id}`);
      return res.status(404).send('Intervention non trouvée');
    }

    res.render('technicien/intervention-detail', {
      user: req.session.user,
      intervention
    });
  } catch (error) {
    console.error('❌ Erreur dans /technicien/interventions/:id:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Commencer intervention
router.post('/interventions/:id/commencer', async (req, res) => {
  try {
    const [updated] = await Intervention.update(
      {
        status: 'en_cours',
        date_debut: new Date()
      },
      {
        where: {
          id: req.params.id,
          technicien_id: req.session.user.id
        }
      }
    );

    if (!updated) {
      console.error(`❌ Échec de la mise à jour: Intervention ${req.params.id} non trouvée ou non autorisée`);
      return res.status(404).send('Intervention non trouvée');
    }

    res.redirect(`/technicien/interventions/${req.params.id}`);
  } catch (error) {
    console.error('❌ Erreur lors du démarrage de l\'intervention:', error);
    res.status(500).send('Erreur lors de la mise à jour');
  }
});

// Terminer intervention
router.post('/interventions/:id/terminer', async (req, res) => {
  try {
    const { probleme_trouve, intervention_effectuee, commentaires } = req.body;

    const [updated] = await Intervention.update(
      {
        status: 'terminee',
        date_fin: new Date(),
        probleme_trouve,
        intervention_effectuee,
        commentaires
      },
      {
        where: {
          id: req.params.id,
          technicien_id: req.session.user.id
        }
      }
    );

    if (!updated) {
      console.error(`❌ Échec de la finalisation: Intervention ${req.params.id} non trouvée ou non autorisée`);
      return res.status(404).send('Intervention non trouvée');
    }

    res.redirect('/technicien/dashboard');
  } catch (error) {
    console.error('❌ Erreur lors de la finalisation de l\'intervention:', error);
    res.status(500).send('Erreur lors de la finalisation');
  }
});

// Mettre à jour intervention
router.post('/interventions/:id/update', async (req, res) => {
  try {
    const { probleme_trouve, intervention_effectuee, commentaires } = req.body;

    const [updated] = await Intervention.update(
      {
        probleme_trouve,
        intervention_effectuee,
        commentaires
      },
      {
        where: {
          id: req.params.id,
          technicien_id: req.session.user.id
        }
      }
    );

    if (!updated) {
      console.error(`❌ Échec de la mise à jour: Intervention ${req.params.id} non trouvée ou non autorisée`);
      return res.status(404).send('Intervention non trouvée');
    }

    res.redirect(`/technicien/interventions/${req.params.id}`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'intervention:', error);
    res.status(500).send('Erreur lors de la mise à jour');
  }
});

export default router;
