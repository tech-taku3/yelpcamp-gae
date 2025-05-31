const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
    .then(() => {
        console.log('MongoDBコネクションOK!!!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 1000;
        const camp = new Campground({
            author: '6832c4d89fa5671dbf75b376',
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            description: '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてス',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dsgdqxnrf/image/upload/v1748673591/YelpCamp/wjbw0d0iedzwipssdvwm.jpg',
                    filename: 'YelpCamp/wjbw0d0iedzwipssdvwm',
                },
                {
                    url: 'https://res.cloudinary.com/dsgdqxnrf/image/upload/v1748673591/YelpCamp/kkzj752tba6nkrrfvqk7.jpg',
                    filename: 'YelpCamp/kkzj752tba6nkrrfvqk7',
                },
                {
                    url: 'https://res.cloudinary.com/dsgdqxnrf/image/upload/v1748673591/YelpCamp/xvntiy7jdpxpue8vdhsg.jpg',
                    filename: 'YelpCamp/xvntiy7jdpxpue8vdhsg',
                }
            ]
        });
        await camp.save();
    };
};

seedDB().then(() => {
    mongoose.connection.close();
});