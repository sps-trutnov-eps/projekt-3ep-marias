const router = require('express').Router();

router.use('/lobby', require('./lobbyRouter'));
router.use('/account', require('./accountRouter'));
router.use('/game', require('./gameRouter'));

router.use('/index', require('../controllers/lobbyController').index);
router.use('/account', require('../controllers/accountController').index);
router.use('/', require('../controllers/lobbyController').index);

router.get('*', (req, res) => {
	res.status(404);
	res.send('Stránka neexistuje (404)');
});

module.exports = router;
