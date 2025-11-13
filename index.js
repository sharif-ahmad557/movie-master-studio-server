const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;


// MongoDB Client
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
  try {
    await client.connect();
    const db = client.db("movieMasterStudio");
    moviesCollection = db.collection("movies");
    usersCollection = db.collection("users");
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}
run();

/* ========================= 🎬 MOVIES ROUTES ========================= */

// ✅ Get all movies (with optional filtering)
app.get("/movies", async (req, res) => {
  try {
    const { genre, minRating, maxRating, email } = req.query;
    const query = {};

    // 🔹 Filter by email (optional)
    if (email) query.email = email;

    // 🔹 Genre filter (works for both array & string)
    if (genre) {
      const genreArray = genre.split(",").map((g) => g.trim());
      query.$or = [
        { genre: { $in: genreArray } }, // যদি array হয়
        { genre: { $regex: genreArray.join("|"), $options: "i" } }, // যদি string হয়
      ];
    }

    // 🔹 Rating filter
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    console.log("🔍 Query:", query);

    const movies = await moviesCollection.find(query).toArray();
    res.send(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).send({ message: "Error fetching movies" });
  }
});

// ✅ Get single movie by ID
app.get("/movies/:id", async (req, res) => {
  try {
    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(movie);
  } catch (error) {
    res.status(500).send({ message: "Error fetching movie" });
  }
});

// ✅ Add new movie
app.post("/movies", async (req, res) => {
  try {
    const result = await moviesCollection.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error adding movie" });
  }
});

// ✅ Update movie
app.patch("/movies/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedMovie = req.body;
    delete updatedMovie._id;

    const query = { _id: new ObjectId(id) };
    const update = { $set: updatedMovie };

    const result = await moviesCollection.updateOne(query, update);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error updating movie" });
  }
});

// ✅ Delete movie
app.delete("/movies/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await moviesCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting movie" });
  }
});

/* ========================= 👤 USERS ROUTES ========================= */

// ✅ Get all users
app.get("/users", async (req, res) => {
  try {
    const email = req.query.email;
    const query = {};
    if (email) query.email = email;

    const users = await usersCollection.find(query).toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: "Error fetching users" });
  }
});

// ✅ Get single user
app.get("/users/:id", async (req, res) => {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user" });
  }
});

// ✅ Add user
app.post("/users", async (req, res) => {
  try {
    const result = await usersCollection.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error adding user" });
  }
});

// ✅ Update user
app.patch("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUser = req.body;
    const query = { _id: new ObjectId(id) };
    const update = { $set: updatedUser };
    const result = await usersCollection.updateOne(query, update);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error updating user" });
  }
});

// ✅ Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting user" });
  }
});

/* ========================= 🏠 ROOT ========================= */
app.get("/", (req, res) => {
  res.send(" Movie Master Studio API is running...");
});

app.listen(port, () => {
  console.log(`🚀 Smart Server is running on port ${port}`);
});
