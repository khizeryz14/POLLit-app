import 'dotenv/config';

import express from "express";
import {Pool} from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import authenticateToken from "./middleware/authMiddleware.js";
import { optionalAuth } from "./middleware/optionalAuthMiddleware.js";
import { generalLimiter, createLimiter, voteLimiter } from "./middleware/rateLimitMiddleware.js";
import { validateFields } from "./middleware/validatorMiddleware.js";

const app = express();
const PORT = process.env.PORT;

const saltRounds = Number(process.env.SALT_ROUNDS);

export const JWT_SECRET = process.env.JWT_SECRET

app.use(cors({
    origin: "https://pollit-app.vercel.app/",
    credentials: true
}
));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon/hosted Postgres
  },
});

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

app.get("/polls", generalLimiter, optionalAuth, async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const sort = req.query.sort || "new";

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }

    const PAGE_SIZE = 10;
    const limit = PAGE_SIZE;
    const offset = (page - 1) * PAGE_SIZE;

    let orderBy;
    switch (sort) {
      case "trending":
        orderBy = "total_votes DESC";
        break;
      case "ending":
        orderBy = "p.expires_at ASC";
        break;
      default:
        orderBy = "p.created_at DESC";
    }

    let searchCondition = "";
    let values = [req.user || null, limit, offset];
    let paramIndex = values.length + 1;

    if (search) {
      searchCondition = `
        AND (
          p.title ILIKE $${paramIndex}
          OR p.description ILIKE $${paramIndex}
        )
      `;
      values.push(`%${search}%`);
    }

    /* 🔥 FINAL QUERY */
    const query = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.image_link,
        p.expires_at,
        p.created_by,
        u.username,

        EXISTS (
          SELECT 1
          FROM votes v2
          WHERE v2.poll_id = p.id
          AND v2.user_id = $1
        ) AS has_voted,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', o.id,
              'text', o.text,
              'votes', COALESCE(v_counts.count, 0)
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) AS options,

        COALESCE(SUM(v_counts.count), 0)::int AS total_votes

      FROM polls p
      JOIN users u ON u.id = p.created_by
      LEFT JOIN options o ON o.poll_id = p.id

      LEFT JOIN (
        SELECT option_id, COUNT(*)::int AS count
        FROM votes
        GROUP BY option_id
      ) v_counts ON v_counts.option_id = o.id

      WHERE 1=1
      ${searchCondition}

      GROUP BY p.id, u.username

      ORDER BY ${orderBy}

      LIMIT $2 OFFSET $3;
    `;

    const results = await db.query(query, values);

    const polls = results.rows.map(p => ({
      ...p,
      timeLeft: calculateTimeLeft(p.expires_at)
    }));

    return res.status(200).json({
      polls,
      page,
      hasMore: polls.length === PAGE_SIZE
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch polls" });
  }
});

app.get("/polls/:pollId", generalLimiter, optionalAuth, async (req, res) => {
    
  try {
    const pollId = req.params.pollId;

    const query = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.image_link,
        p.expires_at,
        p.created_by,
        u.username,

        EXISTS (
            SELECT 1
            FROM votes v2
            WHERE v2.poll_id = p.id
            AND v2.user_id = $2
        ) AS has_voted,

        COALESCE(
            json_agg(
            DISTINCT jsonb_build_object(
                'id', o.id,
                'text', o.text,
                'votes', COALESCE(v_counts.count, 0)
            )
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'
        ) AS options,

        COALESCE(SUM(v_counts.count), 0)::int AS total_votes

        FROM polls p

        JOIN users u ON u.id = p.created_by

        LEFT JOIN options o ON o.poll_id = p.id

        LEFT JOIN (
        SELECT option_id, COUNT(*)::int AS count
        FROM votes
        GROUP BY option_id
        ) v_counts ON v_counts.option_id = o.id

        WHERE p.id = $1

        GROUP BY p.id, u.username;
    `;

    const response = await db.query(query, [pollId, req.user]);

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const poll = {
      ...response.rows[0],
      timeLeft: calculateTimeLeft(response.rows[0].expires_at)
    };

    res.status(200).json({ poll });

  } catch (err) {

    console.error(err);

    res.status(500).json({ "message": "Server error" });
  }
});

app.get("/polls/user/:username", generalLimiter, optionalAuth, async (req, res) => {
  const { username } = req.params;

  try {
    const page = parseInt(req.query.page) || 1;

    if (page < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }

    const PAGE_SIZE = 10;
    const limit = PAGE_SIZE;
    const offset = (page - 1) * PAGE_SIZE;

    const query = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.image_link,
        p.expires_at,
        p.created_by,
        u.username,

        /* has_voted */
        EXISTS (
          SELECT 1
          FROM votes v2
          WHERE v2.poll_id = p.id
          AND v2.user_id = $1
        ) AS has_voted,

        /* options */
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', o.id,
              'text', o.text,
              'votes', COALESCE(v_counts.count, 0)
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) AS options,

        /* total votes */
        COALESCE(SUM(v_counts.count), 0)::int AS total_votes

      FROM polls p
      JOIN users u ON u.id = p.created_by
      LEFT JOIN options o ON o.poll_id = p.id

      LEFT JOIN (
        SELECT option_id, COUNT(*)::int AS count
        FROM votes
        GROUP BY option_id
      ) v_counts ON v_counts.option_id = o.id

      WHERE u.username = $2

      GROUP BY p.id, u.username

      ORDER BY p.created_at DESC

      LIMIT $3 OFFSET $4;
    `;

    const results = await db.query(query, [
      req.user || null,
      username,
      limit,
      offset
    ]);

    const polls = results.rows.map(p => ({
      ...p,
      timeLeft: calculateTimeLeft(p.expires_at)
    }));

    return res.status(200).json({
      polls,
      page,
      hasMore: polls.length === PAGE_SIZE
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user polls" });
  }
});


app.post("/polls", createLimiter, authenticateToken, async (req, res) => {

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
            console.error(err)
            return res.status(500).json({"message": "Server error"})
        }

    }


})

app.delete("/polls/:pollId", createLimiter, authenticateToken, async (req, res) => {
    const {pollId} = req.params;

    try{
        await db.query("BEGIN")
        const creatorResults = await db.query("SELECT created_by FROM polls WHERE id = $1", [pollId]);

        if(creatorResults.rows.length === 0){
            await db.query("ROLLBACK");
            return res.status(404).json({"message":"Invalid Poll ID"});
        }

        if(creatorResults.rows[0].created_by === req.user){
            await db.query("DELETE FROM votes WHERE poll_id = $1", [pollId])
            await db.query("DELETE FROM options WHERE poll_id = $1", [pollId]);
            await db.query("DELETE FROM polls WHERE id = $1", [pollId]);
            await db.query("COMMIT");

            return res.status(200).json({"success": true, pollId})
        }else{
            await db.query("ROLLBACK");
            return res.status(403).json({"message":"Access denied"});
        }
    }
    catch(err){
        await db.query("ROLLBACK")
        return res.status(500).json({"message":"Server error"});
    }
})

app.patch("/polls/:pollId", createLimiter, authenticateToken, async (req, res) => {

    const {pollId} = req.params;
    const {title, description, image, options} = req.body;

    if(!title || !options){
        return res.status(400).json({"message":"Invalid request parameters"})
    }

    try{
        await db.query("BEGIN")
        const creatorResults = await db.query("SELECT created_by FROM polls WHERE id = $1", [pollId]);

        if(creatorResults.rows.length === 0){
            await db.query("ROLLBACK");
            return res.status(404).json({"message":"Invalid Poll ID"});
        }
        
        if(creatorResults.rows[0].created_by === req.user){

            const voteCheck = await db.query(
                "SELECT COUNT(*) FROM votes WHERE poll_id = $1",
                [pollId]
            );

            if (Number(voteCheck.rows[0].count) > 0) {
                await db.query("ROLLBACK");
                return res.status(400).json({ message: "Cannot edit after votes" });
            }


            const pollResults = await db.query(`UPDATE polls
                                                        SET
                                                            title = $1,
                                                            description = $2,
                                                            image_link = $3
                                                        WHERE id = $4
                                                        RETURNING id, title, description, image_link`, 
                                                        [title, description, image, pollId]);

            const insertedOptions = [];    
            
            for(const option of options){
                    const optionResult = await db.query(`UPDATE options
                                                            SET 
                                                                text = $1
                                                            WHERE id = $2
                                                            RETURNING id, text`, 
                                                            [option.text.trim(), option.id]);

                    insertedOptions.push(optionResult.rows[0])
            } 

            await db.query("COMMIT");

            const poll = {
                ...pollResults.rows[0],
                options: insertedOptions
            }

            return res.status(200).json({poll});
        }
        else{
            await db.query("ROLLBACK")
            return res.status(403).json({"message":"Unauthorized to edit poll"});
        }
    }
    catch(err){
        await db.query("ROLLBACK")
        return res.status(500).json({"message":"Server error"});
    }
})

app.post("/votes", voteLimiter, authenticateToken, async (req, res) => {
    const pollId = req.body.pollId;
    const user = req.user; //authenticateToken attaches userId as 'user' on the request
    const optionId = req.body.optionId;
    
    if(!pollId || !optionId){
        return res.status(400).json({"message":"Invalid option or poll selected"});
    }
    
    try{
        await db.query("BEGIN")
        const pollCheck = await db.query("SELECT expires_at from polls WHERE id = $1", [pollId]);
        const expiresAt = new Date(pollCheck.rows[0].expires_at);

        if (expiresAt <= new Date()) {
            await db.query("ROLLBACK");
            return res.status(400).json({ message: "Poll has ended" });
        }

        const existingVote = await db.query("SELECT COUNT(*)::int AS entries from votes WHERE poll_id = $1 AND user_id = $2", [pollId, user]);

        if (existingVote.rows[0].entries > 0 ){
            await db.query("ROLLBACK")
            return res.status(400).json({"message": "Already voted on this poll"});
        }

        const optionCheck = await db.query("SELECT id FROM options WHERE poll_id = $1 AND id = $2",[pollId, optionId]);

        if(optionCheck.rows.length === 0){
            await db.query("ROLLBACK");
            return res.status(400).json({"message": "Invalid option for this poll"});
        }

        const voteResult = await db.query("INSERT INTO votes(poll_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING id",[pollId, optionId, user]);
        
        const results = await db.query(`
            SELECT
            o.id,
            COUNT(v.id)::int AS votes
            FROM options o
            LEFT JOIN votes v
            ON v.option_id = o.id
            WHERE o.poll_id = $1
            GROUP BY o.id
            `, [pollId]);
            
            const totalVotes = await db.query(
                "SELECT COUNT(*)::int AS total FROM votes WHERE poll_id = $1",
                [pollId]
            );
            
        await db.query("COMMIT");
        
        res.status(201).json({
            vote: { id: voteResult.rows[0].id,
                    pollId,
                    optionId,  
        },
            poll: {
                totalVotes: totalVotes.rows[0].total,
                options: results.rows
            }
        });
        
    }
    catch(err){
        await db.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({"message": "Server error"});
    }
})

app.post("/auth/login", generalLimiter, async (req, res) => {
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
                sameSite: "None",
                secure: true,
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

app.post("/auth/register", createLimiter, validateFields, async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;

    const existing = await db.query(
    `SELECT 1 FROM users WHERE email = $1 OR username = $2`,
    [email, username]
    );

    if (existing.rows.length > 0) {
    return res.status(400).json({
        message: "Email or username already in use"
    });
    }
    
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

app.get("/auth/me", generalLimiter, authenticateToken, async (req, res) => {
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

app.post("/auth/logout", generalLimiter, (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/"
    });
    
    return res.json({"message": "Logged out"});
})

app.get("/user/:username", generalLimiter, optionalAuth, async (req, res) => {
    const username = req.params.username;

    try{
        const result = await db.query(`SELECT u.id,
                                              u.username,
                                              u.email,
                                              u.created_at,
                                              COUNT(p.id) AS poll_count
                                            FROM users u
                                            LEFT JOIN polls p ON p.created_by = u.id
                                            WHERE u.username = $1
                                            GROUP BY u.id`, [username]);

        if(result.rows.length === 0){
            return res.status(404).json({"message":"User not found"});
        } 
        
        const user = {
            username: result.rows[0].username,
            created_at: result.rows[0].created_at,
            pollCount: Number(result.rows[0].poll_count)
        };

        if(result.rows[0].id === req.user){
            user.email = result.rows[0].email;
        }
        
        return res.status(200).json({user})
    }
    catch(err){
        return res.status(400).json({"message": "Server error"});
    }
})