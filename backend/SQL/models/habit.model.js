import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

import MongoHabit from '../../NoSQL/models/habit.nosql.js';

const Habit = sequelize.define('Habit', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tipo_medicion: {
        type: DataTypes.ENUM('BOOLEANO', 'NUMERICO', 'TIEMPO'),
        allowNull: false,
        defaultValue: 'BOOLEANO'
    },
    meta_diaria: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    unidad: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    frecuencia: {
        type: DataTypes.ENUM('DIARIO', 'SEMANAL', 'PERSONALIZADO'),
        defaultValue: 'DIARIO'
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    duracion_tipo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'Habits',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
        afterCreate: async (habit) => {
            try {
                await MongoHabit.create({
                    sql_id: habit.id,
                    usuario_id: habit.usuario_id,
                    nombre: habit.nombre,
                    descripcion: habit.descripcion,
                    tipo_medicion: habit.tipo_medicion,
                    meta_diaria: habit.meta_diaria,
                    unidad: habit.unidad,
                    frecuencia: habit.frecuencia,
                    fecha_fin: habit.fecha_fin,
                    duracion_tipo: habit.duracion_tipo,
                    activo: habit.activo,
                    fecha_creacion: habit.fecha_creacion
                });
            } catch (err) { console.error('Error syncing Habit to Mongo:', err); }
        },
        afterUpdate: async (habit) => {
            try {
                await MongoHabit.findOneAndUpdate(
                    { sql_id: habit.id },
                    {
                        nombre: habit.nombre,
                        descripcion: habit.descripcion,
                        tipo_medicion: habit.tipo_medicion,
                        meta_diaria: habit.meta_diaria,
                        unidad: habit.unidad,
                        frecuencia: habit.frecuencia,
                        fecha_fin: habit.fecha_fin,
                        duracion_tipo: habit.duracion_tipo,
                        activo: habit.activo
                    },
                    { upsert: true }
                );
            } catch (err) { console.error('Error syncing Habit update to Mongo:', err); }
        },
        afterDestroy: async (habit) => {
            try {
                await MongoHabit.findOneAndDelete({ sql_id: habit.id });
            } catch (err) { console.error('Error syncing Habit delete to Mongo:', err); }
        }
    }
});

// Relationships
User.hasMany(Habit, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'usuario_id' });

export default Habit;
