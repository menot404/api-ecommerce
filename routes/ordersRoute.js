const express = require('express');
const {
    getAllOrder,
    createOrder,
    getOrderById,
    updateStatus,
    deleteOrder,
    getOrderOfUser
} = require('../controllers/ordersCon');

const router = express.Router();

// Les routes
router.get('/', getAllOrder);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id', updateStatus);
router.delete('/:id', deleteOrder);
router.get('/user/:userId', getOrderOfUser);

module.exports = router