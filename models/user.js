const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true
    }
})

userSchema.plugin(passportLocalMongoose);   //passport-local-mongoose npm package k documentation se liya h

module.exports = mongoose.model("User", userSchema);
