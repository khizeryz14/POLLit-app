import dotenv from "dotenv"
dotenv.config();

import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import authenticateToken from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT;

const saltRounds = Number(process.env.SALT_ROUNDS);

export const JWT_SECRET = process.env.JWT_SECRET

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}
));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

db.connect();

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

app.get("/polls", async (req, res) => {
    const results = await db.query("SELECT * from users");
    console.log("fetched")
    res.send(results.rows);
})

app.post("/polls", async (req, res) => {
    const pollTitle = req.body.title;
    const pollDesc = req.body.desc || null;
    const pollOptions = req.body.options;
})

app.post("/votes", authenticateToken, async (req, res) => {

})

app.post("/auth/login", async (req, res) => {
    try{
        const {email, password} = req.body;
        const query = 'SELECT id, username, email, password_hash FROM users WHERE email = $1';
        const queryResponse = await db.query(query, [email]);
        if(queryResponse.rows[0] == null){
            console.error("Email not registered!")
            return res.status(401).json({"message":"Invalid"});
        }


        if(await bcrypt.compare(password, queryResponse.rows[0].password_hash)){

                const user = {
                    "id":queryResponse.rows[0].id,
                    "username":queryResponse.rows[0].username,
                    "email":queryResponse.rows[0].email
            };

            console.log(`${user.username} with ${user.email} logged in!`)

            const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "7d"})
            

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });


            return res.status(200).json({user})
        }
        else{
            console.error("Invalid password!")
            return res.status(401).json({"message":"Invalid"})
        }
    }
    catch(err){
        return res.status(500).json({"message":"Server error"});
    }

})

app.post("/auth/register", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
    const query = `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id`;

    try{
        const idRes = await db.query(query, [email, username, hashedPassword]);

        const user = {
            id: idRes.rows[0].id,
            username,
            email
        };

        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "7d"});

        console.log(`${user.username} with ${user.email} registered!`)

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({user});

    }catch(error){
        return res.status(500).json({"message":"Server error"})
    }
})

app.get("/auth/me", authenticateToken, async (req, res) => {
    try{
        const query = 'SELECT id, username, email FROM users WHERE id = $1';
        const results = await db.query(query, [req.user]);

        if(results.rows.length === 0){
            return res.status(401).json({"message": "User does not exist"});
        }
        else{
            const user = {
                id: results.rows[0].id,
                username: results.rows[0].username,
                email: results.rows[0].email,
            };

            return res.status(200).json({user});
        }
    }
    catch(err){
        return res.status(500).json({"message": "Authentication error"});
    }
})

app.post("/auth/logout", (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/"
    });
    
    return res.json({"message": "Logged out"});
})