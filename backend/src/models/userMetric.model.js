import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

import MongoUserMetric from './nosql/userMetric.nosql.js';

const UserMetric = sequelize.define('UserMetric', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    edad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    peso: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    estatura: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    genero: {
        type: DataTypes.ENUM('MASCULINO', 'FEMENINO', 'OTRO'),
        allowNull: false,
    },
    nivel_actividad: {
        type: DataTypes.ENUM('SEDENTARIO', 'LIGERO', 'MODERADO', 'ACTIVO', 'MUY_ACTIVO'),
        allowNull: false,
    }
}, {
    tableName: 'UserMetrics',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
        afterCreate: async (metric) => {
            try {
                await MongoUserMetric.create({
                    sql_id: metric.id,
                    usuario_id: metric.usuario_id,
                    edad: metric.edad,
                    peso: metric.peso,
                    estatura: metric.estatura,
                    genero: metric.genero,
                    nivel_actividad: metric.nivel_actividad,
                    fecha_creacion: metric.fecha_creacion
                });
            } catch (err) { console.error('Error syncing UserMetric to Mongo:', err); }
        },
        afterUpdate: async (metric) => {
            try {
                await MongoUserMetric.findOneAndUpdate(
                    { sql_id: metric.id },
                    {
                        edad: metric.edad,
                        peso: metric.peso,
                        estatura: metric.estatura,
                        genero: metric.genero,
                        nivel_actividad: metric.nivel_actividad
                    },
                    { upsert: true }
                );
            } catch (err) { console.error('Error syncing UserMetric update to Mongo:', err); }
        },
        afterDestroy: async (metric) => {
            try {
                await MongoUserMetric.findOneAndDelete({ sql_id: metric.id });
            } catch (err) { console.error('Error syncing UserMetric delete to Mongo:', err); }
        }
    }
});

// Relationships
User.hasOne(UserMetric, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
UserMetric.belongsTo(User, { foreignKey: 'usuario_id' });

export default UserMetric;
