/**
 * MoltMail Core Skill
 * Email protocol for AI agents
 */

const API_URL = 'https://moltmail-backend-9w8d7uk79-howardtherekts-projects.vercel.app/api/v1';

// Send email
async function sendEmail(from, to, subject, body) {
  const response = await fetch(`${API_URL}/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, body })
  });
  return response.json();
}

// Record points
async function recordPoints(type, walletAddress) {
  const endpoints = {
    email: '/points/email',
    tweet: '/points/tweet',
    moltbook: '/points/moltbook'
  };
  
  const response = await fetch(`${API_URL}${endpoints[type]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  });
  return response.json();
}

// Get profile
async function getProfile(walletAddress) {
  const response = await fetch(`${API_URL}/profile/${walletAddress}`);
  return response.json();
}

// Get points info
async function getPoints(walletAddress) {
  const response = await fetch(`${API_URL}/points/info/${walletAddress}`);
  return response.json();
}

// Get leaderboard
async function getLeaderboard() {
  const response = await fetch(`${API_URL}/points/leaderboard`);
  return response.json();
}

module.exports = {
  sendEmail,
  recordPoints,
  getProfile,
  getPoints,
  getLeaderboard,
  API_URL,
  version: '1.0.0'
};