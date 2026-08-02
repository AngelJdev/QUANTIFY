import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import 'mysql2'; // Required statically for Vercel Serverless File Trace

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'quantify_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the MySQL database:', error);
    // process.exit(1); -> Removed to prevent silent Vercel crashes
  }
};

export default sequelize;
