const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpsgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Creative Agency");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const usersCollection = client.db(process.env.DB_NAME).collection("users");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
  const servicesCollection = client
    .db(process.env.DB_NAME)
    .collection("services");
  const adminsCollection = client.db(process.env.DB_NAME).collection("admins");

  app.post("/registration", (req, res) => {
    const { name, email } = req.body;

    usersCollection
      .insertOne({
        name,
        email,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/login", (req, res) => {
    const { email } = req.query;
    usersCollection.find({ email: email }).toArray((err, results) => {
      res.send(results[0]);
    });
  });

  app.post("/services", (req, res) => {
    const file = req.files.file;
    const { title, description, price, category } = req.body;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    servicesCollection
      .insertOne({
        title,
        description,
        price,
        category,
        image,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/getServices", (req, res) => {
    servicesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/order", (req, res) => {
    const { name, email, address, phone, title, id } = req.body;

    ordersCollection
      .insertOne({
        name,
        email,
        address,
        phone,
        title,
        id,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/feedback", (req, res) => {
    const { name, email, position, review, img } = req.body;

    feedbacksCollection
      .insertOne({
        name,
        email,
        position,
        review,
        img,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/getOrders", (req, res) => {
    ordersCollection.find({}).toArray((err, results) => {
      res.send(results);
    });
  });

  app.get("/my-services", (req, res) => {
    const email = req.query.email;
    ordersCollection.find({ email: email }).toArray((err, results) => {
      res.send(results);
    });
  });

  app.get("/my-service-details", (req, res) => {
    const id = req.query.id;
    servicesCollection.find({ _id: ObjectId(id) }).toArray((err, results) => {
      res.send(results[0]);
      // console.log(results[0]);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const { admin } = req.body;
    adminsCollection.insertOne({ admin }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/admins", (req, res) => {
    adminsCollection.find({}).toArray((err, results) => {
      res.send(results);
    });
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
