import { DataTypes } from 'sequelize';
import sequelize from '../config/db.mysql.js';
import User from './user.model.js';

const Challenge = sequelize.define('CommunityChallenge', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    title: {
        type: DataTypes.STRING(80),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(240),
        allowNull: true
    },
    target: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: 'avances'
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
    }
}, {
    tableName: 'CommunityChallenges',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['creator_id', 'status'] },
        { fields: ['end_date', 'status'] }
    ]
});

const ChallengeParticipant = sequelize.define('ChallengeParticipant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    challenge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Challenge, key: 'id' }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    invitation_status: {
        type: DataTypes.ENUM('INVITED', 'ACCEPTED'),
        allowNull: false,
        defaultValue: 'INVITED'
    },
    progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'ChallengeParticipants',
    timestamps: true,
    createdAt: 'joined_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['challenge_id', 'user_id'] },
        { fields: ['user_id', 'invitation_status'] }
    ]
});

Challenge.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });
Challenge.hasMany(ChallengeParticipant, {
    as: 'participants',
    foreignKey: 'challenge_id',
    onDelete: 'CASCADE'
});
ChallengeParticipant.belongsTo(Challenge, { as: 'challenge', foreignKey: 'challenge_id' });
ChallengeParticipant.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(Challenge, { as: 'createdCommunityChallenges', foreignKey: 'creator_id' });
User.hasMany(ChallengeParticipant, { as: 'communityChallengeParticipations', foreignKey: 'user_id' });

export { Challenge, ChallengeParticipant };
