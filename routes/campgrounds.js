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
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
    // この順番だと、cloudinaryにアップロードした後バリデーションチェックで落ちたら、画像はアップロードされる
    // validateCampground, upload.array('image')でエラー出ない。
    // validateCampgroundが効いていない？むしろだめ？

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;