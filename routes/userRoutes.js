const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const authenticateToken = require('../authorization/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password, preferences } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: 'Name, email, password are required'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters'
        });
    }

    if (preferences !== undefined && !Array.isArray(preferences)) {
        return res.status(400).json({
            error: 'Preferences must be an array'
        });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            preferences: preferences || [],
            readArticles: [],
            favoriteArticles: []
        });

        return res.status(200).json({
            message: 'User created successfully'
        });

    } catch (error) {
        console.error('Signup error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }

        return res.status(500).json({
            error: 'Failed to create user'
        });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            token
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            error: 'Failed to login'
        });
    }
});


// Get preferences route
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        return res.status(200).json({
            preferences: user.preferences
        });

    } catch (error) {
        console.error('Get preferences error:', error);

        return res.status(500).json({
            error: 'Failed to get preferences'
        });
    }
});


// Put preferences route
router.put('/preferences', authenticateToken, async (req, res) => {
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
        return res.status(400).json({
            error: 'Preferences must be an array'
        });
    }

    try {
        const user = await User.findOne({
            email: req.user.email
        });

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        user.preferences = preferences;

        await user.save();

        return res.status(200).json({
            message: 'Preferences updated successfully'
        });

    } catch (error) {
        console.error('Update preferences error:', error);

        return res.status(500).json({
            error: 'Failed to update preferences'
        });
    }
});

module.exports = router;