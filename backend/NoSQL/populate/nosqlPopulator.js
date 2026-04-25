/**
 * NoSQL Populator - Inserts users directly into MongoDB without touching MySQL.
 * Demonstrates MongoDB's independent write capability.
 */
import MongoUser from '../models/user.nosql.js';
import MongoUserMetric from '../models/userMetric.nosql.js';
import { generateBatch } from '../../utils/dataGenerator.js';

const BATCH_SIZE = 5000;

/**
 * Generates a unique base ID using timestamp + random offset to avoid collisions
 * between multiple test executions.
 */
function getUniqueSqlIdBase() {
    // Use high range (100M+) with timestamp component for uniqueness
    return 100_000_000 + Math.floor(Math.random() * 800_000_000);
}

export async function populateNoSQL(config) {
    const cantidad = config.cantidad;
    const timestamp = Date.now();
    const baseSqlId = getUniqueSqlIdBase();

    let totalInserted = 0;
    const startTime = Date.now();

    for (let offset = 0; offset < cantidad; offset += BATCH_SIZE) {
        const batchCount = Math.min(BATCH_SIZE, cantidad - offset);
        const batch = generateBatch(config, 'nosql', timestamp, offset, batchCount);

        // Prepare MongoDB user documents
        const mongoUsers = batch.map((b, i) => ({
            sql_id: baseSqlId + offset + i,
            nombre: b.userData.nombre,
            username: b.userData.username,
            email: b.userData.email,
            rol: 1,
            pais: b.userData.pais,
            current_streak: 0,
            max_streak: 0,
            fecha_creacion: new Date()
        }));

        const insertedUsers = await MongoUser.insertMany(mongoUsers, { ordered: false });

        // Prepare and insert UserMetrics
        const mongoMetrics = insertedUsers.map((u, i) => ({
            sql_id: baseSqlId + offset + i + 1_000_000_000, // Separate range for metrics
            usuario_id: u.sql_id,
            edad: batch[i].metricData.edad,
            peso: batch[i].metricData.peso,
            estatura: batch[i].metricData.estatura,
            genero: batch[i].metricData.genero,
            nivel_actividad: batch[i].metricData.nivel_actividad,
            discapacidad: batch[i].metricData.discapacidad,
            ocupacion: batch[i].metricData.ocupacion,
            fecha_creacion: new Date()
        }));

        await MongoUserMetric.insertMany(mongoMetrics, { ordered: false });

        totalInserted += batchCount;
        const pct = Math.round((totalInserted / cantidad) * 100);
        if (pct % 10 === 0 || totalInserted === cantidad) {
            console.log(`  [NoSQL] Progreso: ${totalInserted}/${cantidad} (${pct}%)`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return { inserted: totalInserted, timeSeconds: elapsed };
}

export async function deletePopulatedNoSQL() {
    const startTime = Date.now();

    // Find all nosql-populated user sql_ids first for metric cleanup
    const userIds = (await MongoUser.find(
        { email: { $regex: 'nosql_.*@quantify-pop\\.test$' } },
        { sql_id: 1 }
    ).lean()).map(u => u.sql_id);

    // Delete metrics linked to those users
    await MongoUserMetric.deleteMany({ usuario_id: { $in: userIds } });

    // Delete the users
    const result = await MongoUser.deleteMany({ email: { $regex: 'nosql_.*@quantify-pop\\.test$' } });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return { deleted: result.deletedCount, timeSeconds: elapsed };
}
