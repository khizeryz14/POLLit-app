import express from "express";
import pg from "pg";

const app = express();
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})