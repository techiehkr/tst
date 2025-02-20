const mongoose = require('mongoose');
const ClientSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter proper name'],
    },
    amount:{
        type: String,
        required: [true, 'Please enter amount'],
    },
    email:{
        type: String,
        required: [true, 'Please enter email'],
    },
    phone_number:{
        type: String,
        required: [true, 'Please enter phone number'],
    },
    select_type:{
        type: String,
        required: [true, 'Please enter type'],
    },
    
});

module.exports = mongoose.model('clients', ClientSchema);
