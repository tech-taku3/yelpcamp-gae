// URL例: https://res.cloudinary.com/dsgdqxnrf/image/upload/w_200/v1748673591/YelpCamp/xvntiy7jdpxpue8vdhsg.jpg
// mongooseのvirtualフィールドを使う

const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
        type: [Number],
        required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);

