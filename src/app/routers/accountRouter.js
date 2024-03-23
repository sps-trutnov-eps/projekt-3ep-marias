const express = require('express');

const router = express.Router();

const accountController = require('../controllers/accountController');

router.post('/Login', accountController.Login);
router.get('/prihlasit', accountController.prihlasit);
router.post('/createUser', accountController.createUser);

module.exports = router;
