from Player import Player

class Game:
    def __init__(self, game_id, players=None):
        """
        Initialize a new Game object.

        :param game_id: The unique ID of the game.
        :param players: A list of Player objects participating in the game.
        """
        self.game_id = game_id
        self.players = players if players else []

    def add_player(self, player):
        """
        Add a new player to the game.

        :param player: A Player object to add to the game.
        """
        self.players.append(player)

    def number_of_players(self):
        """
        Get the number of players in the game.

        :return: The number of players in the game.
        """
        return len(self.players)

    def __repr__(self):
        """
        Return a string representation of the Game object.

        :return: A string describing the game ID and players.
        """
        return f"Game(game_id={self.game_id}, players={[player.name for player in self.players]})"

    def to_dict(self):
        """
        Convert the Game object to a dictionary for easy serialization.

        :return: A dictionary representing the game.
        """
        return {
            "game_id": self.game_id,
            "number_of_players": self.number_of_players(),
            "players": [player.to_dict() for player in self.players]
        }

    @staticmethod
    def from_dict(game_dict):
        """
        Create a Game object from a dictionary.

        :param game_dict: A dictionary containing game details.
        :return: A Game object.
        """
        players = [Player.from_dict(player_dict) for player_dict in game_dict['players']]
        return Game(game_dict['game_id'], players)
