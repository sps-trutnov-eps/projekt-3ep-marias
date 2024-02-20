const jsondb = require('simple-json-db');
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
        'name': 'testovaciStul',
        'password': '',
        'cardPack': [],
        'players': ['Josef', 'Jiří', 'Jaroslav'],
        'forhont': 0,
        'turn': 0,
        'playersPacks': [[], [], []],
        'playersCollected': [[], [], []],
        'playersMariages': [[], [], []],
        'talon': [],
        'table': []
    })

    db.set('next_id', id + 1);
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

    db.set(gameID, game);
}

exports.recollectCards = (gameID) => {
    let game = db.get(gameID);

    for(let i = 0; i < game.playersPacks.length; i++){
        for(let j = 0; j < game.playersPacks[i]; i++){
            game.cardPack.push(game.playersPacks[i].shift());
        }
    }

    for(let i = 0; i < game.playersCollected.length; i++){
        for(let j = 0; j < game.playersCollected[i]; i++){
            game.cardPack.push(game.playersCollected[i].shift());
        }
    }

    for(let i = 1; i < game.playersMariages; i++){
        game.playersMariages[i] = [];
    }

    if(game.talon.length != 0){
        for(let i = 0; i < game.talon.length; i++){
            game.cardPack.push(game.talon.shift());
        }
    }

    if(game.table.length != 0){
        for(let i = 0; i < game.table.length; i++){
            game.cardPack.push(game.table.shift());
        }
    }

    db.set(gameID, game);
}

exports.getGame = (gameID) => {
    return db.get(gameID);
}
