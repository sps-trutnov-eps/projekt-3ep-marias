const session = require("express-session");
const userModel = require("../models/userModel");

exports.index = (req, res) => {
    res.render('account/index');
}

exports.prihlasit = (req, res) => {
    res.render('account/prihlasit');
}

exports.Login = (req,res) => {
    const jmeno =  req.body.userHandle.trim();
    const heslo = req.body.userPassword.trim();

    if(userModel.userInDatabase(jmeno) && userModel.userHasSamePasswd(jmeno, heslo))
    {
        req.session.currentUser = userModel.UserIdGet(jmeno);
        console.log("Přihlášen: " + req.session.currentUser);
        return res.redirect('index');
    }
}

exports.createUser = (req,res) => {
    
    const jmeno =  req.body.userHandle.trim();
    const prezdivka = req.body.userNickname.trim();
    const heslo = req.body.userPassword.trim();
    const hesloZnovu = req.body.userPasswordConfirm.trim();

    if(jmeno == '' || heslo == '') {

        return res.redirect('prihlasit');

    } else if(heslo != hesloZnovu) {
        
        return res.redirect('prihlasit');

    } else if(userModel.userInDatabase(jmeno)) {

        return res.redirect('prihlasit');
    }

    userModel.pridatUzivatele(jmeno, prezdivka, heslo);
    res.redirect('prihlasit');
}