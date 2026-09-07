const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        preferences: {
            type: [String],
            default: []
        },

        readArticles: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },

        favoriteArticles: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);