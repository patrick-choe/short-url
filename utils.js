const fs = require('fs');
const randomstring = require('randomstring');

const setting = require('./setting.json');

module.exports.randomstring = (domain, length) => {
    const urls = JSON.parse(fs.readFileSync('./data.json'));
    let rs = randomstring.generate(length);
    while(urls.hasOwnProperty(`${domain}||${length}`)) {
        let rs = randomstring.generate(length);
    }
    return rs;
}

module.exports.getCount = (req) => {
    if(!req.isAuthenticated()) {
        return;
    }
    const today_date = new Date().getDate();
    const userdata = JSON.parse(fs.readFileSync('./userdata.json'));
    const serverdata = JSON.parse(fs.readFileSync('./server_data.json'));
    const permission = JSON.parse(fs.readFileSync('./permission.json'));

    if(today_date != serverdata.last_reset_date) {
        for(key in userdata) {
            userdata[key]['left_count'] = permission[userdata[key]['RANK']]['DAY_LIMIT'];
        }
        serverdata.last_reset_date = today_date;
    }

    fs.writeFileSync('./userdata.json', JSON.stringify(userdata));
    fs.writeFileSync('./server_data.json', JSON.stringify(serverdata));
    return userdata[req.user.id]['left_count'];
}

module.exports.getCountForApi = (id) => {
    const today_date = new Date().getDate();
    const userdata = JSON.parse(fs.readFileSync('./userdata.json'));
    const serverdata = JSON.parse(fs.readFileSync('./server_data.json'));
    const permission = JSON.parse(fs.readFileSync('./permission.json'));

    if(today_date != serverdata.last_reset_date) {
        for(key in userdata) {
            userdata[key]['left_count'] = permission[userdata[key]['RANK']]['DAY_LIMIT'];
        }
        serverdata.last_reset_date = today_date;
    }

    fs.writeFileSync('./userdata.json', JSON.stringify(userdata));
    fs.writeFileSync('./server_data.json', JSON.stringify(serverdata));
    return userdata[id]['left_count'];
}

module.exports.isAdmin = (req, res, next) => {
    if(!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }
    if(setting.ADMIN.indexOf(req.user.id) == -1) {
        res.redirect('/');
        return;
    }
    next();
}

module.exports.generateApiKey = () => {
    const userdb = JSON.parse(fs.readFileSync('./userdata.json'));
    let all_apikey = [];
    for(let key in userdb) {
        if(userdb[key]['api_key'] != null) {
            all_apikey.push(userdb[key]['api_key']);
        }
    }
    let rs = randomstring.generate(16);
    while(all_apikey.indexOf(rs) != -1) {
        let rs = randomstring.generate(16);
    }
    return rs;
}

module.exports.findUserByApiKey = (apikey) => {
    const userdb = JSON.parse(fs.readFileSync('./userdata.json'));
    let user_by_apiKey = {};
    for(let key in userdb) {
        user_by_apiKey[userdb[key]['api_key']] = key;
    }

    return user_by_apiKey[apikey];
}