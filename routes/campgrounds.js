const express = require('express');
const campgrounds = require('../controllers/campgrounds');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); // localではなく、cloudinaryへの保存を設定

router.route('/')  // EXpress app.route()を使ってパスをグルーピング
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    // imageというフィールドをfileとしてパースしてくれる
    // .post(upload.single('image'),(req, res) => {
    //     console.log(req.body, req.file);
    //     res.send('受け付けました');
    // })
    .post(upload.array('image'),(req, res) => {
        console.log(req.body, req.files);
        res.send('受け付けました');
    })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;