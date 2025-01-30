require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    details: { type: String },
    description: { type: String, required: true },
    image: { type: String, required: true },
});

const signupschema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    number:{type:String},
});

const registerSchema = new mongoose.Schema({
  name:{type:String,required:true},
  college:{type:String,required:true},
  event:{type:String,required:true},
  number:{type:String,required:true},
  email:{type:String,required:true},
})

const Event = mongoose.model("Event", eventSchema);
const User = mongoose.model("User", signupschema);
const Register = mongoose.model("Register",registerSchema);

app.post("/register", async (req, res) => {
  const { name, college,event,email ,number} = req.body;
  try {
    const newRegister = new Register({
      name,
      college,
      event,
      email,
      number,
    });

   
    await newRegister.save();
    res.json({ message: " Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/signup", async (req, res) => {
    const { name, email, password ,number} = req.body;
    try {
     
      const user = await  User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
    
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        number,
      });
  
     
      await newUser.save();
      res.json({ message: " account created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email }); 
      if (!user) {
        return res.status(400).json({  message: "Invalid email or password" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password); 
      if (!isPasswordCorrect) {
        return res.status(400).json({  message: "Invalid email or password" });
      }
  
 
      res.json({  message: "Login successful" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({message: "An error occurred during login" });
    }
  });


app.get("/api/events", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/events", async (req, res) => {
    const { name, details, description, image } = req.body;
    const newEvent = new Event({ name, details, description, image });

    try {
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put("/api/events/:id", async (req, res) => {
    const { id } = req.params;
    const { name, details, description, image } = req.body;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        event.name = name || event.name;
        event.details = details || event.details;
        event.description = description || event.description;
        event.image = image || event.image;

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/events/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        await event.remove();
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
