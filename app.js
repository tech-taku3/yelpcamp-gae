// 開発モードのときは、.envから環境変数取ってくる
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

console.log(process.env.SECRET);
console.log(process.env.API_KEY);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp';

mongoose.connect(dbUrl,{useNewUrlParser: true})
    .then(() => {
        console.log('MongoDBコネクションOK!!!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
    });
const app = express();

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_' // 禁止文字を '_' に置き換える（デフォルトの挙動）
}));
app.set('trust proxy', true); // Express はデフォルトでプロキシヘッダーを信頼しないため必要。これがないとCookieにセッションが保存されずログイン状態維持できない。

const secret = process.env.SECRET || 'mysecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on('error', e => {
    console.log('セッションエラー', e);
});

const sessionConfig = {
    store,
    name: 'session', // デフォルトの名前だと、使用しているサービスを推測される可能性があるので、変更しておくとよい
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // httpsの場合。ローカルの場合http://localhostなのでfalse
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // passportに対して、LocalStrategyという方法を使います。その際User.authenticate()という方法でやります。
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net',
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com',
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, 
    'https://images.unsplash.com',
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: [],
        imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls],
    }
}));

app.use((req, res, next) => {
    console.log(req.query);
    console.log(req.user);
    res.locals.currentUser = req.user; // req→resのライフサイクルで、どこのテンプレートからも使えるように
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

// 講義では、('*', (req, ..))だが、5系以降挙動が変わっているらしい。Q&Aで似た事象があり、この書き方でエラーが解消された。
app.all('{*any}', (req, res, next) => {
    // res.send('404!!!!!');
    next(new ExpressError('ページが見つかりませんでした',404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
});