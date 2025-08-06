import { Sequelize, DataTypes } from 'sequelize';

export default function ClientModel(sequelize) {
  const Client = sequelize.define('Client', {
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true
    },

    adresse: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  });

  return Client;
}
