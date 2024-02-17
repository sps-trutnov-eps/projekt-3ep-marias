const express = require('express');

const router = express.Router();

const lobbyController = require('../controllers/lobbyController');

// Odkazy na controller
router.get('/addTable', lobbyController.addTable);
router.get('/mixCards', lobbyController.mixCards);

module.exports = router;
