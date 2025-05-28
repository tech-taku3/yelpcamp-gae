const express = require('express');
const campgrounds = require('../controllers/campgrounds');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

router.route('/')  // EXpress app.route()を使ってパスをグルーピング
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router

module.exports = router;