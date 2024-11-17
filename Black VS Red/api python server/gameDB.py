from game import Game

class GameDB:
    def __init__(self):
        """
        Initialize a new GameDB object to store games in a dictionary.
        The dictionary key is the game_id, and the value is the Game object.
        """
        self.games = {}

    def add_game(self, game):
        """
        Add a new Game object to the database.

        :param game: A Game object to add.
        :return: None
        """
        if game.game_id in self.games:
            print(f"Game with id {game.game_id} already exists.")
        else:
            self.games[game.game_id] = game
            print(f"Game {game.game_id} added successfully.")

    def delete_game(self, game_id):
        """
        Delete a game from the database by game_id.

        :param game_id: The ID of the game to delete.
        :return: None
        """
        if game_id in self.games:
            del self.games[game_id]
            print(f"Game {game_id} deleted successfully.")
        else:
            print(f"Game with id {game_id} does not exist.")

    def get_game(self, game_id):
        """
        Retrieve a Game object from the database by game_id.

        :param game_id: The ID of the game to retrieve.
        :return: The Game object if found, or None if not found.
        """
        return self.games.get(game_id, None)

    def list_games(self):
        """
        List all games currently in the database.

        :return: A dictionary containing all games.
        """
        return self.games

    def game_exists(self, game_id):
        """
        Check if a game with a specific game_id exists in the database.

        :param game_id: The ID of the game to check.
        :return: True if the game exists, False otherwise.
        """
        return game_id in self.games
