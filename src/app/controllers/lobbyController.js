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

exports.pravidlaVoleny = (req, res) => {
    res.render('lobby/pravidlaVoleny');
}

exports.novyStulLizany = (req, res) => {
    res.render('lobby/novyStulLizany');
}

exports.novyStulVoleny = (req, res) => {
    res.render('lobby/novyStulVoleny');
}

exports.pridaniStoluLizany = (req, res) => {
    console.log(req.body);
    res.render('lobby/index');
}

exports.pridaniStoluVoleny = (req, res) => {
    console.log(req.body);
    res.render('lobby/index');
}

exports.stolyVoleny = (req, res) => {
    res.send(JSON.stringify(tableModel.getGamesVoleny()));
}
