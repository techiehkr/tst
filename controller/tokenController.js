const asyncHandler = require('express-async-handler');
const Token = require('../models/tokenSchema');

const createToken = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { patient, doctor_id, patientName, doctorEmail, expirationDate, prescription } = req.body;

    const newToken = await Token.create({
        patient: patient,
        patientName: patientName,
        doctor_id: doctor_id,
        expirationDate: expirationDate,
        prescription: prescription,
    });
    if (newToken) {
        res.status(200).json({ "message": "Token Created" })
    } else {
        res.status(400);
        throw new Error('Error in creating token');
    }
});

const getTokens = asyncHandler(async (req, res) => {
    const tokens = await Token.find();
    if (tokens) {
        res.json(tokens);
    } else {
        res.status(401);
        throw new Error('Error in getting token');
    }
});

const updateToken = asyncHandler(async (req, res) => {
    const { tokenId } = req.params;
    const { prescription } = req.body;
    console.log("Token ID:", req.params.tokenId);
    console.log("Prescription Data:", req.body);
    try {
        const updateTokenPrescription = await Token.findByIdAndUpdate(
            tokenId,
            { prescription },
            { new: true }
        );
        if (!updateTokenPrescription) {
            return res.status(404).json({ message: 'Token not found' });
        }
    } catch (error) {
        console.log('Error updating prescription', error),
            res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = { createToken, getTokens, updateToken }