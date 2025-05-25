const mongoose = require('mongoose');
const passport = require('passport');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// passportLocalMongooseの機能をuserSchemaに組み込む。
// → ユーザーネーム、パスワードハッシュの情報がSchemaに組み込まれる
// その他便利なメソッドも使えるように
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);