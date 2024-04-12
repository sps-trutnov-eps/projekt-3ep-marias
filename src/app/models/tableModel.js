const jsondb = require('simple-json-db');
const copyObj = require('lodash/cloneDeep');
const db = new jsondb('./data/tables.json');
const colours = ["č", "z", "k", "ž"] // červený, zelený, kule, žaludy
const values = [7, 8, 9, 10, 11, 12, 13, 14, 15]
/*
7 - VII
8 - VIII
9 - IX
10 - X při betlu/durchu
11 - spodek
12 - svršek
13 - král
14 - X normálně
15 - eso
*/

if(!db.has('next_id')) {
    db.set('next_id', 1);
}

exports.addTable = () => {
    let id = db.get('next_id');

    db.set(id, {
        'type': 'voleny',
        'name': 'testovaciStul',
        'password': '',
        'cardPack': [],
        'players': [],
        'clients': [],
        'forhont': 0,
        'altForhont': undefined,
        'agreed': 0,
        'turn': 0,
        'playersPacks': [[], [], []],
        'playersCollected': [[], [], []],
        'playersMariages': [[], [], []],
        'playersPoints': [0, 0, 0],
        'talon': [],
        'table': [],
        'phase': 'waiting',
        'bet': 1,
        'trumf': '',
        'challange':''
    })
    this.addCards(id);
    this.mixCards(id);

    db.set('next_id', id + 1);
}

exports.addPlayer = (gameID, id, client) => {
    let game = db.get(gameID);

    game.players.push(id);
    game.clients.push(client);

    db.set(gameID, game);
}

exports.removePlayer = (gameID, id, client) => {
    let game = db.get(gameID);
    let index = game.clients.indexOf(client);
    if (index !== -1) {
        game.clients.splice(index, 1);
    }

    let playerIndex = game.players.indexOf(id);
    if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
    }

    db.set(gameID, game);
}

exports.addCards = (gameID) => {
    let game = db.get(gameID);

    for(let colour in colours){
        for(let value in values){
            if(values[value] != 10){
                game.cardPack.push({
                    'colour': colours[colour],
                    'value': values[value]
                });
            }
        }
    }

    db.set(gameID, game);
}

exports.mixCards = (gameID) => {
    let game = db.get(gameID);
    let oldOrder = game.cardPack;
    let newOrder = [];

    for(let i = 0; i < 32; i++){
        let randomIndex = Math.floor(Math.random() * oldOrder.length);
        newOrder[i] = oldOrder[randomIndex];
        let firstPart = oldOrder.slice(0, randomIndex + 1);
        firstPart.pop();
        let secondPart = oldOrder.slice(randomIndex + 1);
        oldOrder = firstPart.concat(secondPart);
    }

    game.cardPack = newOrder;
    db.set(gameID, game);
}

exports.dealCardsVoleny = (gameID) => {
    let game = db.get(gameID);

    for(let i = 0; i < 7; i++){
        game.playersPacks[game.forhont % 3].push(game.cardPack.shift());
    }
    for(let i = 0; i < 5; i++){
        game.playersPacks[(game.forhont + 1) % 3].push(game.cardPack.shift());
    }
    for(let i = 0; i < 5; i++){
        game.playersPacks[(game.forhont + 2) % 3].push(game.cardPack.shift());
    }
    for(let i = 0; i < 5; i++){
        game.playersPacks[game.forhont % 3].push(game.cardPack.shift());
    }
    for(let i = 0; i < 5; i++){
        game.playersPacks[(game.forhont + 1) % 3].push(game.cardPack.shift());
    }
    for(let i = 0; i < 5; i++){
        game.playersPacks[(game.forhont + 2) % 3].push(game.cardPack.shift());
    }

    game.cardPack= [];

    db.set(gameID, game);
}

exports.sortCards = (gameID, username, byValue) => {
    let game = db.get(gameID);
    let indexOfPlayer = game.players.findIndex(p => p == username);
    let cerveny = [];
    let kule = [];
    let zeleny = [];
    let zaludy = [];

    while(game.playersPacks[indexOfPlayer].length > 0) {
        switch (game.playersPacks[indexOfPlayer][0].colour) {
            case "č":
                cerveny.push(game.playersPacks[0].shift());
                break;
            case "k":
                kule.push(game.playersPacks[0].shift());
                break;
            case "z":
                zeleny.push(game.playersPacks[0].shift());
                break;
            case "ž":
                zaludy.push(game.playersPacks[0].shift());
                break;
        }
    }

    if(byValue){
        unsortCE = cerveny;
        cerveny = [];
        unsortKU = kule;
        kule = [];
        unsortZE = zeleny;
        zeleny = [];
        unsortZA = zaludy;
        zaludy = [];
        unsort = [unsortCE, unsortKU, unsortZE, unsortZA];
        sort = [cerveny, kule, zeleny, zaludy];
        
        for(let a = 0; a < sort.length; a++){
            for(let i = 0; i < values.length; i++){
                for(let j = 0; j < unsort[a].length; j++){
                    if(values[i] === unsort[a][j].value){
                        sort[a].push(unsort[a][j]);
                    }
                }
            }
        }
    }

    game.playersPacks[indexOfPlayer] = [].concat(cerveny, kule, zeleny, zaludy);

    db.set(gameID, game);
}

exports.recollectCards = (gameID) => {
    let game = db.get(gameID);

    for(let i = 0; i < game.playersPacks.length; i++){
        while(0 < game.playersPacks[i].length){
            game.cardPack.push(game.playersPacks[i].shift());
        }
    }

    for(let i = 0; i < game.playersCollected.length; i++){
        while(0 < game.playersCollected[i].length){
            game.cardPack.push(game.playersCollected[i].shift());
        }
    }

    for(let i = 0; i < game.playersMariages; i++){
        game.playersMariages[i] = [];
    }

    if(game.talon.length != 0){
        while(0 < game.talon.length){
            game.cardPack.push(game.talon.shift());
        }
    }

    if(game.table.length != 0){
        while(0 < game.table.length){
            game.cardPack.push(game.table.shift());
        }
    }

    db.set(gameID, game);
}

exports.trumf = (gameID, indx) => {
    let game = db.get(gameID);

    game.trumf = game.playersPacks[game.forhont][indx].colour;
    game.phase = "choosing-talon";

    db.set(gameID, game);
}

exports.talon = (gameID, t1, t2) => {
    let game = db.get(gameID);

    game.talon.push(game.playersPacks[game.forhont][t1]);
    game.talon.push(game.playersPacks[game.forhont][t2]);

    let newPack = [];
    for (let i = 0; i < game.playersPacks[game.forhont].length; i++){
        let includes = false;
        for (let j = 0; j < game.talon.length; j++){
            if (JSON.stringify(game.playersPacks[game.forhont][i]) == JSON.stringify(game.talon[j]))
                includes = true;
        }
        if(!includes) newPack.push(game.playersPacks[game.forhont][i]);
    }

    game.playersPacks[game.forhont] = newPack;
    game.phase = "choosing-game";

    db.set(gameID, game);
}

exports.challange = (gameID, challange) => {
    let game = db.getGame(gameID);

    if(game.type == "voleny"){
        if(challange == "h"){
            game.challange = challange;
            game.turn = (game.turn + 1) % 3;
            game.phase = "ack-game";
        } else if (challange == "b"){
            game.challange = challange;
            game.altForhont = game.turn;
            game.turn = (game.turn + 1) % 3;
            game.phase = "ack-betl";
        } else if (challange == "d"){
            game.challange = challange;
            game.altForhont = game.turn;
            game.phase = "betting";
        }
    }

    db.set(gameID, game);
}

exports.playCard = (gameID, player, cardIndex) => {
    let game = db.get(gameID);
    let playerIndex = game.players.findIndex(p => p == player);

    if (playerIndex == game.turn && player.playing) {
        let playedCard = game.playersPacks[playerIndex][cardIndex];
        game.playersPacks[playerIndex].splice(cardIndex, 1);
        game.table.push(playedCard);

        game.turn = (game.turn + 1) % game.players.length;
    }

    db.set(gameID, game);
}

exports.getGame = (gameID) => {
    return db.get(gameID);
}
