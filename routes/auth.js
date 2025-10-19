const express = require('express');
const router = express.Router();
const passport = require('../auth');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, ctrl.createUser);
router.put('/:id', isAuthenticated, ctrl.updateUser);
router.delete('/:id', isAuthenticated, ctrl.deleteUser);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Login exitoso
    res.redirect('/dashboard'); // o ruta de tu app
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
