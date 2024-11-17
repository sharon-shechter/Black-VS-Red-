# Red vs Black Game

This is an interactive multiplayer game designed to bring friends together for a strategic and AI-powered experience. The game dynamically assigns players to teams, and the goal is to outsmart the opposing team through clever voting and strategy.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Key Setup](#api-key-setup)
- [Usage](#usage)
- [Game Rules](#game-rules)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The **Red vs Black Game** is a real-time interactive platform where players are divided into two teams—Red and Black. The game integrates AI-powered features such as photo-to-asset conversion using DALL·E 3 and predictive analysis using GPT-4, adding mystery and fun to the gameplay.

## Features

- **Photo-Based Game Assets**:
  - Players upload a photo, which is processed into a custom game asset using AI
  - Image-to-text conversion is powered by **Salesforce/blip-image-captioning-base** from Hugging Face
  - Description is used by **DALL·E 3** to create a unique 2D game asset

- **Real-Time Team Assignment**:
  - Players are split into two teams—**Red** and **Black**—in real time
  - Team identities remain secret throughout the game

- **Strategic Gameplay**:
  - The **Red player** must survive while trying to mislead other players
  - Players vote each round on who they think is the Red player

- **AI Predictions**:
  - Twice per game, a "Wizard" powered by **GPT-4** provides predictions
  - Predictions may be truthful or intentionally misleading

- **Dynamic Voting and Elimination**:
  - Players vote to eliminate suspected Red players each round
  - The player with the most votes is eliminated

- **Unique Abilities**:
  - Red players can convert one Black player into a Red ally during the game

## Demo



https://github.com/user-attachments/assets/ee456bce-fcea-46a0-8845-d8b09e88bcb1



## Technologies Used

- **Backend**:
  - Flask
  - Flask-SocketIO
  - Flask-CORS
  - OpenAI APIs

- **Frontend**:
  - Next.js
  - React
  - TailwindCSS

- **AI/ML**:
  - OpenAI GPT-4
  - DALL·E 3
  - Salesforce/blip-image-captioning-base
  - PyTorch

- **Other**:
  - UUID
  - Lodash

## Prerequisites

Before running the game, ensure you have:

- Python 3.8 or higher
- Node.js 14 or higher
- npm (comes with Node.js)
- OpenAI API Key

## Installation

### Clone the Repository

```bash
git clone https://github.com/sharon-shechter/Black-VS-Red-.git
cd "Black VS Red"
```

### Backend Setup

```bash
# Navigate to the backend directory
cd "Black VS Red/api python server"

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors flask-socketio openai pillow transformers torch

# Run the backend server
python flask_server.py
```

The backend server will start on http://localhost:5000

### Frontend Setup

```bash
# Navigate to the frontend directory
cd "Black VS Red/Front"

# Install dependencies
npm install

# Run the frontend application
npm run dev
```

The frontend application will be available at http://localhost:3000

## API Key Setup

1. Obtain an API key from the [OpenAI website](https://platform.openai.com)
2. Add the key to the backend server:
   - Open `flask_server.py`
   - Set the API key:
   ```python
   openai.api_key = "YOUR_API_KEY"
   ```
   - Replace "YOUR_API_KEY" with your actual API key

## Usage

1. Start both the backend server and frontend application as described in the Installation section
2. Open your browser and navigate to http://localhost:3000
3. Create or join a group
4. Upload a photo
5. Wait for other players to join
6. Begin the game and enjoy!

## Game Rules

### Team Assignment
- Players are randomly split into two secret teams: Red and Black
- The Red player must survive until the end
- Team identities are kept hidden from other players

### Voting and Elimination
- Each round, players vote to eliminate the suspected Red player
- The player with the most votes is eliminated from the game
- Eliminated players can still watch but cannot vote

### Red Player Abilities
- The Red player can turn one Black player into a Red ally during the game
- This ability can only be used once per game
- The converted player becomes part of the Red team

### Wizard Predictions
- Twice during the game, GPT-4 provides predictions based on game data
- These predictions may be truthful or intentionally misleading
- Players must decide whether to trust the Wizard's insights

### Winning Conditions
- **Black Team Wins**: If they successfully eliminate all Red players
- **Red Team Wins**: If they survive until all remaining players are Red

## Contributing

We welcome contributions to improve the Red vs Black Game! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to use, modify, and distribute this project under the terms of the MIT License. For any questions or issues, please open an issue in the repository.
