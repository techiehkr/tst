const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const User = require('../models/registerSchema');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const registerUser = asyncHandler(async (req, res)=>{
    const { type, name, email, password } = req.body;

    if(!type || !name || !email || !password){
        res.status(400);
        throw new Error('All fields are mandatory!');
    }
    const userAvailable = await User.findOne({ email });
    if(userAvailable){
        res.status(400);
        throw new Error('User already exist!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    const user = await User.create({
        account_type: type,
        username: name,
        email,
        password: hashedPassword,
    });
    console.log(`User Created: ${user} `)
    if(user){
        res.status(200).json({_id: user.id, email: user.email})
    }else{
        res.status(400);
        throw new Error('User data is not valid')
    }
    // res.json({message: 'Register the user'});
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SEND_EMAIL,
            pass: process.env.SEND_EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: 'sdmedia.connect@gmail.com',
        to: email,
        subject: `Welcome on board ${user.username}`,
        // text: `Reset Link ${resetUrl}`
        html:
        `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
        .header { background-color: #e03131; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; font-size: 25px; }
        .bellow-content { margin-bottom: 25px; font-size: 18px; }
        .header h1 { font-size: 28px; color: white; font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; font-style: italic; }
        .content { background-color: #fbfbfb; text-align: center;  color: #e03131;}
        .content h2 { color: #e03131; padding-top: 20px; margin-top: 0px; font-size: 20px; font-weight: 800;}
        .content p { color: #555; font-size: 15px; }
        .image img { width: 100%; }
        .footer { font-size: 15px; text-align: center; color: white; margin-top: 20px; background-color: #e03131; padding: 10px; border-radius: 0px 0px 8px 8px;}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ClinicManage</h1>
        </div>

        <div class="content">

          <div class='image'>
          <img src='https://i.ibb.co/pfZYMjj/Clinic-Manage-Welcome.jpg'>
          </div>
          <h2>Hello ${user.username},</h2>
          <p>We are glad you are on board.</p>
          <p class="bellow-content">Thanks for Choosing ClinicManage. <br/> Enjoy using ClinicManage and increase productivity. </p>
          <p class="bottom-style">Thank you,<br>ClinicManage Support</p>
        </div>

        <div class="footer">
          <p>&copy; 2024 ClinicManage. All rights reserved.</p>
        </div>
      </div>

    </body>
    </html>`,
    }

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Welcome Mail' });
});

const loginUser = asyncHandler(async (req, res)=>{
    try {
    const {email, password} = req.body;
        const registeredUser =  await User.findOne({ email });
        if(!registeredUser){
            return res.json({error: 'No user found!',})}
    // check Password
    const match = await bcrypt.compare(password, registeredUser.password)
    if(match){
        const accessToken = jwt.sign({
            user: {
                username: registeredUser.username,
                email: registeredUser.email,
                id: registeredUser._id,
                type: registeredUser.account_type,
            }
        }, 
        process.env.JWT_SECRET,
        {expiresIn: "2d"})

        res.cookie('token', accessToken,{
            secure: true,
            httpOnly: true,
        })
       res.status(200).json({Message: 'Password Matching', accessToken, id: registeredUser._id});
       
    }
    if(!match){
        return res.status(401).json({ message: 'Password is not matching' });
    }
    } catch (error) {
        console.log(error);
    }
    // res.json({message: 'Login the user'});
});

// const getUserProfile = asyncHandler(async (req, res)=>{
//     const {accessToken} = req.cookies
//     if(accessToken){
//         jwt.verify(accessToken, process.env.JWT_SECRET, {}, (err, user)=>{
//             if(err) throw err;
//             res.json(user)
//         })
//     }else{
//         res.json(null);
//     }
//     // res.json({message: 'Current user'});
// });

const getUserProfile = asyncHandler(async (req, res) => {
    // Extract the token from the cookies
    const { token } = req.cookies;

    // If there's no token, respond with null
    if (!token) {
        return res.json(null);
    }

    // Verify the token if present
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }

        // If token is valid, respond with user data
        res.json(user);
    });
});

const logOutUser = asyncHandler(async(req, res)=>{
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set the expiration to the past
        sameSite: 'Strict',
    });

    res.json({ message: 'Logged out successfully' });
});

const forgotPassword = asyncHandler(async(req, res)=>{
    const { email } = req.body;
    console.log(email)
    const registeredUser =  await User.findOne({ email });
    if(!registeredUser){
        return res.status(404).json({ message: 'User not found!' });
    }

    console.log(registeredUser);

    if(registeredUser){
        const resetToken = crypto.randomBytes(32).toString('hex');
        registeredUser.resetPasswordToken = resetToken;
        registeredUser.resetPasswordExpire = Date.now() + 1800000;
        await registeredUser.save();
    
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SEND_EMAIL,
                pass: process.env.SEND_EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'sdmedia.connect@gmail.com',
            to: email,
            subject: 'ClinicManage Password Reset Link',
            // text: `Reset Link ${resetUrl}`
            html:
            `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
            .container { max-width: 500px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
            .header { background-color: #e03131; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
            .bottom-style { background-color: #e03131; color: white !important; padding: 10px; text-align: center; border-radius: 0 0 8px 8px; }
            .bellow-content { margin-bottom: 25px; }
            .header h1 { color: white; }
            .content { background-color: #fbfbfb; text-align: center; }
            .content h2 { color: #333; padding-top: 20px; margin-top: 0px;}
            .content p { color: #555; }
            .reset-button { margin: 30px 0px; }
            .reset-button a { background-color: #e03131; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>

            <div class="content">
              <h2>Hello ${registeredUser.username},</h2>
              <p>You recently requested to reset your password for your account. <br/> Click the button below to reset it.</p>
              <div class="reset-button">
                <a href="${resetUrl}" target="_blank">Reset Your Password</a>
              </div>
              <p class="bellow-content">If you did not request a password reset, <br/> please ignore this email or contact support if you have questions.</p>
              <p class="bottom-style">Thank you,<br>ClinicManage Support</p>
            </div>

            <div class="footer">
              <p>&copy; 2024 ClinicManage. All rights reserved.</p>
            </div>
          </div>

        </body>
        </html>`,
        }

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Reset link sent to your email' });
    }
});

const resetPassword = asyncHandler(async(req, res)=>{
    const {token, newPassword} = req.body;

    console.log(token, newPassword);
    
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user){
        return res.status(400).json({ message: 'invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const loginUrl = `http://localhost:3000/login`;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SEND_EMAIL,
            pass: process.env.SEND_EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: 'sdmedia.connect@gmail.com',
        to: user.email,
        subject: `Password Reset Success! Welcome back ${user.username}`,
        // text: `Reset Link ${resetUrl}`
        html:
        `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
        .header { background-color: #e03131; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; font-size: 25px; }
        .bellow-content { margin-bottom: 25px; font-size: 18px; }
        .header h1 { font-size: 28px; color: white; font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; font-style: italic; }
        .content { background-color: #fbfbfb; text-align: center;  color: #e03131;}
        .content h2 { color: #e03131; padding-top: 20px; margin-top: 0px; font-size: 20px; font-weight: 800;}
        .content p { color: #555; font-size: 15px; }
        .image img { width: 100%; }
         .reset-button { margin: 30px 0px; }
            .reset-button a { background-color: #e03131; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { font-size: 15px; text-align: center; color: white; margin-top: 20px; background-color: #e03131; padding: 10px; border-radius: 0px 0px 8px 8px;}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ClinicManage</h1>
        </div>

        <div class="content">
          <h2>Hello ${user.username},</h2>
          <p>Your Password Reset Successfully.</p>

          <div class='image'>
          <img src='https://i.ibb.co/RvsWqGF/Clinic-Manage-Password-reset-Welcome-Back.jpg'>
          </div>

          <p>Try logging in again.</p>

              <div class="reset-button">
                <a href="${loginUrl}" target="_blank">Login</a>
              </div>

          <p class="bellow-content">Thanks for Choosing ClinicManage. <br/> Enjoy using ClinicManage and increase productivity. </p>
          <p class="bottom-style">Thank you,<br>ClinicManage Support</p>
        </div>

        <div class="footer">
          <p>&copy; 2024 ClinicManage. All rights reserved.</p>
        </div>
      </div>

    </body>
    </html>`,
    }

    await transporter.sendMail(mailOptions);

    res.json({message : 'Password Reset Successfully'});

});

const getDoctors = asyncHandler(async(req, res)=>{
   const emailQuery = req.query.email;
   
   if(!emailQuery){
    res.status(400).json({error: 'Query Parameter Required'});
   }
   const doctors = await User.findOne({
    email: {$regex: emailQuery, $options: 'i'},
    account_type: 'doctor'
  }).select('email name');

  console.log(doctors)
  res.json(doctors);

  if(!doctors){
    res.status(500);
    throw new Error("error in getting doctor");
  }
});

module.exports = { registerUser, loginUser, getUserProfile, logOutUser, forgotPassword, resetPassword, getDoctors };