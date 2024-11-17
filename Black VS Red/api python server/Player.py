class Player:
    def __init__(self, name, color, photo=None, vote_count=0):  
        """
        Initialize a new Player object.

        :param name: The name of the player.
        :param color: The color of the player (e.g., 'red' or 'black').
        :param vote_count: The number of votes the player has received.
        """
        self.name = name
        self.color = color
        self.photo = photo  # Store the photo
        self.vote_count = vote_count

    def __repr__(self):
        """
        Return a string representation of the Player object.

        :return: A string describing the player's name, color, and vote count.
        """
        return f"Player(name={self.name}, color={self.color}, vote_count={self.vote_count})"

    def to_dict(self):
            return {
                "name": self.name,
                "color": self.color,
                "photo": self.photo,  # Include the photo in the dictionary
                "vote_count": self.vote_count
            }

    @staticmethod
    def from_dict(player_dict):
        return Player(
            player_dict['name'], 
            player_dict['color'], 
            player_dict.get('photo', None),  # Get the photo if present
            player_dict.get('vote_count', 0)
        )