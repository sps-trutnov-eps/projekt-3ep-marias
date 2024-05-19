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
    res.render('lobby/voleny');
}

exports.pravidlaVoleny = (req, res) => {
    res.render('lobby/pravidlaVoleny');
}

exports.novyStulLizany = (req, res) => {
    res.render('lobby/novyStulLizany');
}

exports.novyStulVoleny = (req, res) => {
    if (req.session.currentUser)
        return res.render('lobby/novyStulVoleny');
    else
        return res.redirect('/account/index');
}

exports.pridaniStoluLizany = (req, res) => {
    res.render('lobby/index');
}

exports.pridaniStoluVoleny = (req, res) => {
    if (req.session.currentUser) {
        let id = tableModel.addTable("voleny", req.body.tableName, req.body.password, parseFloat(req.body.penezniZaklad), req.body.hraciKarty);
        req.session.currentGameID = id;
        return res.redirect("/game/main");
    } else res.redirect('/account/index');
}

exports.stolyVoleny = (req, res) => {
    res.send(JSON.stringify(tableModel.getGamesVoleny()));
}

exports.pripoj = (req, res) => {
    if (req.session.currentUser) {
        req.session.currentGameID = req.params.id;
        return res.redirect("/game/main");
    } else res.redirect('/account/index');
}
