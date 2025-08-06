import { sequelize, User } from '../models/index.js';

export async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');

    // Synchroniser les modèles (force: true pour recréer les tables)
    await sequelize.sync({ force: true });
    console.log('✅ Tables créées avec succès');

    // Créer un admin par défaut
    const admin = await User.create({
      nom: 'Administrateur Principal',
      email: 'admin@techzone.com',
      password: 'techzone@2025',
      role: 'admin',
      actif: true
    });
    console.log('✅ Compte admin créé: admin@techzone.com');

    console.log('🎉 Initialisation terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l’initialisation:', error);
    throw error;
  }
}
