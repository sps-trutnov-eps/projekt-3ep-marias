const express = require('express');
const webSockets = require('express-ws');

const router = express.Router();

const gameController = require('../controllers/gameController');

webSockets(express());

// Odkazy na controller
router.get('/main', gameController.main);
router.ws('/test', (ws, req) => {
    gameController.connect(ws, req);

    ws.onmessage((event) => {
        gameController.test(ws, req);
    });
});

router.get('/mixCards', gameController.mixCards);
router.get('/dealCardsVoleny', gameController.dealCardsVoleny);
router.get('/sortCards', gameController.sortCards);
router.get('/recollectCards', gameController.recollectCards);

module.exports = router;
