import os
import shutil  # Import shutil to delete directories
from flask import Flask, request, jsonify
from game import Game
from gameDB import GameDB
from Player import Player
from flask_cors import CORS  
import openai
import base64
from PIL import Image
from io import BytesIO
import openai
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
from flask_socketio import SocketIO, emit



# Initialize the image captioning model and processor
device = "cuda" if torch.cuda.is_available() else "cpu"
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)



openai.api_key = "API KEY"

app = Flask(__name__)
CORS(app) 
socketio = SocketIO(app, cors_allowed_origins="*")
game_db = GameDB()


GBASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get the current file's directory
GAMES_PHOTOS_DIR = os.path.join(GBASE_DIR, 'games_photos')  

# Ensure the games_photos directory exists
if not os.path.exists(GAMES_PHOTOS_DIR):
    os.makedirs(GAMES_PHOTOS_DIR)


# Endpoint to create a new game (game_id is passed in the URL)
@app.route('/create_game/<game_id>', methods=['POST'])
def create_game(game_id):
    if game_db.game_exists(game_id):
        return jsonify({"message": "Game already exists"}), 400

    # Create a new directory for the game inside "games_photos"
    game_dir = os.path.join(GAMES_PHOTOS_DIR, game_id)
    os.makedirs(game_dir, exist_ok=True)

    new_game = Game(game_id)
    game_db.add_game(new_game)
    return jsonify({"message": f"Game {game_id} created successfully"}), 200


# Endpoint to delete a game
@app.route('/delete_game/<game_id>', methods=['DELETE'])
def delete_game(game_id):
    """
    Delete a game by game_id. This will remove the game from the GameDB and 
    delete the associated game photos directory.
    """
    game = game_db.get_game(game_id)
    if game is None:
        return jsonify({"message": "Game not found"}), 404

    # Remove the game from the game database
    game_db.delete_game(game_id)

    # Delete the game photos directory if it exists
    game_dir = os.path.join(GAMES_PHOTOS_DIR, game_id)
    if os.path.exists(game_dir):
        shutil.rmtree(game_dir)
        print(f"Successfully deleted directory: {game_dir}")

    return jsonify({"message": f"Game {game_id} deleted successfully."}), 200
        

# Endpoint to retrieve a game
@app.route('/get_game/<game_id>', methods=['GET'])
def get_game(game_id):
    game = game_db.get_game(game_id)
    if game is None:
        return jsonify({"message": "Game not found"}), 404

    return jsonify(game.to_dict()), 200

# Endpoint to add a player to a game
@app.route('/add_player/<game_id>', methods=['POST'])
def add_player(game_id):
    data = request.get_json()
    player_name = data.get('name')
    player_color = data.get('color')
    player_photo = data.get('photo')  # This is now the asset URL, not the base64 photo

    game = game_db.get_game(game_id)
    if game is None:
        return jsonify({"message": "Game not found"}), 404

    # Create a new player and assign the photo
    new_player = Player(player_name, player_color)
    new_player.photo = player_photo  # Assign the photo URL to the player

    game.add_player(new_player)

    return jsonify({"message": f"Player {player_name} added to game {game_id}"}), 200


@app.route('/update_player_votes/<game_id>/<player_name>', methods=['PATCH'])
def update_player_votes(game_id, player_name):
    data = request.get_json()
    votes = data.get('votes')
    
    game = game_db.get_game(game_id)
    if game is None:
        return jsonify({"message": "Game not found"}), 404

    # Find the player and update the vote count
    player = next((p for p in game.players if p.name == player_name), None)
    if player is None:
        return jsonify({"message": "Player not found"}), 404

    player.vote_count += votes  # Increment the vote count
    return jsonify({"message": f"Player {player_name} now has {player.vote_count} votes"}), 200

@app.route('/list_games', methods=['GET'])
def list_games():
    games = game_db.list_games()

    # Prepare a list of games for JSON response
    games_list = {game_id: game.to_dict() for game_id, game in games.items()}
    
    return jsonify(games_list), 200


@app.route('/update_player_color/<game_id>/<player_name>', methods=['PATCH'])
def update_player_color(game_id, player_name):
    game = game_db.get_game(game_id)
    if not game:
        return jsonify({"message": "Game not found"}), 404

    player = next((p for p in game.players if p.name == player_name), None)
    if not player:
        return jsonify({"message": "Player not found"}), 404

    data = request.get_json()
    player_color = data.get('color')
    player.color = player_color

    return jsonify({"message": f"Player {player_name} color updated to {player_color}"}), 200


@app.route('/analyze_game/<game_id>', methods=['GET'])
def analyze_game(game_id):
    game = game_db.get_game(game_id)
    if game is None:
        return jsonify({"message": "Game not found"}), 404

    # Prepare and filter game data for GPT analysis
    game_data = game.to_dict()

    # Only keep relevant player information: name, color, and vote count (exclude photo)
    filtered_game_data = {
        "number_of_players": game_data['number_of_players'],
        "players": [
            {
                "name": player['name'],
                "color": player['color'],
                "vote_count": player['vote_count']
            }
            for player in game_data['players']
        ]
    }
    
    # Call the GPT API with filtered data
    analysis = get_game_analysis_from_gpt(filtered_game_data)
    
    return jsonify({"analysis": analysis}), 200

# Save player's photo to the game directory
@app.route('/save_photo', methods=['POST'])
def save_photo():
    data = request.get_json()
    game_id = data['game_id']
    player_name = data['player_name']
    photo_base64 = data['photo']

    # Decode the base64 photo
    photo_data = base64.b64decode(photo_base64.split(',')[1])

    # Create game directory if not exists
    game_dir = os.path.join(GAMES_PHOTOS_DIR, game_id)
    os.makedirs(game_dir, exist_ok=True)

    # Save photo as .png file
    photo_path = os.path.join(game_dir, f'{player_name}.png')
    with open(photo_path, 'wb') as f:
        f.write(photo_data)

    return jsonify({"message": f"Photo saved for {player_name}"}), 200


# Convert the saved photo to game asset using DALL·E API
@app.route('/convert_to_asset', methods=['POST'])
def convert_to_asset():
    data = request.get_json()
    game_id = data['game_id']
    player_name = data['player_name']

    # Get the photo path
    photo_path = os.path.join(GAMES_PHOTOS_DIR, game_id, f'{player_name}.png')

    # Use the BLIP model to generate a description of the photo
    try:
        with Image.open(photo_path) as img:
            # Prepare the image for the BLIP model
            img = img.convert('RGB')
            inputs = processor(images=img, return_tensors="pt").to(device)

            # Generate description with max_new_tokens to control the length
            out = model.generate(**inputs, max_new_tokens=50)  # Set max_new_tokens to 50 or any desired length
            description = processor.decode(out[0], skip_special_tokens=True)
            print(f"Generated description: {description}")
    except Exception as e:
        print(f"Error generating description: {e}")
        return jsonify({"error": "Failed to generate description."}), 500

    # Use the description as a prompt for DALL·E 3
    prompt = f"Create a 2D game asset based on a person who {description}. make ONE figure portret of the with white background."

    # Call DALL·E 3 API to create an image based on the description
    try:
        response = openai.Image.create(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",  
            quality="standard",  
            n=1
        )
        asset_url = response['data'][0]['url']
    except Exception as e:
        print(f"Error generating image with DALL·E 3: {e}")
        return jsonify({"error": "Failed to generate image with DALL·E 3."}), 500

    # Optionally, save the asset back to the server or game DB
    save_player_asset(game_id, player_name, asset_url)

    return jsonify({"asset": asset_url}), 200


def get_game_analysis_from_gpt(game_data):

    # Prepare the message format for the chat model
    messages = [
        {"role": "system", "content": "You are a wizard. Your task is to give predictions about the game, sometimes truthful, sometimes misleading. Be mysterious in your predictions, as you analyze the state of a game between two teams: Red vs. Black."},
        {"role": "user", "content": f"The game is a battle between two teams: Red team and Black team. The Red team must survive while the Black team tries to eliminate them. Each round, players vote to decide who they think is on the Red team, and the player with the most votes is eliminated. Based on this current game state: {game_data}, say shortly (2 lines) who seems to be red (truthful or not)"}
    ]

    response = openai.ChatCompletion.create(
        model="gpt-4",  
        messages=messages,
        max_tokens=150, 
        n=1,
        stop=None,
        temperature=0.9,  
    )

    return response['choices'][0]['message']['content'].strip()




# Helper function to save the player's photo as a PNG
def save_player_photo(game_id, player_name, photo_base64):
    game_dir = os.path.join(GAMES_PHOTOS_DIR, game_id)

    # Decode the base64 photo
    photo_data = base64.b64decode(photo_base64.split(',')[1])

    # Convert the photo data to an image and save it as .png
    img = Image.open(BytesIO(photo_data))
    photo_path = os.path.join(game_dir, f'{player_name}.png')
    img.save(photo_path, 'PNG')

    print(f"Photo saved for player {player_name} in game {game_id} at {photo_path}")

def save_player_asset(game_id, player_name, asset_url):
    # Save the asset URL to the player's record in your game DB
    # This can be extended to save to your actual database
    game_dir = os.path.join(GAMES_PHOTOS_DIR, game_id)
    asset_file = os.path.join(game_dir, f'{player_name}_asset.txt')

    with open(asset_file, 'w') as f:
        f.write(asset_url)

    print(f"Asset saved for player {player_name}: {asset_url}")

if __name__ == '__main__':
    app.run(port=5000, debug=True)