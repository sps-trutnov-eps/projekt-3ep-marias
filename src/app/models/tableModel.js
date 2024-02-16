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
        'player1': 'Josef',
        'player2': 'Jiří',
        'player3': 'Jaroslav',
        'player1Pack': [],
        'player1Collected': [],
        'player1Mariages': [],
        'player2Pack': [],
        'player2Collected': [],
        'player2Mariages':[],
        'player3Pack': [],
        'player3Collected': [],
        'player3Mariages': [],
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
