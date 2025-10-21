const express = require('express');
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getSuppliers).post(createSupplier);
router.route('/:id').patch(updateSupplier).delete(deleteSupplier);

module.exports = router;