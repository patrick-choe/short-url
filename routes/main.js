const express = require('express');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.get('/', (req, res, next) => {
    const permission = JSON.parse(fs.readFileSync('./permission.json'));
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
        leftcount: utils.getCount(req),
        permission: permission
    });
});

app.get('/manage', (req, res, next) => {
    if(!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }

    const urls = JSON.parse(fs.readFileSync('./data.json'));
    let my_urls = {};

    for(let key in urls) {
        if(urls[key]['created_by'] == req.user.id) {
            my_urls[key] = urls[key];
        }
    }

    res.render('manage-url', {
        urls: urls,
        my_urls: my_urls
    });
});

module.exports = app;