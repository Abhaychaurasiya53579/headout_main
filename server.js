const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const destinations = require('./destination.json');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/globetrotter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // insertData();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

const destinationSchema = new mongoose.Schema({
  city: String,
  country: String,
  clues: [String],
  fun_fact: [String],
  trivia: [String],
});
const Destination = mongoose.model('Destination', destinationSchema);

// const insertData = async () => {
//   try {
//     const count = await Destination.countDocuments();
//     if (count === 0) {
//       await Destination.insertMany(destinations);
//       console.log('Data inserted successfully!');
//     } else {
//       console.log('Data already exists in the database.');
//     }
//   } catch (err) {
//     console.error('Error inserting data:', err);
//   }
// };

app.get('/api/destinations/random', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB is not connected');
      return res.status(500).json({ error: 'Database not connected' });
    }
    const count = await Destination.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: 'No destinations found' });
    }
    const random = Math.floor(Math.random() * count);
    const destination = await Destination.findOne().skip(random);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    res.json(destination);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/destinations/all', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB is not connected');
      return res.status(500).json({ error: 'Database not connected' });
    }
    const destinations = await Destination.find({});
    res.json(destinations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const challengeSchema = new mongoose.Schema({
  inviter_username: String,
  inviter_score: Number,
  invite_link: String,
});
const Challenge = mongoose.model('Challenge', challengeSchema);

app.post('/api/challenges/create', async (req, res) => {
  try {
    const { inviter_username, inviter_score } = req.body;
    const invite_link = `http://localhost:3000/challenge/${Math.random().toString(36).substring(7)}`;
    const challenge = new Challenge({ inviter_username, inviter_score, invite_link });
    await challenge.save();
    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});