const express = require('express');

const router = express.Router();

const accountController = require('../controllers/accountController');

// Odkazy na controller
router.get('/prihlasit', accountController.prihlasit);

module.exports = router;
