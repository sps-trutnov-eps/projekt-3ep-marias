const express = require('express');

const router = express.Router();

const lobbyController = require('../controllers/lobbyController');

// Odkazy na controller
router.get('/index', lobbyController.index);
router.get('/addTable', lobbyController.addTable);
router.get('/lizany', lobbyController.lizany);
router.get('/voleny', lobbyController.voleny);
router.get('/pravidlaVoleny', lobbyController.pravidlaVoleny);
router.get('/novyStulLizany', lobbyController.novyStulLizany);
router.get('/novyStulVoleny', lobbyController.novyStulLizany);
router.post('/pridaniStoluLizany', lobbyController.pridaniStoluLizany);
router.post('/pridaniStoluVoleny', lobbyController.pridaniStoluVoleny);

module.exports = router;
