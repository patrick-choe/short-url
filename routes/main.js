const express = require('express');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.get('/', (req, res, next) => {
    const userdb = JSON.parse(fs.readFileSync('./userdata.json'));
    const fakeuserdata = {

    }
    let userdata;
    if(req.isAuthenticated()) {
        userdata = userdb[req.user.id];
    }
    else {
        userdata = fakeuserdata;
    }

    res.render('main', {
        req: req,
        user: req.user,
        logined: req.isAuthenticated(),
        setting: setting,
        userdb: userdb,
        userdata: userdata,
        checkAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.id) != -1,
        leftcount: utils.getCount(req)
    });
});

module.exports = app;