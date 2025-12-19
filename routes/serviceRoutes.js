const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { grabService, submitService } = require('../controllers/serviceController');
router.post('/grab', auth, grabService);
router.post('/submit/:orderId', auth, submitService);
module.exports = router;
