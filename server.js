const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // To parse form data
const cors = require('cors'); // To handle CORS for cross-origin requests
const app = express();

// Middleware to parse JSON and allow cross-origin requests
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve static files from the 'public' directory
app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'userDetails&Quiz.html'));
});
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quizDB')
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

// Define candidate schema and model
const candidateSchema = new mongoose.Schema({
    fullName: String,
    gender: String,
    enrollment: String,
    city: String,
    totalMarks: Number,
    email: String // Add email field to the schema
});
const Candidate = mongoose.model('Candidate', candidateSchema);

// API endpoint to handle form submission
app.post('/submitQuiz', (req, res) => {
    const { fullName, gender, enrollment, city, totalMarks, email } = req.body; // Include email

    // Create a new Candidate document
    const newCandidate = new Candidate({
        fullName: fullName,
        gender: gender,
        enrollment: enrollment,
        city: city,
        totalMarks: totalMarks,
        email: email // Store email in the database
    });

    // Save the candidate details in MongoDB
    newCandidate.save()
        .then(() => {
            res.status(201).json({ message: "Quiz data saved successfully!" });
        })
        .catch((err) => {
            res.status(500).json({ message: "Error saving quiz data", error: err });
        });
});

// API endpoint to retrieve leaderboard data
app.get('/leaderboard', (req, res) => {
    Candidate.find().sort({ totalMarks: -1 }) // Sort by totalMarks descending
        .then(candidates => {
            res.json(candidates);
        })
        .catch(err => {
            res.status(500).json({ message: "Error retrieving leaderboard data", error: err });
        });
});

// Start the server
app.listen(7629, () => {
    console.log("Server running on http://localhost:7629");
});

// Aptos client configuration
const { AptosClient, AptosAccount } = require('aptos');

const client = new AptosClient("https://aptosconnect.app/");

// Updated endpoint to double tokens based on email
app.get('/doubleTokens/:email', async (req, res) => {
    const email = req.params.email; // Get the email from the URL

    // Retrieve the candidate by email
    const candidate = await Candidate.findOne({ email: email });
    if (!candidate) {
        return res.status(404).send('Candidate not found');
    }

    // Prepare the transaction to call the smart contract using the candidate's email
    const walletAddress = candidate.walletAddress; // Ensure this is stored in the DB

    // Create Aptos Account (ensure this is your sender's account)
    const senderAccount = AptosAccount.fromPrivateKey("YOUR_PRIVATE_KEY");

    // Prepare the transaction to call the smart contract
    const payload = {
        type: 'entry_function_payload',
        function: '0x1::TokenManager::double_tokens',
        arguments: [email], // Change from walletAddress to email
    };

    // Send the transaction
    try {
        const transaction = await client.generateTransaction(senderAccount.address(), payload);
        await client.signAndSubmitTransaction(senderAccount, transaction);
        res.status(200).send(`Tokens doubled for email: ${email}`);
    } catch (error) {
        console.error('Error doubling tokens:', error);
        res.status(500).send('Error doubling tokens');
    }
});

// Add the link to AptosConnect in a suitable endpoint
app.get('/link', (req, res) => {
    res.json({ link: "https://aptosconnect.app/" });
});