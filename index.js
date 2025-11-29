const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

// MongoDB Client কনফিগারেশন
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
    // ১. প্রথমে কানেকশন তৈরি করা
    await client.connect();

    // ২. ডাটাবেস এবং কালেকশন সিলেক্ট করা
    const db = client.db("MovieMasterStudio");
    moviesCollection = db.collection("movies");
    usersCollection = db.collection("users");

    console.log("✅ Connected to MongoDB (MovieMasterStudio) successfully!");

    // ৩. ডাটাবেস কানেক্ট হওয়ার পরেই সার্ভার চালু হবে
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}
// রান ফাংশন কল করা
run().catch(console.dir);

// ==================
//   MOVIES ROUTES
// ==================

// সব মুভি পাওয়া (Search, Filter সহ)
app.get("/movies", async (req, res) => {
  try {
    const { search, genre, minRating, maxRating, email } = req.query;
    const query = {};

    // ইমেইল দিয়ে ফিল্টার
    if (email) query.email = email;

    // সার্চ ফাংশনালিটি
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // জেনরা ফিল্টার (Array বা String উভয়ের জন্য কাজ করবে)
    if (genre) {
      const genreArray = genre.split(",").map((g) => g.trim());
      query.$or = [
        { genre: { $in: genreArray } },
        { genre: { $regex: genreArray.join("|"), $options: "i" } },
      ];
    }

    // রেটিং ফিল্টার
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    const movies = await moviesCollection.find(query).toArray();
    res.send(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).send({ message: "Error fetching movies" });
  }
});

// নির্দিষ্ট একটি মুভি পাওয়া
app.get("/movies/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // ভুল ID চেক
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Movie ID" });
    }
    const movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
    res.send(movie);
  } catch (error) {
    res.status(500).send({ message: "Error fetching movie" });
  }
});

// নতুন মুভি যোগ করা
app.post("/movies", async (req, res) => {
  try {
    const newMovie = req.body;
    // ডাটা টাইপ ফিক্স করা
    newMovie.rating = Number(newMovie.rating);
    newMovie.duration = Number(newMovie.duration);
    newMovie.releaseYear = Number(newMovie.releaseYear);
    newMovie.createdAt = new Date(); // সর্টিংয়ের জন্য সময় রাখা হলো

    const result = await moviesCollection.insertOne(newMovie);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error adding movie" });
  }
});

// মুভি আপডেট করা
app.patch("/movies/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Movie ID" });
    }

    const updatedMovie = req.body;
    delete updatedMovie._id; // _id আপডেট করা যায় না, তাই রিমুভ করা হলো

    const query = { _id: new ObjectId(id) };
    const update = { $set: updatedMovie };

    const result = await moviesCollection.updateOne(query, update);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error updating movie" });
  }
});

// মুভি ডিলিট করা
app.delete("/movies/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Movie ID" });
    }
    const result = await moviesCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting movie" });
  }
});

// ==================
//   USERS ROUTES
// ==================

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

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid User ID" });
    }
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await usersCollection.findOne(query);

    if (existingUser) {
      return res.send({ message: "User already exists", insertedId: null });
    }

    const result = await usersCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error adding user" });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid User ID" });
    }
    const updatedUser = req.body;
    const query = { _id: new ObjectId(id) };
    const update = { $set: updatedUser };
    const result = await usersCollection.updateOne(query, update);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error updating user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid User ID" });
    }
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting user" });
  }
});

// রুট রাউট
app.get("/", (req, res) => {
  res.send("🎬 Movie Master Studio API is running...");
});
