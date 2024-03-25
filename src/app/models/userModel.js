const jsondb = require('simple-json-db');
const db = new jsondb('./data/users.json');
const CryptoJS = require('crypto-js');

if(!db.has('next_id')) {
    db.set('next_id', 1);
}

const encrypt = (text) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = (data) => {
    return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

exports.pridatUzivatele = (jmeno, prezdivka, heslo) => {
    let id = db.get('next_id');

    db.set(id, {
        'jmeno': jmeno,
        'prezdivka': prezdivka,
        'heslo': encrypt(heslo)
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

exports.UserIdGet = (jmeno) => {
    const allUsers = db.JSON();

    delete allUsers.next_id;

    for(let id in allUsers) {
        if(allUsers[id].jmeno == jmeno) {
            return id;
        }
    }

    return false;
}

exports.userHasSamePasswd = (jmeno, password) => {
    const allUsers = db.JSON();

    delete allUsers.next_id;

    for(let id in allUsers) {
        if(allUsers[id].jmeno == jmeno && decrypt(allUsers[id].heslo) == password) {
            return true;
        }
    }

    return false;
}