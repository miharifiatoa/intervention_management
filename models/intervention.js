import { Sequelize, DataTypes } from 'sequelize';

export default function InterventionModel(sequelize) {
  const Intervention = sequelize.define('Intervention', {
    titre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('en_attente', 'en_cours', 'terminee', 'annulee'),
      defaultValue: 'en_attente'
    },
    priorite: {
      type: DataTypes.ENUM('basse', 'normale', 'haute', 'urgente'),
      defaultValue: 'normale'
    },
    date_prevue: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    probleme_trouve: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    intervention_effectuee: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    commentaires: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    technicien_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  return Intervention;
}
