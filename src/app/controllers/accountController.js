const userModel = require("../models/userModel");

exports.index = (req, res) => {
    res.render('account/index');
}

exports.prihlasit = (req, res) => {
    res.render('account/prihlasit');
}

exports.createUser = (req,res) => {
    console.log("DĚLÁM UŽIVATELE");
    
    // res.redirect('/account/prihlasit');
}