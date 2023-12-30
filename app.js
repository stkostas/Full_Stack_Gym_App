const express = require('express');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 5500;

// Use sessions to manage user authentication
app.use(session({
    secret: 'your-secret-key', // Change this to a random secret
    resave: false,
    saveUninitialized: true,
}));

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (like CSS and JS)
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://admin:admin@cluster0.grha7qq.mongodb.net/?retryWrites=true&w=majority';

// ---------------------------------------------------------------------------

// Landing page
app.get('/', async (req, res) => {
    let client;
    try {
        // Connect to MongoDB Atlas
        client = await MongoClient.connect(mongoURI);
        const db = client.db('gym');
        
        // Fetch data from all collections
        const usersData = await db.collection('users').find({}).toArray();
        const trainersData = await db.collection('trainers').find({}).toArray();
        const programsData = await db.collection('programs').find({}).toArray();

        // Combine data from all collections if needed
        const allData = {
            users: usersData,
            trainers: trainersData,
            programs: programsData,
        };

        // Get the success message from the query parameters
        const successMessage = req.query.successMessage || null;

        // Render the HTML page with the data
        res.render('index', { data: allData, successMessage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Close the MongoDB connection
        if (client) {
            await client.close();
        }
    }
});

// ---------------------------------------------------------------------------

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Log the username and password for debugging
    console.log('User log in data:')
    console.log('Username:', username);
    console.log('Password:', password);

    try {
        // Connect to MongoDB Atlas
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('gym');
    
        const collection = db.collection('users');   

        // Check if the user exists
        const user = await collection.findOne({ username, password });


        // Close the MongoDB connection
        client.close();

        if (user) {
            // Store user details in the session
            req.session.user = {
                username: user.username,
                type: user.type
            };

            // Redirect based on user type
            if (user.type === 'user') {
                res.redirect('/dashboard');
            } else if (user.type === 'admin') {
                res.redirect('/admin-dashboard');
            }
        } else {
            res.redirect('/');
            
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// ---------------------------------------------------------------------------

// Signup endpoint
app.post('/signup', async (req, res) => {
    let client = null; // Initialize client to null

    try {
        // Destructure the form data
        const {
            signupFirstname,
            signupLastname,
            signupCountry,
            signupCity,
            signupAddress,
            signupEmail,
            signupUsername,
            signupPassword
        } = req.body;

        // Validate form data (add more validation as needed)




        // Connect to MongoDB Atlas
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('gym');

        // Insert user data into signupRequests collection
        const result = await db.collection('signupRequests').insertOne({
            firstName: signupFirstname,
            lastName: signupLastname,
            country: signupCountry,
            city: signupCity,
            address: signupAddress,
            email: signupEmail,
            username: signupUsername,
            password: signupPassword,
            type: ""
        });

        // Handle success or failure based on the result
        if (result.acknowledged) {
            // User signed up successfully
            res.redirect('/?successMessage=Sign%20up%20request%20has%20been%20sent.');
        } else {
            // Something went wrong during signup
            res.status(500).send('Sign up failed. Please go back to the home page.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Close the MongoDB connection
        if (client) {
            await client.close();
        }
    }
});

// ---------------------------------------------------------------------------

// Authenticated view (dashboard)
app.get('/dashboard', async (req, res) => {
    // Check if the user is authenticated (session exists)
    if (req.session.user) {
        // Render the authenticated view
        // res.render('dashboard.ejs', { user: req.session.user });

        let client;
        try {
            // Connect to MongoDB Atlas
            client = await MongoClient.connect(mongoURI);
            const db = client.db('gym');

            // Fetch data from all collections
            const usersData = await db.collection('users').find({}).toArray();
            const trainersData = await db.collection('trainers').find({}).toArray();
            const programsData = await db.collection('programs').find({}).toArray();
            // const scheduleData = await db.collection('schedule').find({}).toArray();
            const announcementsData = await db.collection('announcements').find({}).toArray();

            // Fetch schedule data including program and trainer details
            const scheduleData = await db.collection('schedule').aggregate([
                {
                    $lookup: {
                        from: 'programs',
                        localField: 'program.programId',
                        foreignField: '_id',
                        as: 'programDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'trainers',
                        localField: 'trainer.trainerId',
                        foreignField: '_id',
                        as: 'trainerDetails'
                    }
                },
                {
                    $unwind: '$programDetails'
                },
                {
                    $unwind: '$trainerDetails'
                },
                {
                    $project: {
                        day: 1,
                        time: 1,
                        activity: '$programDetails.activity',
                        trainer: {
                            firstName: '$trainerDetails.firstName',
                            lastName: '$trainerDetails.lastName'
                        },
                        capacity: 1
                    }
                }
            ]).toArray();


            // Combine data from all collections if needed
            const allData = {
                users: usersData,
                trainers: trainersData,
                programs: programsData,
                schedule: scheduleData,
                announcements: announcementsData
            };

            // console.log(allData.announcements)
            // Render the HTML page with the data
            res.render('dashboard', { data: allData, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } finally {
            // Close the MongoDB connection
            if (client) {
                await client.close();
            }
        }
    } else {
        // Redirect to the landing page or show an error
        res.redirect('/');
    }
});

// ---------------------------------------------------------------------------

// Admin dashboard endpoint
app.get('/admin-dashboard', async (req, res) => {
    // Check if the user is authenticated (session exists)
    if (req.session.user && req.session.user.type === 'admin') {

        let client;
        try {
            // Connect to MongoDB Atlas
            client = await MongoClient.connect(mongoURI);
            const db = client.db('gym');

            // Fetch data from all collections
            const usersData = await db.collection('users').find({}).toArray();
            const trainersData = await db.collection('trainers').find({}).toArray();
            const programsData = await db.collection('programs').find({}).toArray();
            const scheduleData = await db.collection('schedule').find({}).toArray();
            const announcementsData = await db.collection('announcements').find({}).toArray();
            const signupRequestsData = await db.collection('signupRequests').find({}).toArray();

            // Combine data from all collections if needed
            const allData = {
                users: usersData,
                trainers: trainersData,
                programs: programsData,
                schedule: scheduleData,
                announcements: announcementsData,
                signupRequests: signupRequestsData
            };

            // console.log(allData.announcements)
            // Render the HTML page with the data
            res.render('admin-dashboard', { data: allData, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } finally {
            // Close the MongoDB connection
            if (client) {
                await client.close();
            }
        }
    } else {
        // Redirect to the landing page or show an error
        res.redirect('/');
    }
});

// ---------------------------------------------------------------------------

// Handle admin actions on signup requests
app.post('/admin-action', async (req, res) => {
    // Extract data from the form submission
    const userId = req.body.userId;
    const action = req.body.action;

    if (!userId || !action) {
        return res.status(400).send('Bad Request');
    }


    let client;
    try {
        // Connect to MongoDB Atlas
        client = await MongoClient.connect(mongoURI);
        const db = client.db('gym');

        // Fetch user details from signupRequests
        console.log("Admin Signup Request action:")
        console.log("userId: ", userId)
        console.log("action: ", action)
        const signupRequest = await db.collection('signupRequests').findOne({ _id: new ObjectId(userId) });
        

        if (!signupRequest) {
            return res.status(404).send('Signup request not found');
        }

        if (action === 'acceptUser' || action === 'acceptAdmin') {
            // Add user to 'users' collection
            const newUser = { ...signupRequest, type: action === 'acceptUser' ? 'user' : 'admin' };
            await db.collection('users').insertOne(newUser);
        }

        // Remove signup request from 'signupRequests' collection
        await db.collection('signupRequests').deleteOne({ _id: new ObjectId(userId) });

        // Redirect back to admin-dashboard or the desired page
        res.redirect('/admin-dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Close the MongoDB connection
        if (client) {
            await client.close();
        }
    }
});

// ---------------------------------------------------------------------------

// Route for Deleting Announcements
app.post('/admin-dashboard/delete-announcement', async (req, res) => {
    const { announcementId } = req.body;

    // Delete the announcement from the database
    try {
        const result = await db.collection('announcements').deleteOne({ _id: ObjectId(announcementId) });

        // Redirect back to the admin dashboard
        res.redirect('/admin-dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// ---------------------------------------------------------------------------

// Logout endpoint
app.post('/logout', (req, res) => {
    // Destroy the session to log out the user
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect to the landing page after logout
        res.redirect('/');
    });
});

// ---------------------------------------------------------------------------


// views users page
app.get('/users', (req, res) => {
    // Εδώ μπορείτε να κάνετε τη διαχείριση της φόρτωσης των χρηστών από τη βάση δεδομένων
    res.render('users', { data: { users: [firstName,lastName,country,city,address,email] } }); // Αντικαταστήστε [...] με την πραγματική λίστα χρηστών
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

