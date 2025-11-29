// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Login route - inicia el flujo OAuth
router.get('/login', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;