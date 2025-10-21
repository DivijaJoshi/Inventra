const express = require('express');
const { getOrders, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getOrders).post(createOrder);
router.route('/:id/status').patch(updateOrderStatus);
router.route('/:id').delete(deleteOrder);

module.exports = router;