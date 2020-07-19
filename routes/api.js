const express = require('express');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const validUrl = require('valid-url');

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

app.post('/create', (req, res, next) => {
    if(!req.isAuthenticated()) {
        res.json({ "code" : "error" , "message" : "로그인 후 이용해주세요." });
        return;
    }
    const getCount = utils.getCount(req);
    if(getCount < 1 && getCount != -1) {
        res.json({ "code" : "error" , "message" : "오늘 사용량을 초과하였습니다. 내일 다시 사용해주세요." });
        return;
    }
    const permission = JSON.parse(fs.readFileSync('./permission.json'));
    const userdata = JSON.parse(fs.readFileSync('./userdata.json'));

    const parsedUrl = url.parse(req.url);
    const parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    const fullurl = `${req.protocol}://${req.hostname}:${setting.PORT}${req.url}`;
    if(!validUrl.isWebUri(parsedQuery.url)) {
        res.json({ "code" : "error" , "message" : "주소가 잘못되었습니다." });
        return;
    }
    if(parsedQuery.domain == null || parsedQuery.domain == '') {
        res.json({ "code" : "error" , "message" : "Short URL 서버 도메인이 잘못되었습니다." });
        return;
    }

    const urls = JSON.parse(fs.readFileSync('./data.json'));
    let rs;
    if(permission[userdata[req.user.id]['RANK']]['ALLOW_CUSTOM_URL'] && parsedQuery.customurl != '') {
        if(urls.hasOwnProperty(`${parsedQuery.domain}||${parsedQuery.customurl}`)) {
            res.json({ "code" : "error" , "message" : "해당 URL이 이미 존재합니다. 다른 커스텀 URL을 사용하거나 랜덤 URL을 사용해주세요." });
            return;
        }
        else rs = parsedQuery.customurl;
    }
    else {
        rs = utils.randomstring(parsedQuery.domain, 6);
    }
    urls[`${parsedQuery.domain}||${rs}`] = {};
    urls[`${parsedQuery.domain}||${rs}`]['url'] = parsedQuery.url;
    urls[`${parsedQuery.domain}||${rs}`]['created_by'] = req.user.id;
    res.json({ "code" : "success" , "url" : `${protocol}${parsedQuery.domain}/${rs}` });
    fs.writeFileSync('./data.json', JSON.stringify(urls));

    if(userdata[req.user.id]['left_count'] != -1) userdata[req.user.id]['left_count']--;
    fs.writeFileSync('./userdata.json', JSON.stringify(userdata));
    return;
});

app.post('/api', (req, res, next) => {
    const parsedUrl = url.parse(req.url);
    const parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    if(parsedQuery.apikey == null || parsedQuery.apikey == '') {
        res.json({ "code" : "error" , "message" : "API 키가 필요합니다." });
        return;
    }

    const userid = utils.findUserByApiKey(parsedQuery.apikey);
    if(userid == null) {
        res.json({ "code" : "error" , "message" : "API 키가 유효하지 않습니다." });
    }

    const getCount = utils.getCountForApi(userid);
    if(getCount < 1 && getCount != -1) {
        res.json({ "code" : "error" , "message" : "오늘 사용량을 초과하였습니다. 내일 다시 사용해주세요." });
        return;
    }
    const permission = JSON.parse(fs.readFileSync('./permission.json'));
    const userdata = JSON.parse(fs.readFileSync('./userdata.json'));

    const fullurl = `${req.protocol}://${req.hostname}:${setting.PORT}${req.url}`;
    if(!validUrl.isWebUri(parsedQuery.url)) {
        res.json({ "code" : "error" , "message" : "주소가 잘못되었습니다." });
        return;
    }
    if(parsedQuery.domain == null || parsedQuery.domain == '') {
        res.json({ "code" : "error" , "message" : "Short URL 서버 도메인이 잘못되었습니다." });
        return;
    }

    const urls = JSON.parse(fs.readFileSync('./data.json'));
    let rs;
    if(permission[userdata[userid]['RANK']]['ALLOW_CUSTOM_URL'] && parsedQuery.customurl != '' && parsedQuery.customurl != null) {
        if(urls.hasOwnProperty(`${parsedQuery.domain}||${parsedQuery.customurl}`)) {
            res.json({ "code" : "error" , "message" : "해당 URL이 이미 존재합니다. 다른 커스텀 URL을 사용하거나 랜덤 URL을 사용해주세요." });
            return;
        }
        else rs = parsedQuery.customurl;
    }
    else {
        rs = utils.randomstring(parsedQuery.domain, 6);
    }
    urls[`${parsedQuery.domain}||${rs}`] = {};
    urls[`${parsedQuery.domain}||${rs}`]['url'] = parsedQuery.url;
    urls[`${parsedQuery.domain}||${rs}`]['created_by'] = userid;
    res.json({ "code" : "success" , "url" : `${protocol}${parsedQuery.domain}/${rs}` });
    fs.writeFileSync('./data.json', JSON.stringify(urls));

    if(userdata[userid]['left_count'] != -1) userdata[userid]['left_count']--;
    fs.writeFileSync('./userdata.json', JSON.stringify(userdata));

    const keylog = JSON.parse(fs.readFileSync('./key_log.json'));
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(keylog[parsedQuery.apikey] == null) {
        keylog[parsedQuery.apikey] = [];
    }
    keylog[parsedQuery.apikey].unshift(`[${new Date().toString()}] ${ip}가 ${protocol}${parsedQuery.domain}/${rs} URL을 만들었습니다.`);
    if(keylog[parsedQuery.apikey].length > 20) {
        keylog[parsedQuery.apikey].splice(0, 1);
    }
    fs.writeFileSync('./key_log.json', JSON.stringify(keylog));
    return;
});

app.post('/editurl/:url', utils.isAdmin, (req, res, next) => {
    const urls = JSON.parse(fs.readFileSync('./data.json'));

    if(urls[req.params.url] == null) {
        urls[req.params.url] = {};
    }
    urls[req.params.url]['url'] = req.body.url;
    urls[req.params.url]['created_by'] = req.body.created_by;
    fs.writeFileSync('./data.json', JSON.stringify(urls));
    res.redirect(`/admin/url?url=${req.params.url}`);
    return;
});

app.get('/removeurl/:url', (req, res, next) => {
    if(!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }
    const urls = JSON.parse(fs.readFileSync('./data.json'));
    if(setting.ADMIN.indexOf(req.user.id) == -1 && urls[req.params.url]['created_by'] != req.user.id) {
        res.redirect('/');
        return;
    }
    const parsedUrl = url.parse(req.url);
    const parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    delete urls[req.params.url];
    fs.writeFileSync('./data.json', JSON.stringify(urls));
    res.redirect(parsedQuery.redirecturl);
    return;
});

app.get('/changeapikey', (req, res, next) => {
    if(!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }
    const userdb = JSON.parse(fs.readFileSync('./userdata.json'));
    const keylog = JSON.parse(fs.readFileSync('./key_log.json'));
    delete keylog[userdb[req.user.id]['api_key']];
    userdb[req.user.id]['api_key'] = utils.generateApiKey();
    fs.writeFileSync('./userdata.json', JSON.stringify(userdb));
    fs.writeFileSync('./key_log.json', JSON.stringify(keylog));
    res.redirect('/developers');
});

module.exports = app;