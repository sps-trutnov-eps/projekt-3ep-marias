const express = require('express');

const router = express.Router();

const lobbyController = require('../controllers/lobbyController');

// Odkazy na controller
router.get('/addTable', lobbyController.addTable);

module.exports = router;
