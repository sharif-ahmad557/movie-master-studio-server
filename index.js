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
let usersCollection;

async function run() {
  await client.connect();
  const db = client.db("movieMasterStudio");
  moviesCollection = db.collection("movies");
  usersCollection = db.collection("users");

  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

run().catch(console.dir);

/* ============ Movies Routes ============== */

// Get all movies
app.get("/movies", async (req, res) => {
  const email = req.query.email;
  let query = {};
  if (email) query.email = email;

  const cursor = moviesCollection.find(query);
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
    $set: { title: updatedMovie.title, director: updatedMovie.director },
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

/* =========== Users Routes =========== */

// Get all users
app.get("/users", async (req, res) => {
  const email = req.query.email;
  let query = {};
  if (email) query.email = email;

  const cursor = usersCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// Get single user by ID
app.get("/users/:id", async (req, res) => {
  const user = await usersCollection.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(user);
});

// Add a new user
app.post("/users", async (req, res) => {
  const result = await usersCollection.insertOne(req.body);
  res.send(result);
});

// Update a user
app.patch("/users/:id", async (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  const query = { _id: new ObjectId(id) };
  const update = {
    $set: {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      age: updatedUser.age,
      photo: updatedUser.photo,
    },
  };
  const result = await usersCollection.updateOne(query, update);
  res.send(result);
});

// Delete a user
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Smart Server is Running on port ${port}`);
});
