import dotenv from 'dotenv'
import express from 'express';

import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/authRoute.js'

dotenv.config();

const app = express();

app.get('/', (req,res) => {
    res.send("Hello Ash!")
})

app.use("/api/auth", authRoutes)

app.listen(3000, () => {
    connectDB()
    console.log(`The server is running on port: 3000`)
})