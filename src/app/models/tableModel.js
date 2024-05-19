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

exports.addTable = (type, name, password, betBase, cardStyle) => {
    let id = db.get('next_id');

    db.set(id, {
        'id': id,
        'type': type,
        'name': name,
        'password': password,
        'cardStyle': cardStyle,
        'cardPack': [],
        'players': [],
        'nicknames': [],
        'clients': [],
        'forhont': 0,
        'altForhont': undefined,
        'turn': 0,
        'playersPacks': [[], [], []],
        'playersCollected': [[], [], []],
        'playersMariages': [[], [], []],
        'playersPoints': [betBase*500, betBase*500, betBase*500],
        'talon': [],
        'table': [],
        'tableOrder':[],
        'phase': 'waiting',
        'betBase': betBase,
        'bet': 1,
        'bet7': 1,
        'continueBet':[true, true],
        'trumf': '',
        'mode': '',
        'challange':'',
        'result':'',
        'continue':[false,false,false]
    })
    this.addCards(id);
    this.mixCards(id);
    if (type === "voleny"){
        this.dealCardsVoleny(id);
    }

    db.set('next_id', id + 1);

    return id;
}

exports.addPlayer = (gameID, id, nickname, client) => {
    let game = db.get(gameID);

    if (game.type == "voleny" && game.players.length < 3) {
        game.players.push(id);
        game.nicknames.push(nickname);
        game.clients.push(client);
        if (game.players.length == 3){
            game.phase = "picking-trumf";
            game.result = "hráči byli připojeni";
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
        game.nicknames.splice(playerIndex, 1);
    }

    db.set(gameID, game);
    this.newRound(gameID);
    game = db.get(gameID);
    game.phase = "waiting";

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
    game.result = "Forhont (" + game.nicknames[game.forhont] + ") vybral trumf";

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
    game.result = "Forhont (" + game.nicknames[game.forhont] + ") odhodil karty do talonu";

    db.set(gameID, game);
}

exports.mode = (gameID, mode) => {
    let game = db.get(gameID);

    if(game.type == "voleny"){
        if(mode == "h"){
            game.mode = mode;
            game.turn = (game.turn + 1) % 3;
            game.phase = "ack";
        } else if (mode == "b"){
            game = turnX(game);
            if (game.altForhont === undefined) game.altForhont = game.forhont;
            game.mode = mode;
            game.trumf = "";
            game.turn = (game.turn + 1) % 3;
            game.phase = "ack";
        } else if (mode == "d"){
            game = turnX(game);
            if (game.altForhont === undefined) game.altForhont = game.forhont;
            game.mode = mode;
            game.trumf = "";
            game.turn = (game.turn + 1) % 3;
            game.phase = "betting";
        }
    }

    switch (mode) {
        case "b":
            mode = "battle";
            break;
        case "h":
            mode = "hra";
            break;
        case "d":
            mode = "durch";
            break;
        default:
            break;
    }

    game.result = "Forhont (" + game.nicknames[game.forhont] + ") zvolil typ hry: " + mode;

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

turnXback = (game) => {
    for(let j = 0; j < game.cardPack.length; j++){
        if(game.cardPack[j].value == 10) game.cardPack[j].value = 14;
    }
    return game;
}

exports.good = (gameID) => {
    let game = db.get(gameID);

    let mode = game.mode;
    switch (mode) {
        case "b":
            mode = "Betl";
            break;
        case "h":
            mode = "Hra";
            break;
        case "d":
            mode = "Durch";
            break;
        default:
            break;
    }

    let trumfy = game.trumf;
    switch (trumfy) {
        case "č":
            trumfy = "červené";
            break;
        case "z":
            trumfy = "zelené";
            break;
        case "k":
            trumfy = "kule";
            break;
        case "ž":
            trumfy = "žaludy";
            break;
        default:
            break;
    }

    game.turn = (game.turn + 1) % 3;
    if (game.altForhont === undefined) {
        if (game.forhont == game.turn) {
            if (game.mode == "h") {
                game.phase = "choosing-challange";
                game.result = mode + " byl/a odsouhlasen/a \n Trumfy jsou: " + trumfy;
            }
        }
    } else {
        if (game.altForhont == game.turn){
            game.phase = "betting";
            game.continueBet = [true, false];
            game.result = mode + " byl/a odsouhlasen/a";
            game.turn = (game.turn + 1) % 3;
        }
    }

    db.set(gameID, game);
}

exports.bad = (gameID) => {
    let game = db.get(gameID);

    game.altForhont = game.turn;
    for(let i = 0; i < game.talon.length; i++){
        game.playersPacks[game.turn].push(game.talon[i]);
    }
    game.talon = [];
    game.phase = "choosing-talon";
    game.result = "Hráč " + game.players[game.turn] + " nesouhlasí s hrou";

    db.set(gameID, game);
}

exports.challange = (gameID, challange) => {
    let game = db.get(gameID);
    if (challange == "h"){
        game.challange = challange;
        game.phase = "betting";
        game.continueBet = [true, false];
        game.turn = (game.turn + 1) % 3;
        game.result = "Forhont se zavázal k tomu zahrát hru";
    } else if (challange == "7"){
        for (let i = 0; i < game.playersPacks[game.forhont].length; i++){
            if (game.playersPacks[game.forhont][i].colour == game.trumf){
                if (game.playersPacks[game.forhont][i].value == 7){
                    game.challange = challange;
                    game.phase = "betting";
                    game.continueBet = [true, true];
                    game.turn = (game.turn + 1) % 3;
                    game.result = "Forhont se zavázal k tomu zahrát " + challange;
                }
            }
        }
        if (game.phase != "betting") game.result = "Takovou hru si nemůžeš dovolit";
    } else if (challange == "100"){
        let hlaska = false;
        for (let i = 0; i < game.playersPacks[game.forhont].length; i++){
            if (game.playersPacks[game.forhont][i].value == 12){
                for (let j = 0; j < game.playersPacks[game.forhont].length; j++){
                    if (game.playersPacks[game.forhont][i].colour == game.playersPacks[game.forhont][j].colour && game.playersPacks[game.forhont][j].value == 13){
                        game.challange = challange;
                        game.phase = "betting";
                        game.continueBet = [true, false];
                        game.turn = (game.turn + 1) % 3;
                        game.result = "Forhont se zavázal k tomu zahrát " + challange;
                    }
                }
            }
        }
        if (game.phase != "betting") game.result = "Takovou hru si nemůžeš dovolit";
    } else if (challange == "107"){
        let sedma = false;
        for (let i = 0; i < game.playersPacks[game.forhont].length; i++){
            if (game.playersPacks[game.forhont][i].colour == game.trumf){
                if (game.playersPacks[game.forhont][i].value == 7){
                    sedma == true;
                }
            }
        }
        if (sedma){
            for (let i = 0; i < game.playersPacks[game.forhont].length; i++){
                if (game.playersPacks[game.forhont][i].value == 12){
                    for (let j = 0; j < game.playersPacks[game.forhont].length; j++){
                        if (game.playersPacks[game.forhont][i].colour == game.playersPacks[game.forhont][j].colour && game.playersPacks[game.forhont][j].value == 13){
                            game.challange = challange;
                            game.phase = "betting";
                            game.continueBet = [true, true];
                            game.turn = (game.turn + 1) % 3;
                            game.result = "Forhont se zavázal k tomu zahrát " + challange;
                        }
                    }
                }
            }
        }
        if (game.phase != "betting") game.result = "Takovou hru si nemůžeš dovolit";
    }

    db.set(gameID, game);
}

exports.bet = (gameID, gameBet, sevenBet) => {
    if (gameBet == "konec" && sevenBet == "konec") this.noBet(gameID);
    else {
        let game = db.get(gameID);

        let f;
        if(game.altForhont === undefined) f = game.forhont;
        else f = game.altForhont;

        if (gameBet == "flek" && game.continueBet[0]){
            if (game.turn == f){
                game.bet *= 2;
                if (game.bet == 64){
                    game.phase = "playing";
                    game.result = "Nelze flekovat výše, jde se hrát";
                } else {
                    game.turn = (game.turn + 1) % 3;
                    game.result = "Forhont zvedl sázku hry";
                }
            } else {
                game.bet *= 2;
                if (sevenBet == "konec" || !game.continueBet[1]) game.turn = f;
                game.result = "Obránce zvedl sázku hry";
            }
        } else game.continueBet[0] = false;
        if (sevenBet == "flek" && game.continueBet[1]){
            if (game.turn == f){
                game.bet7 *= 2;
                if (game.bet7 == 64){
                    game.phase = "playing";
                    game.result = "Nelze flekovat výše, jde se hrát";
                } else {
                    game.turn = (game.turn + 1) % 3;
                    if (game.result.includes("hry")) game.result += " a sedmy";
                    else game.result = "Forhont zvedl sázku sedmy";
                }
            } else {
                game.bet7 *= 2;
                game.turn = f;
                if (game.result.includes("hry")) game.result += " a sedmy";
                else game.result = "Obránce zvedl sázku sedmy";
            }
        } else game.continueBet[1] = false;

        db.set(gameID, game);
    }
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
            if (game.bet == 1 && game.bet7 == 1) {
                if (game.challange == "h" || game.challange == "7"){
                    game.phase = "no-flek";
                    db.set(gameID, game);
                    this.checkEnd(gameID);
                    game = db.get(gameID);
                } else {
                    game.phase = "playing";
                    game.result = "Flekování ukončeno na " + game.bet + " násobku ceny";
                }
            } else if (Math.log2(game.bet) % 2 == 0 && game.continueBet[0]) {
                game.phase = "playing";
                game.result = "Flekování ukončeno na " + game.bet + " násobku ceny";
            } else if (Math.log2(game.bet7) % 2 == 0 && game.continueBet[1]) {
                game.phase = "playing";
                game.result = "Flekování ukončeno na " + game.bet + " násobku ceny";
            }
        }
    }

    db.set(gameID, game);
}

exports.checkMarias = (gameID, player, cardIndex) => {
    let game = db.get(gameID);
    let playerIndex = game.players.findIndex(p => p == player);
    let checkedCard = game.playersPacks[playerIndex][cardIndex];
    if (playerIndex == game.turn) {
        if (game.mode == "h"){
            if (checkedCard.value == 12){
                for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                    if (game.playersPacks[playerIndex][i].colour == checkedCard.colour){
                        if (game.playersPacks[playerIndex][i].value == 13){
                            game.playersMariages[playerIndex].push(checkedCard.colour);
                            game.result = "Hráč " + game.nicknames[game.turn] + " zahrál hlášku";
                        }
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
        if (game.mode == "h"){
            // První karta na stole
            if (game.table.length == 0){
                game.playersPacks[playerIndex].splice(cardIndex, 1);
                game.table.push(playedCard);
                game.tableOrder.push(playerIndex);
                if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                game.turn = (game.turn + 1) % game.players.length;
            } // Karta má stejnou barvu
            else if (playedCard.colour == game.table[0].colour){
                // nejsilnější karta na stole
                let highestCard = game.table[0];
                if (game.table.length == 2){
                    if (highestCard.colour != game.trumf){
                        if (game.table[1].colour == game.trumf) highestCard = game.table[1];
                        else if (game.table[1].value > highestCard.value) highestCard = game.table[1];
                    } else if (highestCard.colour == game.table[1].colour) {
                        if (highestCard.value < game.table[1].value) highestCard = game.table[1];
                    }
                }
                // podmínky odehrání
                if (playedCard.colour != game.trumf){
                    if (highestCard.colour == game.trumf){
                        game.playersPacks[playerIndex].splice(cardIndex, 1);
                        game.table.push(playedCard);
                        game.tableOrder.push(playerIndex);
                        if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                        game.turn = (game.turn + 1) % game.players.length;
                    } else {
                        if (playedCard.value > highestCard.value){
                            game.playersPacks[playerIndex].splice(cardIndex, 1);
                            game.table.push(playedCard);
                            game.tableOrder.push(playerIndex);
                            if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                            game.turn = (game.turn + 1) % game.players.length;
                        } else {
                            let higher = false;
                            for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                                if (game.playersPacks[playerIndex].colour == playedCard.colour){
                                    if (game.playersPacks[playerIndex].value > highestCard.value){
                                        higher = true;
                                    } 
                                }
                            }
                            if (higher) game.result = "Ještě máš vyšší kartu, nedělej, že nemáš";
                            else {
                                game.playersPacks[playerIndex].splice(cardIndex, 1);
                                game.table.push(playedCard);
                                game.tableOrder.push(playerIndex);
                                if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                                game.turn = (game.turn + 1) % game.players.length;
                            }
                        }
                    }
                } else {
                    if (playedCard.value > highestCard.value){
                        game.playersPacks[playerIndex].splice(cardIndex, 1);
                        game.table.push(playedCard);
                        game.tableOrder.push(playerIndex);
                        if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                        game.turn = (game.turn + 1) % game.players.length;
                    } else {
                        let higher = false;
                        for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                            if (game.playersPacks[playerIndex].colour == playedCard.colour){
                                if (game.playersPacks[playerIndex].value > highestCard.value){
                                    higher = true;
                                } 
                            }
                        }
                        if (higher) game.result = "Ještě máš vyšší kartu, nedělej, že nemáš";
                        else {
                            game.playersPacks[playerIndex].splice(cardIndex, 1);
                            game.table.push(playedCard);
                            game.tableOrder.push(playerIndex);
                            if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                            game.turn = (game.turn + 1) % game.players.length;
                        }
                    }
                }
            } // Karta je trumf 
            else if (playedCard.colour == game.trumf){
                let colour = false;
                for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                    if (game.playersPacks[playerIndex][i].colour == game.table[0].colour) colour = true;
                }
                if (!colour){
                    // nejsilnější karta na stole
                    let highestCard = game.table[0];
                    if (game.table.length == 2){
                        if (highestCard.colour != game.trumf){
                            if (game.table[1].colour == game.trumf) highestCard = game.table[1];
                            else if (game.table[1].value > highestCard.value) highestCard = game.table[1];
                        } else if (highestCard.colour == game.table[1].colour) {
                            if (highestCard.value < game.table[1].value) highestCard = game.table[1];
                        }
                    }
                    if (highestCard.colour != game.trumf){
                        game.playersPacks[playerIndex].splice(cardIndex, 1);
                        game.table.push(playedCard);
                        game.tableOrder.push(playerIndex);
                        if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                        game.turn = (game.turn + 1) % game.players.length;
                    } else {
                        if (highestCard.value < playedCard.value) {
                            game.playersPacks[playerIndex].splice(cardIndex, 1);
                            game.table.push(playedCard);
                            game.tableOrder.push(playerIndex);
                            if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                            game.turn = (game.turn + 1) % game.players.length;
                        }
                        else {
                            let higher = false;
                            for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                                if (game.playersPacks[playerIndex].colour == playedCard.colour){
                                    if (game.playersPacks[playerIndex].value > highestCard.value){
                                        higher = true;
                                    } 
                                }
                            }
                            if (higher) game.result = "Ještě máš vyšší kartu, nedělej, že nemáš";
                            else {
                                game.playersPacks[playerIndex].splice(cardIndex, 1);
                                game.table.push(playedCard);
                                game.tableOrder.push(playerIndex);
                                if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                                game.turn = (game.turn + 1) % game.players.length;
                            }
                        }
                    }
                } else game.result = "Ještě máš barvu, nedělej, že nemáš";
            } // Jakýkoliv jiný případ 
            else {
                let trumf = false;
                for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                    if (game.playersPacks[playerIndex][i].colour == game.trumf) trumf = true;
                }

                let colour = false;
                for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                    if (game.playersPacks[playerIndex][i].colour == game.table[0].colour) colour = true;
                }

                if (!trumf && !colour){
                    game.playersPacks[playerIndex].splice(cardIndex, 1);
                    game.table.push(playedCard);
                    game.tableOrder.push(playerIndex);
                    if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                    game.turn = (game.turn + 1) % game.players.length;
                }
                if (trumf) game.result = "Ještě máš trumfa, nedělej, že nemáš";
                if (colour) game.result = "Ještě máš barvu, nedělej, že nemáš";
            }
        }
        else{
            // První karta na stole
            if (game.table.length == 0){
                game.playersPacks[playerIndex].splice(cardIndex, 1);
                game.table.push(playedCard);
                game.tableOrder.push(playerIndex);
                game.turn = (game.turn + 1) % game.players.length;
            } // Karta má stejnou barvu
            else if (playedCard.colour == game.table[0].colour){
                // nejsilnější karta na stole
                let highestCard = game.table[0];
                if (game.table.length == 2){
                    if (highestCard.colour == game.table[1].colour) {
                        if (highestCard.value < game.table[1].value) highestCard = game.table[1];
                    }
                }
                // podmínky odehrání
                if (playedCard.value > highestCard.value){
                    game.playersPacks[playerIndex].splice(cardIndex, 1);
                    game.table.push(playedCard);
                    game.tableOrder.push(playerIndex);
                    if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                    game.turn = (game.turn + 1) % game.players.length;
                } else {
                    let higher = false;
                    for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                        if (game.playersPacks[playerIndex].colour == playedCard.colour){
                            if (game.playersPacks[playerIndex].value > highestCard.value){
                                higher = true;
                            } 
                        }
                    }
                    if (higher) game.result = "Ještě máš vyšší kartu, nedělej, že nemáš";
                    else {
                        game.playersPacks[playerIndex].splice(cardIndex, 1);
                        game.table.push(playedCard);
                        game.tableOrder.push(playerIndex);
                        if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                        game.turn = (game.turn + 1) % game.players.length;
                    }
                }
            } // Jakýkoliv jiný případ 
            else {
                let colour = false;
                for (let i = 0; i < game.playersPacks[playerIndex].length; i++){
                    if (game.playersPacks[playerIndex][i].colour == game.table[0].colour) colour = true;
                }

                if (!colour){
                    game.playersPacks[playerIndex].splice(cardIndex, 1);
                    game.table.push(playedCard);
                    game.tableOrder.push(playerIndex);
                    if (!game.result.includes("hlášku")) game.result = "Hráč " + game.nicknames[game.turn] + " zahrál kartu";
                    game.turn = (game.turn + 1) % game.players.length;
                } else game.result = "Ještě máš barvu, nedělej, že nemáš";
            }
        }
    }

    db.set(gameID, game);
}

exports.checkStych = (gameID) => {
    let game = db.get(gameID);

    if (game.table.length == 3){
        let strongestCard = game.table[0];

        for (let i = 0; i < 3; i++){
            if (game.table[i].colour == strongestCard.colour){
                if (game.table[i].value > strongestCard.value){
                    strongestCard = game.table[i];
                }
            }
            else if (game.table[i].colour == game.trumf) {
                strongestCard = game.table[i];
            }
        }
    
        let indexOfCard = game.table.indexOf(strongestCard);

        game.turn = game.tableOrder[indexOfCard];
        for (let i = 0; i < 3; i++){
            game.playersCollected[game.turn].push(game.table.shift());
        }
        game.table = [];
        if (game.playersPacks[0].length != 0) game.tableOrder = [];
        game.result += " a hráč " + game.nicknames[game.turn] + " získal karty pro sebe";

        if (game.mode == "b"){
            if (game.turn == game.altForhont) {
                game.phase = "betl-lost";
                db.set(gameID, game);
                this.checkEnd(gameID);
                game = db.get(gameID);
            }
        }
        if (game.mode == "d"){
            if (game.turn != game.altForhont) {
                game.phase = "durch-lost";
                db.set(gameID, game);
                this.checkEnd(gameID);
                game = db.get(gameID);
            }
        }
    }

    db.set(gameID, game);
}

/*
FORMÁT DAT ODESÍLANÝCH KLIENTOVI
coForhontVyhrál;-> bool:bool:bool:bool:bool (hra, 7, 100, belt, durch)
bodyForhonta;	-> int
bodyObrany;	-> int
základHry;	-> float
trumfČervená; 	-> bool:float (jestli byl a na jakou hodnotu cenu dostal)
fleky; 		-> int:float (kolik fleků a na jakou hodnotu cenu dostaly)
sto; 		-> bool:float (jestli stovka byla (např. tichá) a na jakou hodnotu cenu dostal)
celkovaCena     -> float
sedma; 		-> bool:float (jestli sedma byla (např. tichá) a na jakou hodnotu cenu dostala)
flekySedmy; 	-> int:float (kolik fleků a na jakou hodnotu cenu dostaly)
celkovaCena7    -> float
kdoKolikZíská   -> float:float:float (první forhont a pak dva obránci)
příklad, forhont vyhrál sedmu v červené - "true:true:false:false:false;60;30;0,1;false:0,1;true:0,2;2:0,8;false:0,8;0,8;false:0,2;true:0,4;0:0,4;0,4;2,4:-1,2:-1,2"
*/

exports.checkEnd = (gameID) => {
    let game = db.get(gameID);

    if (game.gamePhase == "no-flek"){
        game.phase = "paying";
        let price = game.betBase;
        if (game.continueBet[1]) price += 2 * price;

        game.playersPoints[game.forhont] += 2 * price;
        game.playersPoints[(game.forhont + 1) % 3] -= price;
        game.playersPoints[(game.forhont + 2) % 3] -= price;

        game.result = "";
    } 
    else {
        if (game.mode == "h" && game.playersPacks[0] == 0){
            game.phase = "paying";
            let forPoints = 0;
            let defPoints = 0;

            if (game.turn == game.forhont) forPoints += 10;
            else defPoints += 10;

            for(let i = 0; i < game.playersCollected.length; i++){
                for(let j = 0; j < game.playersCollected[i].length; j++){
                    if (game.playersCollected[i][j].value == 14 || game.playersCollected[i][j].value == 15){
                        if (i == game.forhont) forPoints += 10;
                        else defPoints += 10;
                    }
                }
            }

            if (game.challange == "h"){
                for(let i = 0; i < game.playersMariages.length; i++){
                    for(let j = 0; j < game.playersMariages[i].length; j++){
                        if (game.playersMariages[i][j] == game.trumf){
                            if (i == game.forhont) forPoints += 40;
                            else defPoints += 40;
                        } else {
                            if (i == game.forhont) forPoints += 20;
                            else defPoints += 20;
                        }
                    }
                }

                let price = game.betBase * game.bet;
                let flekPrice = price;
                let red = false;
                let redPrice = game.betBase;
                if (game.trumf == "č") {
                    price *= 2;
                    redPrice *= 2;
                    red = true;
                }

                // tiché sto
                let higher = 0;
                let sHundred = false;
                if (forPoints >= 100) higher = forPoints;
                if (defPoints >= 100) higher = defPoints;
                if (higher >= 100){
                    sHundred = true;
                    for (let i = 100; i <= 100; i += 10){
                        price *= 2;
                    }
                }

                // tichá sedma
                let price7 = 0;
                let sSeven = false;
                for(let i = 0; i < game.playersCollected.length; i++){
                    if (game.playersCollected[i].length > 0){
                        lastCards = game.playersCollected[i].slice(-3);
                        let seven = false;
                        let sevenIndex = 0;
                        for (let c = 0; c < lastCards.length; c++){
                            if (lastCards[c].value == 7){
                                if (lastCards[c].colour == game.trumf) {
                                    seven = true;
                                    sevenIndex = c;
                                }
                            }
                        }
                        if (seven){
                            let higher = false;
                            let higherIndex = 0;
                            for (let v = 0; v < lastCards.length; v++){
                                if (lastcards[v].colour == game.trumf && v != sevenIndex) higher = true;
                            }
                            if (higher){
                                sSeven = true;
                                if (game.tableOrder[higherIndex] == game.forhont) price7 = 1;
                                else price7 = -1;
                            }
                            else {
                                sSeven = true;
                                if (game.tableOrder[sevenIndex] == game.forhont) price7 = 1;
                                else price7 = -1;
                            }
                        }
                    }
                }
                if (game.trumf == "č") price7 *= 2;

                // vyplácení
                let forWin = true;
                if (forPoints < defPoints) {
                    forWin = false;
                    price *= -1;
                }

                game.playersPoints[game.forhont] += 2 * (price + price7);
                game.playersPoints[(game.forhont + 1) % 3] -= price - price7;
                game.playersPoints[(game.forhont + 2) % 3] -= price - price7;
                game.result = forWin + ":false:false:false:false;" + forPoints + ";" + defPoints + ";" + game.betBase + ";" +
                red + ":" + redPrice + ";" + Math.log2(game.bet) + ":" + flekPrice + ";" + sHundred + ":" + Math.abs(price) + ";" +
                price + ";" + sSeven + ":" + Math.abs(price7) + ";0:" + Math.abs(price7) + ";" + price7 + ";" + (2 * (price + price7)) + ":" +
                (price - price7) + ":" + (price - price7);
                
            } else if (game.challange == "7"){
                for(let i = 0; i < game.playersMariages.length; i++){
                    for(let j = 0; j < game.playersMariages[i].length; j++){
                        if (game.playersMariages[i][j] == game.trumf){
                            if (i == game.forhont) forPoints += 40;
                            else defPoints += 40;
                        } else {
                            if (i == game.forhont) forPoints += 20;
                            else defPoints += 20;
                        }
                    }
                }

                let price = game.betBase * game.bet;
                let flekPrice = price;
                let red = false;
                let redPrice = game.betBase;
                if (game.trumf == "č") {
                    price *= 2;
                    redPrice *= 2;
                    red = true;
                }

                // tiché sto
                let higher = 0;
                let sHundred = false;
                if (forPoints >= 100) higher = forPoints;
                if (defPoints >= 100) higher = defPoints;
                if (higher >= 100){
                    sHundred = true;
                    for (let i = 100; i <= 100; i += 10){
                        price *= 2;
                    }
                }

                // sedma
                let price7 = game.betBase * 2 * game.bet7;
                if (game.trumf == "č") price7 *= 2;
                let seven = false;
                if (game.playersCollected[game.forhont].length > 0){
                    lastCards = game.playersCollected[game.forhont].slice(-3);
                    for (let i = 0; i < lastCards.length; i++){
                        if (lastCards[i].value == 7){
                            if (lastCards[i].colour == game.trumf) seven = true;
                        }
                    }
                }
                if (!seven) price7 *= -1;

                // vyplácení
                game.playersPoints[game.forhont] += 2 * price7;
                game.playersPoints[(game.forhont + 1) % 3] -= price7;
                game.playersPoints[(game.forhont + 2) % 3] -= price7;

                let forWin = true;
                if (forPoints < defPoints) {
                    forWin = false;
                    price *= -1;
                }

                game.playersPoints[game.forhont] += 2 * (price + price7);
                game.playersPoints[(game.forhont + 1) % 3] -= price - price7;
                game.playersPoints[(game.forhont + 2) % 3] -= price - price7;
                game.result = forWin + ":" + seven +"false:false:false:false;" + forPoints + ";" + defPoints + ";" + game.betBase + ";" +
                red + ":" + redPrice + ";" + Math.log2(game.bet) + ":" + flekPrice + ";" + sHundred + ":" + Math.abs(price) + ";" +
                price + ";true:" + redPrice * 2 + ";" + Math.log2(game.bet7) + ":" + Math.abs(price7) + ";" + price7 + ";" +
                (2 * (price + price7)) + ":" + (price - price7) + ":" + (price - price7);
            } else if (game.challange == "100"){
                let price = game.betBase * 4 * game.bet;
                let flekPrice = price;
                let red = false;
                let redPrice = game.betBase * 4;
                if (game.trumf == "č") {
                    price *= 2;
                    redPrice *= 2;
                    red = true;
                }

                trumfM = false;
                for (let i = 0; i < game.playersMariages[game.forhont].length; i++){
                    if (game.playersMariages[game.forhont][i] == game.trumf) trumfM = true;
                }

                let hundred = false;
                if(trumfM){
                    if(defPoints > 30){
                        for(let j = 0; j < game.playersMariages[(game.forhont + 1) % 3].length; j++){
                            defPoints += 20;
                        }
                        for(let j = 0; j < game.playersMariages[(game.forhont + 2) % 3].length; j++){
                            defPoints += 20;
                        }
                    } else {
                        hundred = true;
                        for(let j = 0; j < game.playersMariages[game.forhont].length; j++){
                            if (game.playersMariages[game.forhont][j] == game.trumf){
                                forPoints += 40;
                            } else {
                                forPoints += 20;
                            }
                        }
                    }
                } else {
                    if(defPoints > 10){
                        for(let j = 0; j < game.playersMariages[(game.forhont + 1) % 3].length; j++){
                            if (game.playersMariages[(game.forhont + 1) % 3][j] == game.trumf){
                                defPoints += 40;
                            } else {
                                defPoints += 20;
                            }
                        }
                        for(let j = 0; j < game.playersMariages[(game.forhont + 2) % 3].length; j++){
                            if (game.playersMariages[(game.forhont + 2) % 3][j] == game.trumf){
                                defPoints += 40;
                            } else {
                                defPoints += 20;
                            }
                        }
                    } else {
                        hundred = true;
                        for(let j = 0; j < game.playersMariages[game.forhont].length; j++){
                            forPoints += 20;
                        }
                    }
                }

                let price7 = 0;
                let sSeven = false;
                for(let i = 0; i < game.playersCollected.length; i++){
                    if (game.playersCollected[i].length > 0){
                        lastCards = game.playersCollected[i].slice(-3);
                        let seven = false;
                        let sevenIndex = 0;
                        for (let c = 0; c < lastCards.length; c++){
                            if (lastCards[c].value == 7){
                                if (lastCards[c].colour == game.trumf) {
                                    seven = true;
                                    sevenIndex = c;
                                }
                            }
                        }
                        if (seven){
                            let higher = false;
                            let higherIndex = 0;
                            for (let v = 0; v < lastCards.length; v++){
                                if (lastcards[v].colour == game.trumf && v != sevenIndex) higher = true;
                            }
                            if (higher){
                                sSeven = true;
                                if (game.tableOrder[higherIndex] == game.forhont) price7 = 1;
                                else price7 = -1;
                            }
                            else {
                                sSeven = true;
                                if (game.tableOrder[sevenIndex] == game.forhont) price7 = 1;
                                else price7 = -1;
                            }
                        }
                    }
                }
                if (game.trumf == "č") price7 *= 2;

                // vyplácení
                let forWin = true;
                if (hundred){
                    for(let i = 110; i < forPoints; i += 10){
                        price *= 2;
                    }
                } else {
                    forWin = false;
                    price *= -1;
                    if (trumfM){
                        for(let i = 50; i < defPoints; i += 10){
                            price *= 2;
                        }
                    } else {
                        for(let i = 30; i < defPoints; i += 10){
                            price *= 2;
                        }
                    }
                }

                game.playersPoints[game.forhont] += 2 * (price + price7);
                game.playersPoints[(game.forhont + 1) % 3] -= price - price7;
                game.playersPoints[(game.forhont + 2) % 3] -= price - price7;
                game.result = "false:false:" + forWin + ":false:false;" + forPoints + ";" + defPoints + ";" + game.betBase * 4 + ";" +
                red + ":" + redPrice + ";" + Math.log2(game.bet) + ":" + flekPrice + ";true:" + Math.abs(price) + ";" +
                price + ";" + sSeven + ":" + Math.abs(price7) + ";0:" + Math.abs(price7) + ";" + price7 + ";" + (2 * (price + price7)) + ":" +
                (price - price7) + ":" + (price - price7);
            } else if (game.challange == "107"){
                let price = game.betBase * 4 * game.bet;
                let flekPrice = price;
                let red = false;
                let redPrice = game.betBase * 4;
                if (game.trumf == "č") {
                    price *= 2;
                    redPrice *= 2;
                    red = true;
                }

                trumfM = false;
                for (let i = 0; i < game.playersMariages[game.forhont].length; i++){
                    if (game.playersMariages[game.forhont][i] == game.trumf) trumfM = true;
                }

                let hundred = false;
                if(trumfM){
                    if(defPoints > 30){
                        for(let j = 0; j < game.playersMariages[(game.forhont + 1) % 3].length; j++){
                            defPoints += 20;
                        }
                        for(let j = 0; j < game.playersMariages[(game.forhont + 2) % 3].length; j++){
                            defPoints += 20;
                        }
                    } else {
                        hundred = true;
                        for(let j = 0; j < game.playersMariages[game.forhont].length; j++){
                            if (game.playersMariages[game.forhont][j] == game.trumf){
                                forPoints += 40;
                            } else {
                                forPoints += 20;
                            }
                        }
                    }
                } else {
                    if(defPoints > 10){
                        for(let j = 0; j < game.playersMariages[(game.forhont + 1) % 3].length; j++){
                            if (game.playersMariages[(game.forhont + 1) % 3][j] == game.trumf){
                                defPoints += 40;
                            } else {
                                defPoints += 20;
                            }
                        }
                        for(let j = 0; j < game.playersMariages[(game.forhont + 2) % 3].length; j++){
                            if (game.playersMariages[(game.forhont + 2) % 3][j] == game.trumf){
                                defPoints += 40;
                            } else {
                                defPoints += 20;
                            }
                        }
                    } else {
                        hundred = true;
                        for(let j = 0; j < game.playersMariages[game.forhont].length; j++){
                            forPoints += 20;
                        }
                    }
                }

                let price7 = game.betBase * 2 * game.bet7;
                if (game.trumf == "č") price7 *= 2;
                let seven = false;
                if (game.playersCollected[game.forhont].length > 0){
                    lastCards = game.playersCollected[game.forhont].slice(-3);
                    for (let i = 0; i < lastCards.length; i++){
                        if (lastCards[i].value == 7){
                            if (lastCards[i].colour == game.trumf) seven = true;
                        }
                    }
                }
                if (!seven) price7 *= -1;

                // vyplácení
                game.playersPoints[game.forhont] += 2 * price7;
                game.playersPoints[(game.forhont + 1) % 3] -= price7;
                game.playersPoints[(game.forhont + 2) % 3] -= price7;

                let forWin = true;
                if (hundred){
                    for(let i = 110; i < forPoints; i += 10){
                        price *= 2;
                    }
                } else {
                    forWin = false;
                    price *= -1;
                    if (trumfM){
                        for(let i = 50; i < defPoints; i += 10){
                            price *= 2;
                        }
                    } else {
                        for(let i = 30; i < defPoints; i += 10){
                            price *= 2;
                        }
                    }
                }

                game.playersPoints[game.forhont] += 2 * price;
                game.playersPoints[(game.forhont + 1) % 3] -= price;
                game.playersPoints[(game.forhont + 2) % 3] -= price;
                game.result = "false:" + seven + ":" + forWin + ":false:false;" + forPoints + ";" + defPoints + ";" + game.betBase * 4 + ";" +
                red + ":" + redPrice + ";" + Math.log2(game.bet) + ":" + flekPrice + ";true:" + Math.abs(price) + ";" +
                price + ";" + ";true:" + redPrice * 2 + ";" + Math.log2(game.bet7) + ":" + Math.abs(price7) + ";" + price7 + ";" +
                (2 * (price + price7)) + ":" + (price - price7) + ":" + (price - price7);
            }
        } else if (game.mode == "b") {
            if (game.phase == "betl-lost"){
                game.phase = "paying";
                game.playersPoints[game.altForhont] -= 2 * game.betBase * 5 * game.bet;
                game.playersPoints[(game.altForhont + 1) % 3] += game.betBase * 5 * game.bet;
                game.playersPoints[(game.altForhont + 2) % 3] += game.betBase * 5 * game.bet;
                game.result = "false:false:false:false:false;0;0;" + game.betBase * 5 + ";false:0;" + 
                Math.log2(game.bet) + ":" + game.betBase * 5 * game.bet + ";false:0;" + game.betBase * 5 * game.bet * (-1) +
                ";false:0;0:0;0;" + (2 * game.betBase * 5 * game.bet * (-1)) + ":" + 
                (game.betBase * 5 * game.bet) + ":" + (game.betBase * 5 * game.bet);
            } else if (game.playersPacks[0] == 0) {
                game.phase = "paying";
                game.playersPoints[game.altForhont] += 2 * game.betBase * 5 * game.bet;
                game.playersPoints[(game.altForhont + 1) % 3] -= game.betBase * 5 * game.bet;
                game.playersPoints[(game.altForhont + 2) % 3] -= game.betBase * 5 * game.bet;
                game.result = "false:false:false:true:false;0;0;" + game.betBase * 5 + ";false:0;" + 
                Math.log2(game.bet) + ":" + game.betBase * 5 * game.bet + ";false:0;" + game.betBase * 5 * game.bet +
                ";false:0;0:0;0;" + (2 * game.betBase * 5 * game.bet) + ":" + 
                (game.betBase * 5 * game.bet * (-1)) + ":" + (game.betBase * 5 * game.bet * (-1));
            }
        } else if (game.mode == "d") {
            if (game.phase == "durch-lost"){
                game.phase = "paying";
                game.playersPoints[game.altForhont] -= 2 * game.betBase * 10 * game.bet;
                game.playersPoints[(game.altForhont + 1) % 3] += game.betBase * 10 * game.bet;
                game.playersPoints[(game.altForhont + 2) % 3] += game.betBase * 10 * game.bet;
                game.result = "false:false:false:false:false;0;0;" + game.betBase * 10 + ";false:0;" + 
                Math.log2(game.bet) + ":" + game.betBase * 10 * game.bet + ";false:0;" + game.betBase * 10 * game.bet * (-1) +
                ";false:0;0:0;0;" + (2 * game.betBase * 10 * game.bet * (-1)) + ":" + 
                (game.betBase * 10 * game.bet) + ":" + (game.betBase * 10 * game.bet);
            } else if (game.playersPacks[0] == 0) {
                game.phase = "paying";
                game.playersPoints[game.altForhont] += 2 * game.betBase * 10 * game.bet;
                game.playersPoints[(game.altForhont + 1) % 3] -= game.betBase * 10 * game.bet;
                game.playersPoints[(game.altForhont + 2) % 3] -= game.betBase * 10 * game.bet;
                game.result = "false:false:false:false:true;0;0;" + game.betBase * 10 + ";false:0;" + 
                Math.log2(game.bet) + ":" + game.betBase * 10 * game.bet + ";false:0;" + game.betBase * 10 * game.bet +
                ";false:0;0:0;0;" + (2 * game.betBase * 10 * game.bet) + ":" + 
                (game.betBase * 10 * game.bet * (-1)) + ":" + (game.betBase * 10 * game.bet * (-1));
            }
        }
    }
    db.set(gameID, game);
}

exports.continue = (gameID, player) => {
    let game = db.get(gameID);

    indexofPlayer = game.players.findIndex(p => p == username);
    game.continue[indexOfPlayer] = true;

    db.set(gameID, game);
}

exports.newRound = (gameID) => {
    let game = db.get(gameID);
    // Při testování tabulky ve fázi "paying" je třeba odstranit toto                      ..........................
    if (game.continue[0] && game.continue[1] && game.continue[2] || game.players.length < 3 || game.phase == "paying"){
        game.altForhont = undefined;
        game.forhont = (game.forhont + 1) % 3;
        game.turn = game.forhont;
        game.playersMariages[0] = [];
        game.playersMariages[1] = [];
        game.playersMariages[2] = [];
        game.tableOrder = [];
        game.phase = "picking-trumf";
        game.bet = 1;
        game.bet7 = 1;
        game.continueBet = [true, true];
        game.trumf = '';
        game.mode = '';
        game.challange = '';
        game.result = "Další kolo"
        game.continue = [false,false,false];
        game.playersPacks = [[],[],[]];
        game.playersCollected  = [[],[],[]];
        game.talon = [];
        game.table = [];

        game = turnXback(game);
        db.set(gameID, game);
        this.addCards(gameID);
        this.mixCards(gameID);
        if (game.type == "voleny") this.dealCardsVoleny(gameID);
        game = db.get(gameID);
    }

    db.set(gameID, game);
}

exports.checkNewRound = (gameID) => {
    let game = db.get(gameID);
    if (game.phase == "paying") this.newRound(gameID);
}

exports.skip = (gameID, gamePhase) => {
    let game = db.get(gameID);

    game.phase = gamePhase;

    db.set(gameID, game);
}

exports.getGame = (gameID) => {
    return db.get(gameID);
}

exports.getGamesVoleny = () => {
    let veschnyStoly = db.JSON();
    let stolyVolene = [];
    for (let index in veschnyStoly){
        if (veschnyStoly[index].type == "voleny") stolyVolene.push(veschnyStoly[index]);
    }
    return stolyVolene;
}
