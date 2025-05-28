const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'おかえりなさい！！');
    const redirectUrl = res.locals.returnTo || '/campgrounds' // ここをreq.session.returnToからres.locals.returnTo に変更
    // delete req.session.returnTo;  // delete演算子でreq.session.returnToは消しておく。　← passportのアップデートによりデフォルトで削除されるためこの行は不要
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res) => {
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

}