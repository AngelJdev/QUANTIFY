import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_one_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    user_two_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    requested_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED'),
        allowNull: false,
        defaultValue: 'PENDING'
    }
}, {
    tableName: 'Friendships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['user_one_id', 'user_two_id'] },
        { fields: ['requested_by_id', 'status'] }
    ],
    validate: {
        usersAreDifferent() {
            if (this.user_one_id === this.user_two_id) {
                throw new Error('Una amistad requiere dos usuarios diferentes.');
            }
        },
        requesterBelongsToPair() {
            if (![this.user_one_id, this.user_two_id].includes(this.requested_by_id)) {
                throw new Error('El solicitante debe pertenecer a la amistad.');
            }
        }
    }
});

Friendship.belongsTo(User, { as: 'userOne', foreignKey: 'user_one_id' });
Friendship.belongsTo(User, { as: 'userTwo', foreignKey: 'user_two_id' });
Friendship.belongsTo(User, { as: 'requestedBy', foreignKey: 'requested_by_id' });

User.hasMany(Friendship, { as: 'friendshipsAsUserOne', foreignKey: 'user_one_id', onDelete: 'CASCADE' });
User.hasMany(Friendship, { as: 'friendshipsAsUserTwo', foreignKey: 'user_two_id', onDelete: 'CASCADE' });

export default Friendship;
