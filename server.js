// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Models
const User = require('./models/User');
const Course = require('./models/Course');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the templating engine
app.set('view engine', 'ejs');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eLearningPlatform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// Render index page
app.get('/', (req, res) => {
    res.render('index');
});

// // Render login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Render signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Login and Signup handling
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Simulate finding user logic
    const user = await User.findOne({ email, password });
    if (user) {
        res.json({ success: true, userId: user._id.toString() });
    } else {
        res.json({ success: false, message: 'Invalid email or password.' });
    }
});

app.post('/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists. Please log in.' });
        }

        // Create a new user if no existing user is found
        const user = new User({ name, email, phone, password });
        await user.save();
        res.json({ success: true, userId: user._id.toString() });
    } catch (error) {
        console.error("Signup error:", error);
        res.json({ success: false, message: 'Signup failed due to server error.' });
    }
});


// Render home page with user data
app.get('/home', async (req, res) => {
    const userId = req.query.id;
   // console.log("Received userId in /home route:", userId); // Debugging line

    try {
        const user = await User.findById(userId);
        // console.log("User found:", user); // Log the user object returned

        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('home', { user });
    } catch (error) {
        console.error("Error finding user:", error); // Log the error if there's an issue
        res.status(500).send('Server error');
    }
});


app.get('/profile', async (req, res) => {
    const userId = req.query.id; // Get userId from the query parameters

    try {
        // Fetch user data from the database using the userId
        const user = await User.findById(userId);
        if (user) {
            res.render('profile', { user, userId }); // Pass both user and userId to profile.ejs
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        res.status(500).send('Server error');
    }
});


// Render courses page with course data
app.get('/courses', async (req, res) => {
    const userId = req.query.id; // Retrieve userId from the query parameter
    // console.log("Received userId in /courses route:", userId); // Debugging line

    try {
        const courses = await Course.find();
        res.render('courses', { courses, userId }); // Pass userId to the template
    } catch (error) {
        console.error("Error loading courses:", error);
        res.status(500).send('Server error');
    }
});




// Profile picture upload route
app.post('/profile/upload', upload.single('profilePic'), async (req, res) => {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (user) {
        user.profilePic = `/uploads/${req.file.filename}`;
        await user.save();
        res.json({ success: true, profilePicUrl: user.profilePic });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

// Profile picture delete route
app.delete('/profile/delete-pic', async (req, res) => {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (user) {
        user.profilePic = null;
        await user.save();
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
