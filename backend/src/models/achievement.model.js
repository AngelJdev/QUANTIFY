import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

import MongoAchievement from './nosql/achievement.nosql.js';

const Achievement = sequelize.define('Achievement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    mes_logro: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    icono_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha_obtencion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Achievements',
    timestamps: false,
    hooks: {
        afterCreate: async (ach) => {
            try {
                await MongoAchievement.create({
                    sql_id: ach.id,
                    usuario_id: ach.usuario_id,
                    titulo: ach.titulo,
                    descripcion: ach.descripcion,
                    mes_logro: ach.mes_logro,
                    icono_url: ach.icono_url,
                    fecha_obtencion: ach.fecha_obtencion
                });
            } catch (err) { console.error('Error syncing Achievement to Mongo:', err); }
        },
        afterUpdate: async (ach) => {
            try {
                await MongoAchievement.findOneAndUpdate(
                    { sql_id: ach.id },
                    {
                        titulo: ach.titulo,
                        descripcion: ach.descripcion,
                        mes_logro: ach.mes_logro,
                        icono_url: ach.icono_url
                    },
                    { upsert: true }
                );
            } catch (err) { console.error('Error syncing Achievement update to Mongo:', err); }
        },
        afterDestroy: async (ach) => {
            try {
                await MongoAchievement.findOneAndDelete({ sql_id: ach.id });
            } catch (err) { console.error('Error syncing Achievement delete to Mongo:', err); }
        }
    }
});

// Relationships
User.hasMany(Achievement, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Achievement.belongsTo(User, { foreignKey: 'usuario_id' });

export default Achievement;
