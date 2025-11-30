import dotenv from "dotenv";
import path from "path";
import express, { Request, Response } from "express";
import { Pool } from "pg";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();
const port = 5000;

// inBuild Middleware
app.use(express.json());
// app.use(express.urlencoded()); //for formdata

// DB
const pool = new Pool({
  connectionString: process.env.CONNECTION_STR as string,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
};

initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello trying!");
});

app.post("/", (req: Request, res: Response) => {
  console.log(req.body);

  res.status(201).json({
    success: true,
    message: "api working",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
