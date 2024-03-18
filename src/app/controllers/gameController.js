const tableModel = require('../models/tableModel');

exports.main = (req, res) => {
    res.render('game/main');
}

exports.connect = (client, req) => {
    client.send("Jsi připojen");
}

exports.test = (client, event) => {
    console.log(event);
    client.send("nazdar");
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