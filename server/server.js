import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
const PORT = 5000;

const saltRounds = 10;

app.use(express.json());

app.use(express.urlencoded({extended: true}));
app.use(cors());

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "POLLit-app",
    password: "admin",
    port: 5432,
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

app.post("/votes", async (req, res) => {

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

        return res.status(201).json({user});

    }catch(error){
        return res.status(500).json({"error":"Server error"})
    }
})