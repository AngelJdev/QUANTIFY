import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

const CommunityPost = sequelize.define('CommunityPost', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    content: {
        type: DataTypes.STRING(600),
        allowNull: false
    },
    visibility: {
        type: DataTypes.ENUM('FRIENDS', 'PUBLIC'),
        allowNull: false,
        defaultValue: 'FRIENDS'
    }
}, {
    tableName: 'CommunityPosts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['user_id', 'created_at'] },
        { fields: ['visibility', 'created_at'] }
    ]
});

const CommunityReaction = sequelize.define('CommunityReaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: CommunityPost, key: 'id' }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    type: {
        type: DataTypes.ENUM('SUPPORT', 'FIRE', 'APPLAUSE'),
        allowNull: false
    }
}, {
    tableName: 'CommunityReactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ unique: true, fields: ['post_id', 'user_id'] }]
});

const CommunityComment = sequelize.define('CommunityComment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: CommunityPost, key: 'id' }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    content: {
        type: DataTypes.STRING(300),
        allowNull: false
    }
}, {
    tableName: 'CommunityComments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['post_id', 'created_at'] },
        { fields: ['user_id'] }
    ]
});

CommunityPost.belongsTo(User, { as: 'author', foreignKey: 'user_id' });
CommunityPost.hasMany(CommunityReaction, { as: 'reactions', foreignKey: 'post_id', onDelete: 'CASCADE' });
CommunityPost.hasMany(CommunityComment, { as: 'comments', foreignKey: 'post_id', onDelete: 'CASCADE' });
CommunityReaction.belongsTo(CommunityPost, { as: 'post', foreignKey: 'post_id' });
CommunityReaction.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
CommunityComment.belongsTo(CommunityPost, { as: 'post', foreignKey: 'post_id' });
CommunityComment.belongsTo(User, { as: 'author', foreignKey: 'user_id' });
User.hasMany(CommunityPost, { as: 'communityPosts', foreignKey: 'user_id' });

export { CommunityPost, CommunityReaction, CommunityComment };
