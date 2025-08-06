import sequelize from '../config/database.js';
     import UserModel from './user.js';
     import ClientModel from './client.js';
     import InterventionModel from './intervention.js';

     const User = UserModel(sequelize);
     const Client = ClientModel(sequelize);
     const Intervention = InterventionModel(sequelize);

     // Définir les relations
     User.hasMany(Intervention, { foreignKey: 'technicien_id', as: 'technicien' });
     Client.hasMany(Intervention, { foreignKey: 'client_id', as: 'client' });
     Intervention.belongsTo(User, { foreignKey: 'technicien_id', as: 'technicien' });
     Intervention.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

     export { sequelize, User, Client, Intervention };
