/**
 * SQL Populator - Inserts users into MySQL with bulk operations.
 * Skips Sequelize hooks for performance and manually syncs to MongoDB.
 */
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import UserMetric from '../models/userMetric.model.js';
import MongoUser from '../../NoSQL/models/user.nosql.js';
import MongoUserMetric from '../../NoSQL/models/userMetric.nosql.js';
import { generateBatch } from '../../utils/dataGenerator.js';

const BATCH_SIZE = 1000;

export async function populateSQL(config) {
    const cantidad = config.cantidad;
    const timestamp = Date.now();

    // Pre-hash password and security phrase once for all users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Pop2026!', salt);
    const hashedPhrase = await bcrypt.hash('frase_segura_poblacion_test', salt);

    let totalInserted = 0;
    const startTime = Date.now();

    for (let offset = 0; offset < cantidad; offset += BATCH_SIZE) {
        const batchCount = Math.min(BATCH_SIZE, cantidad - offset);
        const batch = generateBatch(config, 'sql', timestamp, offset, batchCount);

        // Prepare SQL user records
        const sqlUsers = batch.map(b => ({
            nombre: b.userData.nombre,
            username: b.userData.username,
            email: b.userData.email,
            password_hash: hashedPassword,
            security_phrase_hash: hashedPhrase,
            pais: b.userData.pais,
            rol: 1
        }));

        // Bulk insert into MySQL WITHOUT hooks (performance)
        const createdUsers = await User.bulkCreate(sqlUsers, {
            hooks: false,
            returning: true
        });

        // Sync to MongoDB Users
        const mongoUsers = createdUsers.map(u => ({
            sql_id: u.id,
            nombre: u.nombre,
            username: u.username,
            email: u.email,
            rol: u.rol,
            pais: u.pais,
            current_streak: 0,
            max_streak: 0,
            fecha_creacion: u.fecha_creacion
        }));
        await MongoUser.insertMany(mongoUsers, { ordered: false });

        // Prepare and insert UserMetrics into MySQL
        const sqlMetrics = createdUsers.map((u, i) => ({
            usuario_id: u.id,
            edad: batch[i].metricData.edad,
            peso: batch[i].metricData.peso,
            estatura: batch[i].metricData.estatura,
            genero: batch[i].metricData.genero,
            nivel_actividad: batch[i].metricData.nivel_actividad,
            discapacidad: batch[i].metricData.discapacidad,
            ocupacion: batch[i].metricData.ocupacion
        }));
        const createdMetrics = await UserMetric.bulkCreate(sqlMetrics, {
            hooks: false,
            returning: true
        });

        // Sync UserMetrics to MongoDB
        const mongoMetrics = createdMetrics.map(m => ({
            sql_id: m.id,
            usuario_id: m.usuario_id,
            edad: m.edad,
            peso: m.peso,
            estatura: m.estatura,
            genero: m.genero,
            nivel_actividad: m.nivel_actividad,
            discapacidad: m.discapacidad,
            ocupacion: m.ocupacion,
            fecha_creacion: m.fecha_creacion
        }));
        await MongoUserMetric.insertMany(mongoMetrics, { ordered: false });

        totalInserted += batchCount;
        const pct = Math.round((totalInserted / cantidad) * 100);
        if (pct % 10 === 0 || totalInserted === cantidad) {
            console.log(`  [SQL] Progreso: ${totalInserted}/${cantidad} (${pct}%)`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return { inserted: totalInserted, timeSeconds: elapsed };
}

export async function deletePopulatedSQL() {
    const startTime = Date.now();

    const { default: sequelize } = await import('../config/db.mysql.js');

    // Count SQL populated users
    const [[countResult]] = await sequelize.query(
        `SELECT COUNT(*) as total FROM Users WHERE email LIKE '%@quantify-pop.test'`
    );
    const total = countResult?.total || 0;

    // Delete UserMetrics for populated users first (FK constraint)
    await sequelize.query(`
        DELETE um FROM UserMetrics um
        INNER JOIN Users u ON um.usuario_id = u.id
        WHERE u.email LIKE '%@quantify-pop.test'
    `);

    // Delete Users from MySQL
    await sequelize.query(`DELETE FROM Users WHERE email LIKE '%@quantify-pop.test'`);

    // Clean MongoDB mirrors (all sql_ prefixed population emails)
    await MongoUserMetric.deleteMany({
        usuario_id: { $in: (await MongoUser.find(
            { email: { $regex: 'sql_.*@quantify-pop\\.test$' } },
            { sql_id: 1 }
        ).lean()).map(u => u.sql_id) }
    });
    await MongoUser.deleteMany({ email: { $regex: 'sql_.*@quantify-pop\\.test$' } });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return { deleted: total, timeSeconds: elapsed };
}
