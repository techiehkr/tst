const asyncHandler = require('express-async-handler');
const Patient = require('../models/patientSchema');

const createPatient = asyncHandler(async(req, res)=>{
    const { name, age, gender } = req.body;
    const { email, phone, address } = req.body.contact_info;
    const { 
        chronic_illnesses,
        previous_surgeries,
        family_disease,
        ongoing_medication,
        vices_habits } = req.body.medical_history;

    const newPatient = await Patient.create({
        name: name,
        age: age,
        gender: gender,
        contact_info:{
            email: email,
            phone: phone,
            address: address,
        },
        medical_history: {
            chronic_illnesses: chronic_illnesses,
            previous_surgeries: previous_surgeries,
            family_disease: family_disease,
            ongoing_medication: ongoing_medication,
            vices_habits: vices_habits,
        }, 
    });
    if(newPatient){
        res.status(200).json({_id: newPatient.id, name: newPatient.name})
    }else{
        res.status(400);
        throw new Error('Patient data is not valid')
    }
});

const getPatients = asyncHandler(async(req, res)=>{
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        console.log("Error Fetching Patients", error);
        res.status(500).json({message: 'Server Error'})
    }
})


module.exports = { createPatient, getPatients }