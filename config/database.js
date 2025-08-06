import { Sequelize } from 'sequelize';

// Validation des variables d'environnement
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && process.env[envVar] !== '') {
    throw new Error(`❌ Variable d'environnement ${envVar} manquante dans .env`);
  }
}

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

export default sequelize;
