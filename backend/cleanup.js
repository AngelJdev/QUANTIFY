import { default as sequelize } from './src/config/db.mysql.js';
import User from './src/models/user.model.js';
import Habit from './src/models/habit.model.js';
import Achievement from './src/models/achievement.model.js';
import UserMetric from './src/models/userMetric.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quantify_db');
        const MongoUser = (await import('./src/models/nosql/user.nosql.js')).default;
        
        await sequelize.authenticate();
        const users = await User.findAll({ where: { rol: { [sequelize.Sequelize.Op.ne]: 0 } } });
        console.log(`Borrando ${users.length} cuentas no admin...`);
        for (let u of users) {
             console.log("Borrando "+u.email);
             await Habit.destroy({ where: { usuario_id: u.id } });
             await Achievement.destroy({ where: { usuario_id: u.id } });
             await UserMetric.destroy({ where: { usuario_id: u.id } });
             await MongoUser.deleteOne({ sql_id: u.id });
             await u.destroy();
        }
        
        const Log = (await import('./src/models/log.model.js')).default;
        for (let u of users) {
            await Log.deleteMany({ usuario_id: u.id });
        }
        
        console.log('✅ Listo.');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
