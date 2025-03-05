import dotenv from 'dotenv'
import express from 'express';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/authRoute.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json())   //allows us to parse incoming requests: req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.get('/', (req,res) => {
    res.send("Hello Ash!")
})

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    connectDB()
    console.log(`The server is running on port: ${PORT}`)
})