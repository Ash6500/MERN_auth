import bcryptjs from 'bcryptjs'
import crypto from 'crypto'

import { User } from '../models/userModel.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js'

// controlling functions that are throwed to the auth Route
export const signup = async (req,res) => {
    const {name, password, email} = req.body

    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        const userAlreadyExist = await User.findOne({email})
        if(userAlreadyExist){
            return res.status(400).json({success: false, message: "User already exists"})
        }

        // hashing the password
        const hashedPassword = await bcryptjs.hash(password, 10)

        // generate verification code
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        
        // create new user
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000   //24h
        })

        await user.save();

        // jwt auth
        generateTokenAndSetCookie(res, user._id)

        // send verication mails
        await sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        res.status(400).json({success: false, message: error.message})
    }
}

// verify email
export const verifyEmail = async (req, res) => {
    const {code} = req.body

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message: 'Invalid or expired verification code'})
        }

        user.isVerified = true;
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        // send welcome mails
        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({success: true, message: 'Email verified successfully',
            user:{
                ...user._doc,
                password: undefined,
            }
        })

    } catch (error) {
        console.log('Error in verifiyEmail', error)
        res.send(500).json({success: false, message: 'Server error'})
    }
}

export const login = async (req,res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({success: false, message:"Invalid Credentials"})
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(400).json({success: false, message:"Invalid Credentials"})
        }

        generateTokenAndSetCookie(res, user._id)

        user.lastLogin = new Date();

        await user.save()

        res.status(200).json({
            success: true, 
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("Error in login", error)
        res.status(400).json({success: false, message: error.message})
    }
}

export const logout = async (req,res) => {
    res.clearCookie("token")
    res.status(200).json({success: true, message: "Logged out successfully"})
}

export const forgotPassword = async (req, res) =>{
    // user provides email 
    const {email} = req.body;
    // check if email exists in database
    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: "User not found"})
        }

        // generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;  // 1-hour

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save();

        // send email
        await sendPasswordResetEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({success: true, message: "Password reset link successfully sent to your email"})
    } catch (error) {
        console.log("Error in forgotPassword", error)
        res.status(400).json({success: false, message: error.message})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired reset token"})
        }

        // update password
        const hashedPassword = await bcryptjs.hash(password,10)

        user.password = hashedPassword
        user.resetPasswordExpiresAt = undefined;
        user.resetPasswordToken = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        res.status(200). json({success: true, message: "Password reset successful"})

    } catch (error) {
        console.log("Error in resetPassword", error);
        res.status(400).json({success: false, message: error.message})
    }
}

export const checkAuth = async(req,res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if(!user){
            return res.status(400).json({success: false, message: "User not found"})
        }

        res.status(200).json({success: true, user})
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({success: false, message: error.message})
    }
}