const tableModel = require('../models/tableModel');
const userModel = require('../models/userModel');
const copyObj = require('lodash/cloneDeep');

exports.main = (req, res) => {
    if (req.session.currentUser) {
        res.render('game/main');
    } else {
        res.redirect('/lobby/');
    }
}

exports.connect = (client, req) => {
    if (req.session.currentUser) {
        tableModel.addPlayer(1, req.session.currentUser, client);
        client.send(req.session.currentUser);
        update();
    }
}

exports.disconnect = (client, req) => {
    tableModel.removePlayer(1, req.session.currentUser, client);
    update(1);
}

exports.resolve = (client, event) => {
    if (event.split(";")[0] == "play"){
        // tableModel.checkMarias
        // tableModel.playCard(1, "Josef", event.split(";")[1]);
        // tableMode.checkStych
    }

    if (event.split(";")[0] == "trumf"){
        tableModel.trumf(1, event.split(";")[1]);
    } else if (event.split(";")[0] == "talon"){
        tableModel.talon(1, event.split(";")[1], event.split(";")[2]);
    }
    this.sortCards(1, true);
    update(1);
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
    tableModel.sortCards(1, req.session.currentUser, true);
    res.redirect('/game/main');
}

exports.recollectCards = (req, res) => {
    tableModel.recollectCards(1);
    res.redirect('/game/main');
}

update = (gameID) => {
    let game = tableModel.getGame(1);

    for (let i = 0 ; i < game.clients.length; i++){
        let gameCopy = copyObj(game);
        gameCopy.playersPacks = game.playersPacks[i];
        gameCopy.clients = [];

        if (game.clients[i].readyState == 1) {
            game.clients[i].send(JSON.stringify(gameCopy));
        } else {
            console.log(`WebSocket is not open. ReadyState: ${game.clients[i].readyState}`);
        }
    }
}
