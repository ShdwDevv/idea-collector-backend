const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();
const app = express();
app.use(bodyParser.json());

console.log(process.env.CORS_ORIGIN);

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});
// Fix for Mongoose deprecation warning
mongoose.set('strictQuery', false); // or true, depending on your needs

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB connected successfully!");
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Name model
const Name = mongoose.model("Name", new mongoose.Schema({ name: String }));

// Endpoint to add a name
app.post("/add-name", async (req, res) => {
    console.log("Received request body:", req.body); // Debugging line
    const { name } = req.body;
    if (name) {
        try {
            const newName = new Name({ name });
            await newName.save();
            res.status(200).send({ message: "Name added successfully" });
        } catch (error) {
            console.error("Error saving name:", error); // Log any error in saving the name
            res.status(500).send({ message: "Error saving name" });
        }
    } else {
        res.status(400).send({ message: "Name is required" });
    }
});

// Endpoint to get all names
app.get("/get-names", async (req, res) => {
    const names = await Name.find();
    res.json(names.map(name => name.name)); // Send only the name field
});

// Endpoint to remove a name (if necessary)
app.post("/remove-name", async (req, res) => {
    const { name } = req.body;
    const deletedName = await Name.findOneAndDelete({ name });
    if (deletedName) {
        res.status(200).json({ message: "Name removed successfully" });
    } else {
        res.status(404).json({ error: "Name not found" });
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
