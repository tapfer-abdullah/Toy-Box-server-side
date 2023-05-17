
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middle wares 
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Assignment 11's is running");
})

app.listen(port, ()=>{
    console.log("Assignment 11's server is running on port: ", port);
})