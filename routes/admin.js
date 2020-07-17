const express = require('express');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

let protocol;
if(setting.USE_SSL) {
    protocol = "https://"
}
else {
    protocol = "http://"
}

app.get('/admin', utils.isAdmin, (req, res, next) => {
    res.render('admin', {
        user: req.user
    });
    return;
});

app.get('/admin/:page', utils.isAdmin, (req, res, next) => {
    const parsedUrl = url.parse(req.url);
    const parsedQuery = querystring.parse(parsedUrl.query,'&','=');

    const userdb = JSON.parse(fs.readFileSync('./userdata.json'));

    switch(req.params.page) {
        case 'user':
            if(parsedQuery.id == null || parsedQuery.id == '') {
                res.render('admin-user-menu');
            }
            else {
                const fakeuserdata = {
                    "RANK" : 0,
                    "left_count" : 0
                };
                res.render('admin-user-edit', {
                    parsedQuery : parsedQuery,
                    userdb : userdb,
                    userdata : userdb[parsedQuery.id] || fakeuserdata
                });
            }
            break;
    }
});

module.exports = app;