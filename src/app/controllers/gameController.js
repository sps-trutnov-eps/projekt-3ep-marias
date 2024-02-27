const tableModel = require('../models/tableModel');

exports.mixCards = (req, res) => {
    tableModel.mixCards(1);
    res.redirect('/lobby/index');
}

exports.dealCardsVoleny = (req, res) => {
    tableModel.dealCardsVoleny(1);
    res.redirect('/lobby/index');
}

exports.sortCards = (req, res) => {
    tableModel.sortCards(1, "Josef", true);
    res.redirect('/lobby/index');
}

exports.recollectCards = (req, res) => {
    tableModel.recollectCards(1);
    res.redirect('/lobby/index');
}