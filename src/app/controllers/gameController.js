const tableModel = require('../models/tableModel');

exports.mixCards = (req, res) => {
    tableModel.mixCards(1);
    res.redirect('/lobby/index');
}

exports.dealCardsVoleny = (req, res) => {
    tableModel.dealCardsVoleny(1);
    res.redirect('/lobby/index');
}