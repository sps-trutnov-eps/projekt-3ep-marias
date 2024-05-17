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
        tableModel.addPlayer(req.session.currentGameID, req.session.currentUser, req.session.currentNickname, client);
        client.send(JSON.stringify(req.session.currentUser + ";" + req.session.currentGameID));
        update(req.session.currentGameID);
    }
}

exports.disconnect = (client, req) => {
    tableModel.removePlayer(req.session.currentGameID, req.session.currentUser, client);
    update(req.session.currentGameID);
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
        tableModel.mode(game, event.split(";")[2]);
    } else if (command == "dobra"){
        tableModel.good(game);
    } else if (command == "spatna"){
        tableModel.bad(game);
    } else if (command == "challange"){
        tableModel.challange(game, event.split(";")[2])
    } else if (command == "bet"){
        tableModel.bet(game, event.split(";")[2], event.split(";")[3]);
    } else if (command == "play"){
        tableModel.checkMarias(game, event.split(";")[2], event.split(";")[3]);
        tableModel.playCard(game, event.split(";")[2], event.split(";")[3]);
    } else if (command == "end"){
        tableModel.checkStych(game);
        tableModel.checkEnd(game);
    } else if (command == "continue"){
        tableModel.continue(game, event.split(";")[2])
    }
        
    //this.sortCards(game, true);
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
    let game = tableModel.getGame(gameID);
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
