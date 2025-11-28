// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Login route
router.get('/login', passport.authenticate('github', { scope: ['user:email'] }));

// Callback route
router.get('/callback', 
  passport.authenticate('github', { failureRedirect: '/api-docs' }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/api-docs');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.redirect('/api-docs');
  });
});

module.exports = router;