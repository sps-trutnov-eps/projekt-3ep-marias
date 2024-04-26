const tableModel = require('../models/tableModel');

exports.index = (req, res) => {
    res.render('lobby/index');
}

exports.addTable = (req, res) => {
    req.session.currentGame = tableModel.addTable();
    res.redirect('/game/main');
}

exports.lizany = (req, res) => {
    res.render('lobby/lizany');
}

exports.voleny = (req, res) => {
    console.log("Momentální uživatel: " + req.session.currentUser);
    res.render('lobby/voleny');
}
