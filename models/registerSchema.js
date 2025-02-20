const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    account_type:{
        type: String,
        required: [true, 'Please select your account type'],
    },
    username:{
        type: String,
        required: [true, 'Please enter proper name'],
    },
    email:{
        type: String,
        required: [true, 'Please enter your email'],
        unique: [true, "Email address already registered"],
        trim: true,
        lowercase: true, 
    },
    password:{
        type: String,
        required: [true, 'Please add your password'],
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);