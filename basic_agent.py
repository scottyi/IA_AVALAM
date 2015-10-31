# coding: utf-8
#!/usr/bin/env python3

'''

NAMES OF THE AUTHOR(S):
Scott IVINZA MBE
Jos ZIGABE
GROUPE 29

'''

import avalam
import minimax

class Agent:
    """This is the skeleton of an agent to play the Avalam game."""

    def __init__(self, name="Agent"):
        self.name = name # Le nom de l'agent

    """The successors function must return (or yield) a list of
        pairs (a, s) in which a is the action played to reach the
        state s; s is the new state, i.e. a triplet (b, p, st) where
        b is the new board after the action a has been played,
        p is the player to play the next move and st is the next
        step number."""

    def successors(self, state):
        # Un state s est  un triplet (b,p,st) où  b est un board, p est un player et st le nombre de pas.
        board, player, step_number = state
        my_successors=board.get_actions() # get_actions retourne les actions valides.
        for successor in my_successors:
            new_board=board.clone().play_action(successor)
            yield (successor, (new_board, player * (-1), step_number+1))


    """The cutoff function returns true if the alpha-beta/minimax
        search has to stop; false otherwise.
        """

    def cutoff(self, state, depth):

      board, player, step_number = state
      return board.is_finished() or depth >= 2

    """The evaluate function must return an integer value
        representing the utility function of the board.
        """
    def evaluate(self, state):

         board, player,step_number = state
         return board.get_score()

    def play(self, board, player, step, time_left):
        """This function is used to play a move according
        to the board, player and time left provided as input.
        It must return an action representing the move the player
        will perform.
        """
        self.time_left = time_left
        newBoard = avalam.Board(board.get_percepts(player==avalam.PLAYER2))
        state = (newBoard, player, step)
        return minimax.search(state, self)


if __name__ == "__main__":
    avalam.agent_main(Agent())

