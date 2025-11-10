const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://Movie-Master-Studio:SEY6S8G2mRlDu6vz@cluster0.3ezpklr.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let moviesCollection;

async function run() {
  await client.connect();
  const db = client.db("movieMasterStudio");
  moviesCollection = db.collection("movies");

  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

run().catch(console.dir);

// Get all movies
app.get("/movies", async (req, res) => {
  // const moviefield = { title: 1, director: 1, rating: 1 }; 
  // const cursor = moviesCollection.find().sort({ rating: -1 }).skip(5).limit(2).project(moviefield);
  const cursor = moviesCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// Get single movie by ID
app.get("/movies/:id", async (req, res) => {
  const movie = await moviesCollection.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(movie);
});

// Add a new movie
app.post("/movies", async (req, res) => {
  const result = await moviesCollection.insertOne(req.body);
  res.send(result);
});

// Update a movie
app.patch("/movies/:id", async (req, res) => {
  const id = req.params.id;
  const updatedMovie = req.body;
  const query = { _id: new ObjectId(id) };
  const update = {
    $set: {
      title: updatedMovie.title,
      director: updatedMovie.director,
    },
  };
  const result = await moviesCollection.updateOne(query, update);
  res.send(result);
});

// Delete a movie
app.delete("/movies/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await moviesCollection.deleteOne(query);
  res.send(result);
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Smart Server is Running on port ${port}`);
});
