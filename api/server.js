const express = require("express")
const app = express()
const mysql = require("mysql2")
const cors = require ("cors");
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")


app.use(express.json ())
app.use(cors())
dotenv.config();


// connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

// check if connection works
db.connect((err) =>{
    if(err) return console.log("Error connecting to MYSQL")

    console.log("Connected to MYSQL as id:", db.threadId)
    //create a database
    db.query("CREATE DATABASE IF NOT EXISTS expense_tracker", (err, result) => {
        if(err) return console.log(err)
        console.log("database expense_tracker created/checked")

        //change/select our database
        db.changeUser({ database: "expense_tracker" }, (err, result) => {
            if(err) return console.log(err)

                console.log("expense_tracker has been selected and in use");

                //create users table for user authentication
                const usersTable = `
                    CREATE TABLE IF NOT EXISTS users  (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        username VARCHAR(50) NOT NULL,
                        password VARCHAR(255)
                    )
                `;
                db.query(usersTable, (err, result) => {
                    if(err) return console.log(err)

                        console.log("users table created/checked")
                })
        })
    })
})

//example route to serve index.html
//user registration route
//app.post
//app.get
//app.put
//app.delete
app.post("/api/register", async (req, res) =>{
    try {
        const users = "SELECT * FROM users WHERE email = ?"
        //check if user exists
        //so check if we have existing user in our db
        db.query(users, [req.body.email], (err, data) =>{
            if(data.length > 0) return res.status(409).json("User already exists");

            //hashing password
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)

            //so if we dont have then create user as new user
            const newUser = `INSERT INTO users(email, username, password) VALUES (?)`
            value = [ req.body.email,  req.body.username, hashedPassword ]
            //if by any chance something goes wrong
            db.query(newUser, [value], (err, data) => {
                if(err) return res.status(400).json("something went wrong")

                    return res.status(200).json("user created successfully")
            })
        })
    } 
    catch (error) {
       res.status(500).json("Internal Server Error") 
    }
})


//user login route



app.listen(3000, () => {
    console.log("server is running on PORT 3000.....")
})