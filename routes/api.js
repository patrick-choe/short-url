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
    const rs = utils.randomstring(parsedQuery.domain, 6);
    urls[`${parsedQuery.domain}||${rs}`] = parsedQuery.url;
    res.json({ "code" : "success" , "url" : `${protocol}${parsedQuery.domain}/${rs}` });
    fs.writeFileSync('./data.json', JSON.stringify(urls));

    const userdata = JSON.parse(fs.readFileSync('./userdata.json'));
    if(userdata[req.user.id]['left_count'] != -1) userdata[req.user.id]['left_count']--;
    fs.writeFileSync('./userdata.json', JSON.stringify(userdata));
    return;
});

module.exports = app;