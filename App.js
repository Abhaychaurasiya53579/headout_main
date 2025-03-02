import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [destination, setDestination] = useState(null);
  const [allDestinations, setAllDestinations] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [username, setUsername] = useState('');
  const [challengeLink, setChallengeLink] = useState('');

  const fetchAllDestinations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/destinations/all');
      setAllDestinations(response.data);
    } catch (error) {
      console.error('Error fetching all destinations:', error);
    }
  };

  const fetchDestination = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/destinations/random');
      setDestination(response.data);
      generateOptions(response.data.city);
      setFeedback(null);
      setSelectedAnswer('');
    } catch (error) {
      console.error('Error fetching destination:', error);
      alert('Failed to fetch destination. Please check the backend server.');
    }
  };

  const generateOptions = (correctAnswer) => {
    const incorrectOptions = allDestinations
      .filter((dest) => dest.city.trim().toLowerCase() !== correctAnswer.trim().toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((dest) => dest.city);
    const allOptions = [...incorrectOptions, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === destination.city) {
      setFeedback('🎉 Correct!');
      setShowConfetti(true);
      setScore(score + 1);
    } else {
      setFeedback('😢 Incorrect!');
      setShowConfetti(false);
    }
  };

  const handleChallengeFriend = async () => {
    if (!username) {
      alert('Please enter your username before challenging a friend.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/challenges/create', {
        inviter_username: username,
        inviter_score: score,
      });
      const { invite_link } = response.data;
      setChallengeLink(invite_link);

      const element = document.getElementById('challenge-image');
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL('image/png');

      const message = `Hey! I scored ${score} in Globetrotter. Can you beat me? Play now: ${invite_link}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  };

  useEffect(() => {
    fetchAllDestinations();
    fetchDestination();
  }, []);

  return (
    <div className="App">
      <header className="header">
        <h1>🌍 Globetrotter</h1>
        <p>Test your knowledge of famous destinations!</p>
      </header>

      <main className="main-content">
        {showConfetti && <Confetti />}
        {destination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="game-card"
          >
            <h2>Clues:</h2>
            <ul>
              {destination.clues.map((clue, index) => (
                <li key={index}>{clue}</li>
              ))}
            </ul>
            <h3>Options:</h3>
            <div className="options-grid">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== ''}
                  className={`option-button ${selectedAnswer === option ? (option === destination.city ? 'correct' : 'incorrect') : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="feedback"
              >
                <p>{feedback}</p>
                <p>Fun Fact: {destination.fun_fact[0]}</p>
                <p>Trivia: {destination.trivia[0]}</p>
                <button onClick={fetchDestination} className="next-button">
                  Next Destination
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      <div className="score-section">
        <p>Score: <span className="score-value">{score}</span></p>
      </div>

      <div className="challenge-section">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="username-input"
        />
        <button onClick={handleChallengeFriend} className="challenge-button">
          🎯 Challenge a Friend
        </button>
      </div>

      <div id="challenge-image" style={{ display: 'none' }}>
        <h2>Globetrotter Challenge</h2>
        <p>Inviter: {username}</p>
        <p>Score: {score}</p>
        <p>Can you beat me?</p>
      </div>

      <footer className="footer">
        <p>Made with ❤️ by Globetrotter Team</p>
      </footer>
    </div>
  );
}

export default App;