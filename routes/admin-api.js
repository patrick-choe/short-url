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
    const userdb = JSON.parse(fs.readFileSync('./userdata.json'));

    if(userdb[req.params.id] == null) {
        userdb[req.params.id] = {};
    }

    userdb[req.params.id]['RANK'] = req.body.rank;
    userdb[req.params.id]['left_count'] = Number(req.body.left_count);

    fs.writeFileSync('./userdata.json', JSON.stringify(userdb));

    res.redirect(`/admin/user?id=${req.params.id}`);
    return;
});

app.get('/editpermissiongroup/:group', utils.isAdmin, function(req, res, next) {
    const permission = JSON.parse(fs.readFileSync('./permission.json'));

    const parsedUrl = url.parse(req.url);
    const parsedQuery = querystring.parse(parsedUrl.query,'&','=');

    if(permission[req.params.group] == null) {
        permission[req.params.group] = {};
    }

    permission[req.params.group]['DAY_LIMIT'] = parsedQuery.DAY_LIMIT;
    permission[req.params.group]['ALLOW_CUSTOM_URL'] = parsedQuery.ALLOW_CUSTOM_URL;

    fs.writeFileSync('./permission.json', JSON.stringify(permission));
    res.redirect(`/admin/permission_group?group=${req.params.group}`);
});

app.get('/removepermissiongroup/:group', utils.isAdmin, function(req, res, next) {
    const permission = JSON.parse(fs.readFileSync('./permission.json'));
    if(permission[req.params.group]['DEFAULT']) {
        res.send(`<h1><a href="javascript:history.back();">기본 시스템 권한 그룹은 삭제할 수 없습니다. 이곳을 클릭해 돌아가세요.</a></h1>`);
        return;
    }

    delete permission[req.params.group];

    fs.writeFileSync('./permission.json', JSON.stringify(permission));
    res.redirect(`/admin/permission_group?group=${req.params.group}`);
});

module.exports = app;