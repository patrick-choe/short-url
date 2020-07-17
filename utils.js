const fs = require('fs');
const randomstring = require('randomstring');

const setting = require('./setting.json');

module.exports.randomstring = (length) => {
    const urls = JSON.parse(fs.readFileSync('./data.json'));
    let rs = randomstring.generate(length);
    while(urls.hasOwnProperty(rs)) {
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

    if(today_date != serverdata.last_reset_date) {
        for(key in userdata) {
            userdata[key]['left_count'] = setting['RANK'][userdata[key]['RANK']]['DAY_LIMIT'];
        }
        serverdata.last_reset_date = today_date;
    }

    fs.writeFileSync('./userdata.json', JSON.stringify(userdata));
    fs.writeFileSync('./server_data.json', JSON.stringify(serverdata));
    return userdata[req.user.id]['left_count'];
}