import express from 'express';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//Importing Schema
import User from '../models/users.model.js';

const router = express.Router();

//Signup route
router.post('/signup', async (req, res) => {
    try{
        const {username, password, email} = req.body;
        //A very basic validation
        if(!username || !password || !email)
            return res.status(400).json({ message: "Username and password are required" });
        
        if(await User.findOne({ username }))
            return res.status(400).json({ message: "Username already taken" });
        if(await User.findOne({ email }))
            return res.status(400).json({ message: "Already a member" });
        
        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //Creating new user if everything else is fine
        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });
        
        await newUser.save();
        
        res.status(201).json({message: "User signed up successfully", user: {username}});
    } catch(error){
        console.error("Signup error:", error);
        res.status(500).json({message: "Server error"});
    }
});


//Login route
router.post('/login', async(req, res) => {

    try{
        const {username, password} = req.body;

        //Find user in the database
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({ message: "User not found"});
        }

        //comparing password
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({ message: "Invalid credentials"});
        }

        //Generate token/session
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h"} // good practice, adding expiry
        );

        res.json({ message: "Login successful", token});
    
    } catch(error){
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;

