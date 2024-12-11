import mongoose from "mongoose";

export const connectDB = async () => {
    // make connection to database
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database Connected: ${connection.connection.host}`)
    } catch (error) {
        console.log("Error connecting to database: ", error.messsage)
        process.exit(1)  // 1 is for failure, 0 is for success
    }

}