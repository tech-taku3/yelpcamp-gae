const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');


const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
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

app.get('/', (req, res) => {
    res.render('home');
});

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

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});