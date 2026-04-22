import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import bcrypt from 'bcryptjs';

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
        type: DataTypes.ENUM('USER', 'ADMIN'),
        defaultValue: 'USER',
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
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
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
