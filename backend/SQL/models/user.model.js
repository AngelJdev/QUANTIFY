import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import bcrypt from 'bcryptjs';

import MongoUser from '../../NoSQL/models/user.nosql.js';
import UserEvent from '../../NoSQL/models/userEvent.nosql.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-zA-Z0-9]+$/
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rol: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '0=ADMIN, 1=USER, 2=MODERADOR',
    },
    preferencias: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    security_phrase_hash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    current_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    max_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    last_login_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    pais: {
        type: DataTypes.ENUM('México', 'Estados Unidos', 'Colombia', 'Argentina', 'España', 'Chile', 'Perú', 'Brasil', 'Ecuador', 'Venezuela', 'Guatemala', 'Cuba', 'Bolivia', 'Rep. Dominicana', 'Honduras', 'Paraguay', 'El Salvador', 'Costa Rica', 'Panamá', 'Uruguay'),
        defaultValue: 'México',
    }
}, {
    tableName: 'Users',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
        afterCreate: async (user) => {
            try {
                await MongoUser.create({
                    sql_id: user.id,
                    nombre: user.nombre,
                    username: user.username,
                    email: user.email,
                    rol: user.rol,
                    preferencias: user.preferencias,
                    avatar_url: user.avatar_url,
                    current_streak: user.current_streak,
                    max_streak: user.max_streak,
                    last_login_date: user.last_login_date,
                    pais: user.pais,
                    fecha_creacion: user.fecha_creacion
                });

                await UserEvent.create({ type: 'CREATED', userId: user.id });
            } catch (err) { console.error('Error syncing User to Mongo:', err); }
        },
        afterUpdate: async (user) => {
            try {
                await MongoUser.findOneAndUpdate(
                    { sql_id: user.id },
                    {
                        nombre: user.nombre,
                        username: user.username,
                        email: user.email,
                        rol: user.rol,
                        preferencias: user.preferencias,
                        avatar_url: user.avatar_url,
                        current_streak: user.current_streak,
                        max_streak: user.max_streak,
                        last_login_date: user.last_login_date,
                        pais: user.pais
                    },
                    { upsert: true }
                );
            } catch (err) { console.error('Error syncing User update to Mongo:', err); }
        },
        afterDestroy: async (user) => {
            try {
                await MongoUser.findOneAndDelete({ sql_id: user.id });
            } catch (err) { console.error('Error syncing User delete to Mongo:', err); }
        },
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
            if (user.security_phrase_hash) {
                const salt = await bcrypt.genSalt(10);
                user.security_phrase_hash = await bcrypt.hash(user.security_phrase_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
            if (user.changed('security_phrase_hash')) {
                const salt = await bcrypt.genSalt(10);
                user.security_phrase_hash = await bcrypt.hash(user.security_phrase_hash, salt);
            }
        }
    }
});

// Method to verify passwords
User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Method to verify the security/recovery phrase
User.prototype.verifySecurityPhrase = async function (phrase) {
    if (!this.security_phrase_hash) return false;
    return await bcrypt.compare(phrase, this.security_phrase_hash);
};

// Method to return safe info (without password_hash)
User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    return values;
}

export default User;
