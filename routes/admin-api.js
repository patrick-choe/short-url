const express = require('express');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const bodyParser = require('body-parser');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.use(bodyParser.urlencoded({ extended : false }))

let protocol;
if(setting.USE_SSL) {
    protocol = "https://"
}
else {
    protocol = "http://"
}

app.post('/edituser/:id', utils.isAdmin, (req, res, next) => {
    var userdb = JSON.parse(fs.readFileSync('./userdata.json'));

    if(userdb[req.params.id] == null) {
        userdb[req.params.id] = {};
    }

    userdb[req.params.id]['RANK'] = req.body.rank;
    userdb[req.params.id]['left_count'] = Number(req.body.left_count);

    fs.writeFileSync('./userdata.json', JSON.stringify(userdb));

    res.redirect(`/admin/user?id=${req.params.id}`);
    return;
});

module.exports = app;