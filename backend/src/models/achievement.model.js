import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

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
            model: 'users',
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
    tableName: 'achievements',
    timestamps: false
});

// Relationships
User.hasMany(Achievement, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Achievement.belongsTo(User, { foreignKey: 'usuario_id' });

export default Achievement;
