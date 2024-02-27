const express = require('express');

const router = express.Router();

const lobbyController = require('../controllers/lobbyController');

// Odkazy na controller
router.get('/index', lobbyController.index);
router.get('/addTable', lobbyController.addTable);
router.get('/lizany', lobbyController.lizany);
router.get('/voleny', lobbyController.voleny);

module.exports = router;
