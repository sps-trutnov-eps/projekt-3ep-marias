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
    let type = "voleny";
    let id = db.get('next_id');

    db.set(id, {
        'type': type,
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
        'bet7': 1,
        'trumf': '',
        'challange':'',
        'result':''
    })
    this.addCards(id);
    this.mixCards(id);
    if (type == "voleny"){
        this.dealCardsVoleny(id);
    }

    db.set('next_id', id + 1);

    return id;
}

exports.addPlayer = (gameID, id, client) => {
    let game = db.get(gameID);

    if (game.type == "voleny" && game.players.length < 3) {
        game.players.push(id);
        game.clients.push(client);
        if (game.players.length == 3){
            game.phase = "picking-trumf";
        }
    }

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
    game.result = "Hráč " + game.players[game.forhont] + " vybral trumf";

    db.set(gameID, game);
}

exports.talon = (gameID, t1, t2) => {
    let game = db.get(gameID);

    let f;
    if(game.altForhont === undefined) f = game.forhont;
    else f = game.altForhont;

    game.talon.push(game.playersPacks[f][t1]);
    game.talon.push(game.playersPacks[f][t2]);

    let newPack = [];
    for (let i = 0; i < game.playersPacks[f].length; i++){
        let includes = false;
        for (let j = 0; j < game.talon.length; j++){
            if (JSON.stringify(game.playersPacks[f][i]) == JSON.stringify(game.talon[j]))
                includes = true;
        }
        if(!includes) newPack.push(game.playersPacks[f][i]);
    }

    game.playersPacks[f] = newPack;
    game.phase = "choosing-game";
    game.result = "Hráč " + game.players[game.forhont] + " odhodil karty do talonu";

    db.set(gameID, game);
}

exports.challange = (gameID, challange) => {
    let game = db.get(gameID);

    if(game.type == "voleny"){
        if(challange == "h"){
            game.challange = challange;
            game.turn = (game.turn + 1) % 3;
            game.phase = "ack";
        } else if (challange == "b"){
            game = turnX(game);
            game.challange = challange;
            game.trumf = "";
            game.turn = (game.turn + 1) % 3;
            game.phase = "ack";
        } else if (challange == "d"){
            game = turnX(game);
            game.challange = challange;
            game.trumf = "";
            game.turn = (game.turn + 1) % 3;
            game.phase = "betting";
        }
    }
    game.result = "Hráč " + game.players[game.turn] + " zvolil typ hry: " + challange;

    db.set(gameID, game);
}

turnX = (game) => {
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < game.playersPacks[i].length; j++){
            if(game.playersPacks[i][j].value == 14) game.playersPacks[i][j].value = 10;
        }
    }
    return game;
}

exports.good = (gameID) => {
    let game = db.get(gameID);

    game.turn = (game.turn + 1) % 3;
    if (game.altForhont === undefined) {
        if (game.forhont == game.turn) {
            game.turn = (game.turn + 1) % 3;
            game.phase = "betting";
            game.result = "Hra byla odsouhlasena";
        }
    } else if (game.altForhont == game.turn) {
        game.turn = (game.turn + 1) % 3;
        game.phase = "betting";
        game.result = "Betl byl odsouhlasen";
    }

    db.set(gameID, game);
}

exports.bad = (gameID) => {
    let game = db.get(gameID);

    game.altForhont = game.turn;
    for(let i = 0; i < game.talon.length; i++){
        game.playersPacks[game.turn].push(game.talon.shift());
    }
    game.phase = "choosing-talon";
    game.result = "Hráč " + game.players[game.turn] + " nesouhlasí s hrou";

    db.set(gameID, game);
}

exports.bet = (gameID, gameBet, sevenBet) => {
    let game = db.get(gameID);

    let f;
    if(game.altForhont === undefined) f = game.forhont;
    else f = game.altForhont;

    if (gameBet){
        if (game.turn == f){
            game.bet *= 2;
            if (game.bet == 64){
                game.phase = "playing";
                game.result = "Nelze flekovat výše, jde se hrát";
            } else game.turn = (game.turn + 1) % 3;
        } else {
            game.bet *= 2;
            game.turn = (game.turn + 1) % 3;
            if (game.turn != f){
                game.turn = f;
            }
        }
    }
    if (sevenBet){
        if (game.turn == f){
            game.bet7 *= 2;
            if (game.bet7 == 64){
                game.phase = "playing";
                game.result = "Nelze flekovat výše, jde se hrát";
            } else game.turn = (game.turn + 1) % 3;
        } else {
            game.bet7 *= 2;
            game.turn = (game.turn + 1) % 3;
            if (game.turn != f){
                game.turn = f;
            }
        }
    }

    db.set(gameID, game);
}

exports.noBet = (gameID) => {
    let game = db.get(gameID);

    let f;
    if(game.altForhont === undefined) f = game.forhont;
    else f = game.altForhont;

    if (game.turn == f){
        game.phase = "playing";
    } else {
        game.turn = (game.turn + 1) % 3;
        if (game.turn == f){
            if (game.bet == 1) {
                game.phase = "paying";
                game.result = "Bez fleku - budu sem muset vypsat zprávu o tom, jak zobrazit placení hráči"
            }
            else if (Math.log2(game.bet) % 2 == 0) {
                game.phase = "playing";
                game.result = "Flekování ukončeno na" + game.bet + "násobku ceny";
            }
        }
    }

    db.set(gameID, game);
}

exports.checkMarias = (gameID, player, cardIndex) => {
    let game = db.get(gameID);
    let playerIndex = game.players.findIndex(p => p == player);
    let checkedCard = game.playersPacks[playerIndex][cardIndex];

    if (game.challange != "b" || game.challange != "d"){
        if (checkedCard.value == 12){
            for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                if (game.playersPacks[playerIndex][i].colour == checkedCard.colour){
                    if (game.playersPacks[playerIndex][i].value == 13){
                        game.playersMariages[playerIndex].push(checkedCard.colour);
                        game.result = "Hráč " + game.players[game.turn] + " zahrál hlášku";
                    }
                }
            }
        }
    }
}

exports.playCard = (gameID, player, cardIndex) => {
    let game = db.get(gameID);
    let playerIndex = game.players.findIndex(p => p == player);

    if (playerIndex == game.turn) {
        let playedCard = game.playersPacks[playerIndex][cardIndex];
        game.playersPacks[playerIndex].splice(cardIndex, 1);
        game.table.push(playedCard);

        if (!game.result.includes("hlášku")) game.result = "Hráč " + game.players[game.turn] + " zahrál kartu";
        game.turn = (game.turn + 1) % game.players.length;
    }

    db.set(gameID, game);
}

exports.checkStych = (gameID) => {
    let game = db.get(gameID);

    if (game.table.length == 3){
        let strongestCards = game.table[0];
        for (let i = 1; i < 3; i++){
            if (game.table[i].colour == strongestCards.colour)
                if (game.table[i].value > strongestCards.value) strongestCards = game.table[i];
            else if (game.table[i].colour == game.trumf)
                strongestCards = game.table[i];
        }
    
        let indexOfCards = game.table.indexOf(strongestCards);
        for (let i = 1; i < 3; i++){
            game.playersPacks[(game.turn + indexOfCards) % 3].push(game.table.shift());
        }
        game.turn = (game.turn + indexOfCards) % 3;
        game.result += " a hráč " + game.players[game.turn] + " získal karty pro sebe";
    }

    db.set(gameID, game);
}

exports.skip = (gameID, gamePhase) => {
    let game = db.get(gameID);

    game.phase = gamePhase;

    db.set(gameID, game);
}

exports.getGame = (gameID) => {
    return db.get(gameID);
}
