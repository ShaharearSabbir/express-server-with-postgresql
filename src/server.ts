import dotenv from "dotenv";
import path from "path";
import express, { NextFunction, request, Request, Response } from "express";
import { Pool } from "pg";
import logger from "./helper/logger";
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

app.get("/", logger, (req: Request, res: Response) => {
  res.send("Hello trying!");
});

//*users CURD
app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `
        INSERT INTO users(name, email) VALUES($1, $2) RETURNING *
        `,
      [name, email]
    );

    res.status(201).json({
      message: "inserted successfully",
      success: true,
      data: result.rows[0],
    });

    console.log(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);

    res.status(200).json({
      success: true,
      message: "users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message, details: error });
  }
});

app.get("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

    console.log(result.rows);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: `user with id: ${id} is not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `user with id: ${id} is retrieved successfully`,
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message, details: error });
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
      [name, email, id]
    );

    console.log(result.rows);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: `user with id: ${id} is not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `user with id: ${id} is updated successfully`,
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message, details: error });
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);

    console.log(result);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: `user with id: ${id} is not found`,
      });
    } else {
      res.status(201).json({
        success: true,
        message: `user with id: ${id} is deleted successfully`,
        data: null,
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message, details: error });
  }
});

//* todos crud

app.post("/todos", async (req: Request, res: Response) => {
  const { title, user_id } = req.body;

  try {
    const result = await pool.query(
      `
    INSERT INTO todos(title, user_id) VALUES($1, $2) RETURNING *
    `,
      [title, user_id]
    );

    res.status(201).json({
      success: true,
      message: "todo created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
        SELECT * FROM todos
        `);

    res.status(200).json({
      success: true,
      message: "todos retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: true, message: error.message });
  }
});

//* not found route
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `${req.path} is not a valid route` });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
