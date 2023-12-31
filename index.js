
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
jwt = require('jsonwebtoken');

const data = require('./data.json');

// middle wares 
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Assignment 11's is running");
})



// console.log(process.env.AK_USER)

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.AK_USER}:${process.env.AK_PASS}@cluster0.bna95n2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// JWT verify 
const verifyJWT = (req, res, next) =>{
  const authorization = req.headers.authorization;
  // console.log(authorization)

  if(!authorization){
    return res.status(401).send({error: true, message: "Unauthorize access"});
  }

  const token = authorization.split(" ")[1];
  // console.log(token);

  jwt.verify(token, process.env.AK_ACCESS_TOKEN, (error, decoded)=>{
    if(error){
        res.status(403).send({error: true, message: "Unauthorize access"});
    }
    req.decoded = decoded;
    next();
  })
  
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();


    const toyCollection = client.db('myToysDB').collection("AllToy");
    const toyGallery = client.db('myToysDB').collection("gallery");

    // gallery 
    app.get("/gallery", async(req, res)=>{
        const query = {};
        const cursor = toyGallery.find({});
        const result = await cursor.toArray();
        res.send(result);
    })

    // app.get("/gallery", async (req, res) => {
    //   res.send(data);
    // })

    // Shop By Category 
    app.get("/toys", async(req, res) =>{
      const category = req.query?.category;
      // console.log(category);
      let query = {};
      if(category){
        query = {category}
      }

      const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);

    })

    // all toys 
    app.get("/all-toys", async (req, res) => {
      const sb = req.query?.name;
      const limit= parseInt(req.query.limit);
      let query ={};
      console.log(sb, limit)

      if(sb){
        query = {name: sb};
      }

      const cursor = toyCollection.find(query).limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    })


    // JWT token---------------
    //--------------------------
    app.post("/jsw", (req, res) =>{
      const user = req.body;
      console.log(user);

      const token = jwt.sign(user, process.env.AK_ACCESS_TOKEN, { expiresIn: "1h" })
      res.send({token});

    })


    //Single user myToys
    app.get("/my-toys", verifyJWT, async (req, res) => {
      const decoded = req.decoded;

      if(decoded?.email !== req.query?.email){
        return res.status(403).send({error: true, message: "Forbidden access"});
      }

      const sortInfo = req.headers.sort;
      console.log(sortInfo, decoded);
      let query = {};

      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      if (sortInfo == 0) {
        const cursor = toyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
      else {
        const cursor = toyCollection.find(query).sort({ price: sortInfo });
        const result = await cursor.toArray();
        res.send(result);
      }

    })

    //single toy by id
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)

      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    // update by id 
    app.post("/update/:id", async (req, res) => {
      const oldCar = req.body;
      const id = req.params.id;
      // console.log(oldCar)

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCar = {
        $set: {
          name: oldCar.name,
          quantity: oldCar.quantity,
          seller: oldCar.seller,
          sellerEmail: oldCar.sellerEmail,
          category: oldCar.category,
          details: oldCar.details,
          photo: oldCar.photo,
          price: oldCar.price,
          rating: oldCar.rating
        }
      }

      const result = await toyCollection.updateOne(filter, updatedCar, options);
      res.send(result);
    })

    // delete a car by id 
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const result = await toyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    })

    // post 
    app.post("/add-new-car", async (req, res) => {
      const car = req.body;
      // console.log(car);
      const result = await toyCollection.insertOne(car);
      // console.log(result)
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




app.listen(port, () => {
  console.log("Assignment 11's server is running on port: ", port);
})