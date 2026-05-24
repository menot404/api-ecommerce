const express = require('express');
const {
    getAllProducts,
    getFeaturedProducts,
    createProduct,
    getProductsById,
    updateProduct,
    softDeleteById,
    createReview,
    getProductByCategory
}= require('../controllers/productsCon');

const router = express.Router();

// Route
router.get('/', getAllProducts );
router.post('/', createProduct );
router.get('/featured', getFeaturedProducts );
router.get('/:id', getProductsById );
router.put('/:id', updateProduct );
router.delete('/:id', softDeleteById );
router.post('/:id/reviews', createReview );
router.get('/category/:categoryId', getProductByCategory );

module.exports = router;