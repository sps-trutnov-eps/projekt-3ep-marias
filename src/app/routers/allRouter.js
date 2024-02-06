const router = require('express').Router();

router.use('/lobby', require('./lobbyRouter'));

router.get('*', (req, res) => {
	res.status(404);
	res.send('Stránka neexistuje (404)');
});

module.exports = router;
