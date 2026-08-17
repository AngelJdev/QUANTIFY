import { default as sequelize } from './backend/src/config/db.mysql.js';
import User from './backend/src/models/user.model.js';
import Habit from './backend/src/models/habit.model.js';
import Achievement from './backend/src/models/achievement.model.js';
import UserMetric from './backend/src/models/userMetric.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const MongoUser = (await import('./backend/src/models/nosql/user.nosql.js')).default;
        
        await sequelize.authenticate();
        const users = await User.findAll({ where: { rol: { [sequelize.Sequelize.Op.ne]: 0 } } });
        console.log(`Borrando ${users.length} cuentas no admin...`);
        for (let u of users) {
             console.log("Borrando "+u.email);
            // Disable individualHooks to prevent trying to sync to socket/Mongo complex logic
            // Since we'll manually clean Mongo.
             await Habit.destroy({ where: { usuario_id: u.id } });
             await Achievement.destroy({ where: { usuario_id: u.id } });
             await UserMetric.destroy({ where: { usuario_id: u.id } });
             await MongoUser.deleteOne({ sql_id: u.id });
             await u.destroy();
        }
        
        // Limpiamos los logs (Mongo) de esos usuarios
        const Log = (await import('./backend/src/models/log.model.js')).default;
        for (let u of users) {
            await Log.deleteMany({ usuario_id: u.id });
        }
        
        console.log('✅ Listo.');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
