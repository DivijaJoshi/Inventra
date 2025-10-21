const express = require('express');
const { getProducts, createProduct, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getProducts).post(createProduct);
router.route('/lowstock').get(getLowStockProducts);
router.route('/:id').patch(updateProduct).delete(deleteProduct);

module.exports = router;