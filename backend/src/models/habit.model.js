import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

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
    tableName: 'habits',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
});

// Relationships
User.hasMany(Habit, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'usuario_id' });

export default Habit;
