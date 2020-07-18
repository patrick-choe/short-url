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
        case 'permission_group':
            const permission = JSON.parse(fs.readFileSync('./permission.json'));
            if(parsedQuery.group == null || parsedQuery.group == '') {
                res.render('admin-permission-group-menu');
            }
            else {
                const fakepermission = {
                    "DAY_LIMIT" : 0,
                    "ALLOW_CUSTOM_URL" : false
                }
                res.render('admin-permission-group-edit', {
                    parsedQuery : parsedQuery,
                    permission : permission,
                    thispermission : permission[parsedQuery.group] || fakepermission
                });
            }
            break;
        default:
            res.redirect('/admin');
    }
});

module.exports = app;