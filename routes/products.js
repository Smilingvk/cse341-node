// routes/products.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/products');
const { isAuthenticated } = require('../middleware/auth');

// Public routes (GET)
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getSingle);

// Protected routes (POST, PUT, DELETE require authentication)
router.post('/', isAuthenticated, ctrl.createProduct);
router.put('/:id', isAuthenticated, ctrl.updateProduct);
router.delete('/:id', isAuthenticated, ctrl.deleteProduct);

module.exports = router;