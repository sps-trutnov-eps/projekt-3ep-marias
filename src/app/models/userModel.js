const jsondb = require('simple-json-db');
const db = new jsondb('./data/users.json');

if(!db.has('next_id')) {
    db.set('next_id', 1);
}

exports.pridatUzivatele = (jmeno, heslo) => {
    let id = db.get('next_id');

    db.set(id, {
        'jmeno': jmeno,
        'heslo': heslo
    });

    id += 1;

    db.set('next_id', id);
}