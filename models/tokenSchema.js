const mongoose = require('mongoose');
const { Schema } = mongoose;

const TokenSchema = new Schema({
    patient: {
        type: String,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visitDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: {
        type: Date,
        required: true
    },
    prescription: {
        type: String,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Token', TokenSchema);
