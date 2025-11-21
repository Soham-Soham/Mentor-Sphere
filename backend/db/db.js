import mongoose from 'mongoose';

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`MngoDB Connected successfully || Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection Failed!",error);
    }
}

export default connectDB;