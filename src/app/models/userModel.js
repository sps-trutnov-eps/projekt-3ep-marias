const jsondb = require('simple-json-db');
const db = new jsondb('./data/users.json');

if(!db.has('next_id')) {
    db.set('next_id', 1);
}

exports.pridatUzivatele = (jmeno, prezdivka, heslo) => {
    let id = db.get('next_id');

    db.set(id, {
        'jmeno': jmeno,
        'prezdivka': prezdivka,
        'heslo': heslo
    });

    id += 1;

    db.set('next_id', id);
}

exports.userInDatabase = (jmeno) => {
    const allUsers = db.JSON();

    delete allUsers.next_id;

    for(let id in allUsers) {
        if(allUsers[id].jmeno == jmeno) {
            return true;
        }
    }

    return false;
}