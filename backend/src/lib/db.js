import mongoose, { Mongoose } from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connecting to deatabase", error);
        process.exit(1);
    }
};