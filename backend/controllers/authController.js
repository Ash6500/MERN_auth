import { User } from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'

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

export const login = async (req,res) => {
    res.send('Login route')
}

export const logout = async (req,res) => {
    res.send('Logout route')
}