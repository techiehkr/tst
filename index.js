const express = require('express');
const dotenv = require("dotenv").config();
const cors = require('cors');
const connectDb = require('./config/dbConnect');
const cookieParser = require('cookie-parser');


connectDb();

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // frontend origin
    credentials: true,               // Allow cookies to be sent across domains
}));
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));


app.use("/users", require('./routes/userRoutes'));
app.use("/records", require('./routes/patientRoutes'));
app.use("/token", require('./routes/tokenRoutes'));
app.use("/client", require('./routes/clientRoutes'));


const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
})