const express = require('express');
const { getDashboardAnalytics, getAIInsights, getSmartInsights, getRoleBasedInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.post('/ai-insights', getAIInsights);
router.get('/report/:reportType', require('../controllers/analyticsController').generateInventoryReport);
router.post('/predict-demand', require('../controllers/analyticsController').predictDemand);
router.get('/smart-insights', getSmartInsights);
router.get('/role-insights/:role', getRoleBasedInsights);

module.exports = router;