const mongoose = require('mongoose');

const PatientSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter proper name'],
    },
    age:{
        type: String,
        required: [true, 'Please enter age'],
    },
    gender:{
        type: String,
        required: [true, 'Please enter gender'],
    },
    contact_info:{
        email:{
            type: String,
            trim: true,
            lowercase: true, 
        },
        phone:{
            type: String,
            required: [true, 'Please add your contact number'],
        },
        address:{
            type: String,
            required: [true, 'Please add your contact number'],
        },
    },
    medical_history: {
        chronic_illnesses:{
            type: String,
        },
        previous_surgeries:{
            type: String,
        },
        family_disease:{
            type: String,
        },
        ongoing_medication:{
            type: String,
        },
        vices_habits:{
            type: String,
        },
    },

},{
    timestamps: true,
});

module.exports = mongoose.model('patients', PatientSchema);