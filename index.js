
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

const data = require('./data.json');

// middle wares 
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Assignment 11's is running");
})



// console.log(process.env.AK_USER)

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.AK_USER}:${process.env.AK_PASS}@cluster0.bna95n2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db('myToysDB').collection("AllToy");
    const toyGallery = client.db('myToysDB').collection("gallery");

    // gallery 
    // app.get("/gallery", async(req, res)=>{
    //     const query = {};
    //     const cursor = toyGallery.find({});
    //     const result = await cursor.toArray();
    //     res.send(result);
    // })

    app.get("/gallery", async(req, res)=>{
        res.send(data);
    })

    // all toys 
    app.get("/all-toys", async(req, res)=>{
        const query = {};
        const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    //Single user myToys
    app.get("/my-toys", async(req, res) =>{
      let query = {};
      
      if(req.query?.email){
        query = {sellerEmail: req.query.email};
      }
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray();
      console.log(query, result)

      res.send(result);
    })

    // post 
    app.post("/add-new-car", async(req, res)=>{
        const car = req.body;
        console.log(car);
        const result = await toyCollection.insertOne(car);
        console.log(result)
        res.send(result)

    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, ()=>{
    console.log("Assignment 11's server is running on port: ", port);
})