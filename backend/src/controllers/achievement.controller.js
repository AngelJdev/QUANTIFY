import Achievement from '../models/achievement.model.js';
import { ACHIEVEMENTS_CATALOG } from '../config/achievementsCatalog.js';
import { sendSuccess, sendError } from '../utils/response.js';
import moment from 'moment';

export const getAchievements = async (req, res, next) => {
    try {
        const usuario_id = req.user.id;

        // 1. Evaluar automáticamente el catálogo para otorgar nuevos logros al usuario si califica
        for (const item of ACHIEVEMENTS_CATALOG) {
            try {
                if (item.evaluate) {
                    const isEligible = await item.evaluate(usuario_id);
                    if (isEligible) {
                        await Achievement.findOrCreate({
                            where: { usuario_id, titulo: item.titulo },
                            defaults: {
                                descripcion: item.descripcion,
                                mes_logro: moment().format('MMMM YYYY'),
                                icono_url: item.icono_key || item.icono
                            }
                        });
                    }
                }
            } catch (err) {
                console.error(`Error evaluando logro ${item.id}:`, err);
            }
        }

        // 2. Obtener logros desbloqueados del usuario en la BD
        const userAchievements = await Achievement.findAll({
            where: { usuario_id },
            order: [['fecha_obtencion', 'DESC']]
        });

        // Crear mapa para búsqueda rápida por título normalizado
        const unlockedMap = new Map();
        userAchievements.forEach(ach => {
            const cleanTitle = ach.titulo.trim().toLowerCase();
            unlockedMap.set(cleanTitle, ach);
        });

        // 3. Construir el catálogo fusionado con estado desbloqueado vs bloqueado
        const catalog = ACHIEVEMENTS_CATALOG.map(item => {
            const cleanCatalogTitle = item.titulo.trim().toLowerCase();
            // Buscar si coincide con algún logro obtenido por el usuario
            const matchedDb = Array.from(unlockedMap.values()).find(u => {
                const uTitle = u.titulo.trim().toLowerCase();
                return uTitle.includes(item.icono_key) || cleanCatalogTitle.includes(uTitle) || uTitle.includes(cleanCatalogTitle.split(' ')[0]);
            }) || unlockedMap.get(cleanCatalogTitle);

            const isUnlocked = Boolean(matchedDb);

            return {
                id: item.id,
                titulo: item.titulo,
                descripcion: item.descripcion,
                requisito: item.requisito,
                categoria: item.categoria,
                rareza: item.rareza,
                icono_key: item.icono_key,
                icono: item.icono,
                unlocked: isUnlocked,
                fecha_obtencion: isUnlocked ? (matchedDb.fecha_obtencion || matchedDb.createdAt) : null,
                mes_logro: isUnlocked ? matchedDb.mes_logro : null
            };
        });

        // Incluir también en el catálogo cualquier logro otorgado dinámicamente que no estuviera en el catálogo estático
        userAchievements.forEach(ach => {
            const existsInCatalog = catalog.some(c => c.unlocked && (c.titulo === ach.titulo || c.titulo.includes(ach.titulo)));
            if (!existsInCatalog) {
                catalog.unshift({
                    id: `db_${ach.id}`,
                    titulo: ach.titulo,
                    descripcion: ach.descripcion || 'Logro especial obtenido en Quantify.',
                    requisito: 'Hito completado en el sistema.',
                    categoria: 'Constancia',
                    rareza: 'Épico',
                    icono_key: 'default',
                    icono: ach.icono_url || '🏆',
                    unlocked: true,
                    fecha_obtencion: ach.fecha_obtencion,
                    mes_logro: ach.mes_logro
                });
            }
        });

        const unlockedCount = catalog.filter(c => c.unlocked).length;

        return sendSuccess(res, 200, 'Logros recuperados', { 
            achievements: userAchievements,
            catalog,
            unlockedCount,
            totalCatalogCount: catalog.length
        });
    } catch (error) {
        next(error);
    }
};

export const awardAchievement = async (usuario_id, titulo, descripcion, icono) => {
    try {
        const [achievement, created] = await Achievement.findOrCreate({
            where: { usuario_id, titulo },
            defaults: {
                descripcion,
                mes_logro: moment().format('MMMM YYYY'),
                icono_url: icono
            }
        });
        return { achievement, created };
    } catch (error) {
        console.error('Error awarding achievement:', error);
    }
};

