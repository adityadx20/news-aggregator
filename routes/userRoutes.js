const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../authorization/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (users) => {
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
    
        const existingUser = users.find((user) => user.email === email);
    
        if (existingUser) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = {
            name,
            email,
            password: hashedPassword,
            preferences: preferences || [],
            readArticles: [],
            favoriteArticles: []
        };
    
        users.push(user);
    
        return res.status(200).json({
            message: 'User created successfully'
        });
    });

// Login Route
    router.post('/login', async (req, res) => {

        const { email, password } = req.body;

        const user = users.find((user) => user.email === email);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

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
    });    

// Get preferences route
    router.get('/preferences', authenticateToken, (req, res) => {

        const user = users.find((user) => user.email === req.user.email);

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        return res.status(200).json({
            preferences: user.preferences
        });
    });

// Put preferences route

    router.put('/preferences', authenticateToken, (req, res) => {

        const { preferences } = req.body;

        if (!Array.isArray(preferences)) {
            return res.status(400).json({
                error: 'Preferences must be an array'
            });
        }

        const user = users.find((user) => user.email === req.user.email);

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        user.preferences = preferences;

        return res.status(200).json({
            message: 'Preferences updated successfully'
        });
    });

return router;

};






