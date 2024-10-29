const express = require('express');
const User = require('../models/User');
const authenticateJWT = require('../middleware/authMiddleware');
const router = express.Router();

// Get profile
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.render('profile', { user, userId: req.user.id });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        res.status(500).send('Server error');
    }
});

// Additional profile routes for updating/deleting profile picture can be added here.

module.exports = router;
