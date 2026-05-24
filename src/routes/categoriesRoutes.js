const express = require('express');
const {getAllCategories, getCategoryById, createCategory, updateCategory, deleteProduct} = require('../controllers/categoriesCon');

const router = express.Router();

// Route pour Lister toutes les catégories
router.get('/', getAllCategories);
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteProduct);

module.exports = router;