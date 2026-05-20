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
    const commentCollection = db.collection("comment");

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
      res.json(result);
    });

    app.get("/ideas/:userId", async (req, res) => {
      const { userId } = await req.params;
      const result = await ideaCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    app.get("/idea/:id", async (req, res) => {
      const { id } = await req.params;
      const result = await ideaCollection
        .aggregate([
          {
            $match: { _id: new ObjectId(id) },
          },
        ])
        .toArray();
      res.json(result);
    });

    app.delete("/ideas/:id", async (req, res) => {
      const { id } = await req.params;
      const result = await ideaCollection.deleteOne({ _id: new ObjectId(id) });

      res.json(result);
    });

    app.post("/idea", async (req, res) => {
      const ideaData = req.body;
      const result = await ideaCollection.insertOne(ideaData);

      res.json(result);
    });

    app.post("/comment", async (req, res) => {
      const commentData = req.body;
      const result = await commentCollection.insertOne(commentData);

      res.json(result);
    });

    app.delete("/comment/:commentId", async (req, res) => {
      const { commentId } = await req.params;
      const result = await commentCollection.deleteOne({
        _id: new ObjectId(commentId),
      });
      res.json(result);
    });

    app.patch("/comment/:commentId", async (req, res) => {
      const { commentId } = await req.params;
      const updatedData = await req.body;
      const result = await commentCollection.updateOne(
        {
          _id: new ObjectId(commentId),
        },
        {
          $set: updatedData,
        },
      );
      res.json(result);
    });

    app.patch("/idea/:ideaId", async (req, res) => {
      const { ideaId } = await req.params;
      const updatedData = await req.body;
      const result = await ideaCollection.updateOne(
        {
          _id: new ObjectId(ideaId),
        },
        {
          $set: updatedData,
        },
      );
      res.json(result);
    });

    app.get("/my-comment/:userId", async (req, res) => {
      const { userId } = await req.params;
      const result = await commentCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    app.get("/comment/:ideaId", async (req, res) => {
      const { ideaId } = await req.params;
      const result = await commentCollection.find({ ideaId: ideaId }).toArray();
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
