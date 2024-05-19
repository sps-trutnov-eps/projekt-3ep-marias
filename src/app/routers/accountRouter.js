const express = require('express');

const router = express.Router();

const accountController = require('../controllers/accountController');

router.post('/Login', accountController.Login);
router.get('/odhlasit', accountController.odhlasit);
router.get('/prihlasit', accountController.prihlasit);
router.post('/createUser', accountController.createUser);
router.get('/user', (req, res) => {
    res.redirect("/account/prihlasit");
});

module.exports = router;
