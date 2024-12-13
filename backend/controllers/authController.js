import { User } from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js'

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
    res.send('Login route')
}

export const logout = async (req,res) => {
    res.send('Logout route')
}