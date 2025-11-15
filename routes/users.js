// routes/users.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getSingle);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);
router.post('/', ctrl.createUser);
module.exports = router;
