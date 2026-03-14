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

function calculateTimeLeft(expiresAt){
    const now = new Date();
    const difference = new Date(expiresAt) - now;

    if(difference<=0){
        return "Ended";
    }

    const hours = Math.floor(difference / (1000*60*60));

    if(hours < 24){
        return `${hours}h left`;
    }

    const days = Math.floor(hours/24);

    return `${days}d left`;
}

app.get("/polls", async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;

        if(page < 1){
            return res.status(400).json({"message": "Invalid page number"})
        }

        const PAGE_SIZE = 10;

        const limit = PAGE_SIZE;
        const offset = (page - 1) * PAGE_SIZE;

        const sort = req.query.sort || "new";

        let orderBy;

        switch (sort) {
            case "trending":
                orderBy = "total_votes DESC";
                break;

            case "ending":
                orderBy = "p.expires_at ASC";
                break;

            case "user":
                orderBy = "u.username ASC";
                break;

            default:
                orderBy = "p.created_at DESC"; // newest
        }

        //[QUERY]

        const query = `SELECT
                        p.id,
                        p.title,
                        p.description,
                        p.image_link,
                        p.expires_at,
                        u.username,

                        COUNT(v.id) AS total_votes,

                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', o.id,
                                'text', o.text,
                                'votes', o.vote_count
                            )
                        ) AS options

                    FROM polls p

                    JOIN users u
                    ON p.created_by = u.id

                    LEFT JOIN (
                        SELECT
                            o.id,
                            o.poll_id,
                            o.text,
                            COUNT(v.id) AS vote_count
                        FROM options o
                        LEFT JOIN votes v
                        ON v.option_id = o.id
                        GROUP BY o.id
                    ) o
                    ON o.poll_id = p.id

                    LEFT JOIN votes v
                    ON v.option_id = o.id

                    GROUP BY p.id, u.username

                    ORDER BY ${orderBy}

                    LIMIT $1
                    OFFSET $2`;

        const results = await db.query(query, [limit, offset]);

        const polls = results.rows.map(p => ({
            ...p,
            timeLeft: calculateTimeLeft(p.expires_at)
        }))

        return res.status(200).json({
            polls,
            page,
            hasMore: polls.length === PAGE_SIZE
        });
    }
    catch(err){
        console.error(err)
        res.status(500).json({"message": "Failed to fetch polls"});
    }
})

app.post("/polls", authenticateToken, async (req, res) => {

    const pollTitle = req.body.title;
    const pollDesc = req.body.desc || null;
    const pollOptions = req.body.options;
    const createdBy = req.user;
    const imageLink = req.body.image || null;
    
    if(!pollTitle || !Array.isArray(pollOptions) || pollOptions.length < 2){ //plus some other essential validation checks
        return res.status(400).json({"message": "Invalid form submission"});
    }
    else{
        try{
            await db.query("BEGIN")
            const pollResult = await db.query(`INSERT INTO 
                polls(title, description, created_by, image_link, expires_at) 
                VALUES($1, $2, $3, $4, NOW() + INTERVAL '7 days')
                RETURNING id, title, description, expires_at`, [pollTitle, pollDesc, createdBy, imageLink]);

            const insertedOptions = [];    
            
            for(const option of pollOptions){
                    const optionResult = await db.query(`INSERT INTO 
                    options(poll_id, text)
                    VALUES($1, $2) RETURNING id, text`, [pollResult.rows[0].id, option.trim()]);

                    insertedOptions.push(optionResult.rows[0])
            }    

            await db.query("COMMIT");

            const poll = {
                ...pollResult.rows[0],
                options : insertedOptions
            };

            return res.status(201).json({poll});

        }catch(err){ //insert failure
            await db.query("ROLLBACK")
            console.log(err)
            return res.status(500).json({"message": "Server error"})
        }

    }


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