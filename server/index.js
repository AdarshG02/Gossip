import express from "express";
import http from "http";

import { initSocket } from './socket/socket.js';
import cors from "cors";

import authRoute from './routes/auth.js';
import usersRoute from './routes/users.js';
import messageRoute from './routes/messages.js';


import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

//DB connection
import connectDb from './models/DB/index.js';
connectDb();


const app = express();
const server = http.createServer(app);
initSocket(server);

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoute); //Login/Signup
app.use('/api', usersRoute); 
app.use('/api', messageRoute);


server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});