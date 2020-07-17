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

app.use((req, res, next) => {
    const urls = JSON.parse(fs.readFileSync('./data.json'));
    if(urls.hasOwnProperty(req.url.replace('/', ''))) {
        res.redirect(urls[req.url.replace('/', '')]);
        return;
    }
    else {
        next();
    }
});

console.log('라우터를 불러오는 중...');
let filelist = fs.readdirSync('./routes');
for(let i in filelist) {
    app.use(require('./routes/' + filelist[i]));
    console.log(`${filelist[i]} 라우터를 불러왔습니다.`);
}
console.log('라우터를 모두 불러왔습니다.\n');

app.use((req, res, next) => {
    res.status(404).send(`<h1>${url.parse(req.url).pathname}을(를) 찾을 수 없습니다.</h1>`);
    return;
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