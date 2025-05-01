const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
    .then(() => {
        console.log('MongoDBコネクションOK!!!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
    });
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: '私の庭', description: '気軽に安くキャンプ!!', });
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});