const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongodb = require('mongodb');
const methodOverride = require("method-override");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");


const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

let db; // MongoDB connection reference

// Connect to MongoDB
mongodb.MongoClient.connect(mongoURI)
  .then(client => {
    console.log("MongoDB connected");
    db = client.db("student_management_system"); // Assign database reference to 'db' variable
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if MongoDB connection fails
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/students", (req, res) => {
  db.collection("students").find().toArray()
    .then(students => {
      res.render("index", { students });
    })
    .catch(err => res.status(500).json({ error: "An error occurred while retrieving students", detail: err }));
  });

app.get("/students/new", (req, res) => {
  res.render("add_student");
});


app.post("/students", (req, res) => {
  const student = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    birthDate: new Date(req.body.birthDate)
  };


  db.collection("students").insertOne(student)
    .then(result => res.redirect("/students"))
    .catch(err => res.status(500).json({ error: "An error occurred while inserting students", detail: err }));
});

app.get("/students/:id/edit", (req, res) => {
  const { id } = req.params;
  const objectID = new mongodb.ObjectID(id);

  db.collection("students").findOne({ _id:objectID })
    .then(student => {
      if(!student){
       return res.status(404).json({ error: "Student not found.", detail: err }); 
      }
      res.render("edit_student", { student });
    })
    .catch(err => res.status(500).json({ error: "An error occurred while retrieving students", detail: err }));
  });

  
  app.put("/students/:id", (req, res) => {
    const { id } = req.params;
    const objectID = new mongodb.ObjectID(id);

    const updatestudent = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      birthDate: new Date(req.body.birthDate)
    };

    db.collection("students").updateOne({ _id:objectID }, { $set: updatestudent})
      .then(result => {
        if(result.matchedCount === 0){
         return  res.status(404).json({ error: "Student not found.", detail: err }); 
        }
        res.redirect("/student");
      })
      .catch(err => res.status(500).json({ error: "An error occurred while updating student", detail: err }));
    });

    app.delete("/students/:id", (req, res) => {
      const { id } = req.params;
      const objectID = new mongodb.ObjectID(id);
  
      db.collection("students").deleteOne({ _id:objectID }, )
        .then(result => {
          if(result.deletedCount === 0){
           return  res.status(404).json({ error: "Student not found.", detail: err }); 
          }
          res.redirect("/student");
        })
        .catch(err => res.status(500).json({ error: "An error occurred while deleting student", detail: err }));
      });


app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});


