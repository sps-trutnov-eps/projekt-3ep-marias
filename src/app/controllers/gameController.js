const tableModel = require('../models/tableModel');

exports.main = (req, res) => {
    res.render('game/main');
}

exports.connect = (client, req) => {
    if (req.session.currentUser) {
        tableModel.addPlayer(1, req.session.currentUser);
        client.send("Jsi připojen");
    }
}

exports.resolve = (client, event) => {
    client.send("nazdar");
    if (event.split(";")[0] == "play"){
        // tableModel.checkMarias
        tableModel.playCard(1, "Josef", event.split(";")[1]);
        // tableMode.checkStych
    }
}

exports.mixCards = (req, res) => {
    tableModel.mixCards(1);
    res.redirect('/game/main');
}

exports.dealCardsVoleny = (req, res) => {
    tableModel.dealCardsVoleny(1);
    res.redirect('/game/main');
}

exports.sortCards = (req, res) => {
    tableModel.sortCards(1, "Josef", true);
    res.redirect('/game/main');
}

exports.recollectCards = (req, res) => {
    tableModel.recollectCards(1);
    res.redirect('/game/main');
}
