import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

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
    tableName: 'user_metrics',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
});

// Relationships
User.hasOne(UserMetric, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
UserMetric.belongsTo(User, { foreignKey: 'usuario_id' });

export default UserMetric;
