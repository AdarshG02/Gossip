import express from "express";
import User from "../models/users.model.js";
import handleAuth from "../middleware/handleAuth.js";

const router = express.Router();

router.get("/users", handleAuth, async(req, res) => {

    try{
        const loggedInUserId = req.user.id;

        const users = await User.find({
            _id: { $ne: loggedInUserId }
        }).select("_id username");

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;