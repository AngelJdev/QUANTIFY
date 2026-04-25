import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import MongoBitacora from '../../NoSQL/models/bitacora.nosql.js';

const Bitacora = sequelize.define('Bitacora', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    operacion: {
        type: DataTypes.ENUM('INSERT', 'DELETE'),
        allowNull: false,
    },
    ip: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fecha_hora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Bitacora',
    timestamps: false,
    hooks: {
        afterCreate: async (entry) => {
            try {
                await MongoBitacora.create({
                    sql_id: entry.id,
                    operacion: entry.operacion,
                    ip: entry.ip,
                    descripcion: entry.descripcion,
                    fecha_hora: entry.fecha_hora
                });
            } catch (err) { console.error('Error syncing Bitacora to Mongo:', err); }
        }
    }
});

export default Bitacora;
