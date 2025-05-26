const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password} = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // passportの方で、生のpasswordをハッシュ化したうえでインスタンスを作成
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Yelp Campへようこそ！');
            res.redirect('/campgrounds');
        })
        
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

// passport.authenticate()ミドルウェアの時点で認証は完了している。
// req.bodyのusernameとpasswordを自動的に見て、ハッシュ化して、DBの値と一致するかまで確認してくれている。
router.post(
    '/login',
    // storeReturnTo ミドルウェアで session から res.locals へ returnTo を移す
    storeReturnTo,
    // passport.authenticate が実行されると req.session がクリアされる
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),
    // ここで res.locals.returnTo を使ってログイン後のページへリダイレクト
    (req, res) => {
        req.flash('success', 'おかえりなさい！！');
        const redirectUrl = res.locals.returnTo || '/campgrounds' // ここをreq.session.returnToからres.locals.returnTo に変更
        // delete req.session.returnTo;  // delete演算子でreq.session.returnToは消しておく。　← passportのアップデートによりデフォルトで削除されるためこの行は不要
        res.redirect(redirectUrl);
    }
);

router.get('/logout', async (req, res) => {
    // req.logout();
    // req.flash('success', 'ログアウトしました');
    // res.redirect('/campgrounds');

    req.logout(function(err) {
        if (err) { 
            // エラーが発生した場合は、Express のエラーハンドラに渡す
            return next(err); 
        }
        // ログアウトが成功したら、フラッシュメッセージを設定してリダイレクト
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });

})

module.exports = router;