const tableModel = require('../models/tableModel');

exports.index = (req, res) => {
    res.render('lobby/index');
}

exports.addTable = (req, res) => {
    tableModel.addTable();
    tableModel.addCards(1);
    res.redirect('/lobby/index');
}

exports.mixCards = (req, res) => {
    tableModel.mixCards(1);
    res.redirect('/lobby/index');
}