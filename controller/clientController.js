const asyncHandler = require('express-async-handler');
const Client = require('../models/clientSchema');

const createClient = asyncHandler(async(req, res)=>{
    const { name, amount, email,phone_number,select_type } = req.body;
 
    const newClient = await Client.create({
        name: name,
        amount: amount,
        email: email,
        phone_number:phone_number,
        select_type:select_type
  
    });
    if(newClient){
        res.status(200).json({_id: newClient.id, name: newClient.name})
    }else{
        res.status(400);
        throw new Error('Client data is not valid')
    }
});

const getClients = asyncHandler(async(req, res)=>{
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (error) {
        console.log("Error Fetching Clients", error);
        res.status(500).json({message: 'Server Error'})
    }
})


module.exports = { createClient, getClients }
