import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const db_name = process.env.DB_NAME;

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    
    } catch (error){
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}

export default connectDB;