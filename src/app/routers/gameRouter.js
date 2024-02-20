const express = require('express');
const webSockets = require('express-ws');

const router = express.Router();

const gameController = require('../controllers/gameController');

webSockets(express());

// Odkazy na controller
router.get('/mixCards', gameController.mixCards);
router.get('/dealCardsVoleny', gameController.dealCardsVoleny);

module.exports = router;
