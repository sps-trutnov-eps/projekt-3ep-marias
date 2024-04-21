const tableModel = require('../models/tableModel');
const userModel = require('../models/userModel');
const copyObj = require('lodash/cloneDeep');
const session = require("express-session");

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
        client.send(JSON.stringify(req.session.currentUser + ";" + "1"));
        update();
    }
}

exports.disconnect = (client, req) => {
    tableModel.removePlayer(1, req.session.currentUser, client);
    update(1);
}

exports.resolve = (client, event) => {
    game = event.split(";")[0];
    command = event.split(";")[1]

    if (command == "skipTo"){
        tableModel.skip(game, event.split(";")[2]);
    }

    if (command == "trumf"){
        tableModel.trumf(game, event.split(";")[2]);
    } else if (command == "talon"){
        tableModel.talon(game, event.split(";")[2], event.split(";")[3]);
    } else if (command == "game"){
        tableModel.challange(game, event.split(";")[2]);
    } else if (command == "dobra"){
        tableModel.dobra(game);
    } else if (command == "spatna"){
        tableModel.spatna(game);
    } else if (command == "bet"){
        tableModel.bet(game, event.split(";")[2], event.split(";")[3]);
    } else if (command == "noBet"){
        tableModel.noBet();
    } else if (command == "play"){
        /*
        tableModel.checkMarias(game, event.split(";")[2], event.split(";")[3]);
        tableModel.playCard(game, event.split(";")[2], event.split(";")[3]);
        tableModel.checkStych(game);
        !tableModel.checkEnd(game);! - nehotovo
        */
    }
    //this.sortCards(1, true);
    update(game);
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
    tableModel.sortCards(1, session.currentUser, true);
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
