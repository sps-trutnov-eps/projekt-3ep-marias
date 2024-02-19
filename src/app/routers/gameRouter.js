const express = require('express');

const router = express.Router();

const gameController = require('../controllers/gameController');

// Odkazy na controller
router.get('/mixCards', gameController.mixCards);
router.get('/dealCardsVoleny', gameController.dealCardsVoleny);

module.exports = router;
