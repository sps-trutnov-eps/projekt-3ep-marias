const tableModel = require('../models/tableModel');

exports.index = (req, res) => {
    res.render('lobby/index');
}

exports.addTable = (req, res) => {
    tableModel.addTable();
    tableModel.addCards(1);
    res.redirect('/game/main');
}

exports.lizany = (req, res) => {
    res.render('lobby/lizany')
}

exports.voleny = (req, res) => {
    res.render('lobby/voleny')
}