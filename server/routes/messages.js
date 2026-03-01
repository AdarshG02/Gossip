import express from "express";
import { sendMessage, getMessages } from "../controllers/messages.controller.js";
import handleAuth from "../middleware/handleAuth.js";

const router = express.Router();

router.post("/messages", handleAuth, sendMessage);
router.get("/messages/:userId", handleAuth, getMessages);

export default router;