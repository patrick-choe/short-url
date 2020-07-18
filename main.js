const express = require('express');
const http = require('http');
const https = require('https');
const passport = require('passport');
const fs = require('fs');
const session = require('express-session');
const url = require('url');

const setting = require('./setting.json');

const app = express();

let protocol;
if(setting.USE_SSL) {
    protocol = "https://"
    options = {
        cert: fs.readFileSync(setting.SSL_CERT),
        key: fs.readFileSync(setting.SSL_KEY)
    }
}
else {
    protocol = "http://"
}

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(session({
    secret: setting.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const staticoptions = {
    index: setting.index
}
app.use(express.static(__dirname + "/public/", staticoptions));
app.use(express.static(__dirname + "/upload/", staticoptions));

app.set('views', './views');
app.set('view engine', 'ejs');

console.log('라우터를 불러오는 중...');
let filelist = fs.readdirSync('./routes');
for(let i in filelist) {
    app.use(require('./routes/' + filelist[i]));
    console.log(`${filelist[i]} 라우터를 불러왔습니다.`);
}
console.log('라우터를 모두 불러왔습니다.\n');

app.use((req, res, next) => {
    const urls = JSON.parse(fs.readFileSync('./data.json'));
    const json_name = `${req.hostname}||${req.url.replace('/', '')}`;
    if(urls.hasOwnProperty(json_name)) {
        res.redirect(urls[json_name]);
        return;
    }
    else {
        next();
    }
});

app.use((req, res, next) => {
    if(req.hostname != setting.MAIN_DOMAIN) {
        res.redirect(`${req.protocol}://${setting.MAIN_DOMAIN}${req.url}`);
        return;
    }
    else {
        next();
    }
});

app.use((req, res, next) => {
    res.redirect('/');
});

if(setting.USE_SSL) {
    https.createServer(options, app).listen(setting.PORT, () => {
        console.log('서버가 구동중입니다!');
    });
}
else {
    http.createServer(app).listen(setting.PORT, () => {
        console.log("서버가 구동중입니다!");
    });
}