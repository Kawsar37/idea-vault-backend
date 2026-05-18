const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const uri = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json());

PORT = 5000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = await client.db("idea-vault");
    const ideaCollection = db.collection("ideas");

    app.get("/ideas", async (req, res) => {
      const result = await ideaCollection.find().toArray();
      res.json(result);
    });

    app.get("/home-ideas", async (req, res) => {
      const result = await ideaCollection
        .aggregate([
          {
            $limit: 6,
          },
        ])
        .toArray();
      res.send(result);
    });

    app.get("/idea/:id", async (req, res) => {
      const { id } = req.params;
      const result = await ideaCollection
        .aggregate([
          {
            $match: { _id: new ObjectId(id) },
          },
        ])
        .toArray();
      res.send(result);
    });

    app.post("/idea", async (req, res) => {
      const ideaData = req.body;
      const result = await ideaCollection.insertOne(ideaData);

      res.json(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log("server running on port 8000");
});

app.get("/", (req, res) => {
  res.send("Server Is Running...");
});
