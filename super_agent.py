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
import time
import heapq

SUCC_LIM=30 # On prend approximativement 1/3 des successeurs.

class Agent(avalam.Agent, minimax.Game):
    """This is the skeleton of an agent to play the Avalam game."""



    def __init__(self,name="Agent"):
         self.name=name # name est le nom de l'agent
         self.player=avalam.PLAYER1
         self.time_slot=0
         self.start_time = time.time() # Récuperation du temps courant
         self.step = 0 # step est le nombre de pas qu'un joueur peut effectuer
         self.time_left =2.5*60 # time_left représente le temps restant pour jouer une partie
         self.max_depth =2 # max_depth est la profondeur maximale de l'arbre de jeu
         self.time_slot =0 # time_slot  = Time_left / Number of steps left (approx.)



    """The successors function must return (or yield) a list of
        pairs (a, s) in which a is the action played to reach the
        state s; s is the new state, i.e. a triplet (b, p, st) where
        b is the new board after the action a has been played,
        p is the player to play the next move and st is the next
        step number."""

    def successors(self, state):
         # Un state s est  un triplet (b,p,st) où  b est un board, p est un player et st le nombre de pas.
        board, player, step_number = state
        heap =[]
        i = 0
        # On récupère le prochain joueur
        next_player = player *(-1)
        my_successors=board.get_actions() # get_actions retourne les actions valides.
        for successor in my_successors:
            new_board=board.clone().play_action(successor)
            i+=1
            score = self.evaluate((new_board,next_player,step_number))
            if(self.play==player) : # Si c'est le player MAX
                # heap trie  du plus petit au plus grand de telle sorte qu'on inverse le score.
                heapq.heappush(heap,(-score,(successor,(new_board,next_player,step_number+1))))
            else :# Si c'est le player  MIN
                 # heap trie du plus grand au plus petit de telle sorte qu'on inverse de nouveau le score
                 heapq.heappush(heap,(score,(successor,(new_board,next_player,step_number+1))))
        if i>SUCC_LIM:
            i=SUCC_LIM
        for x in range(i):
            yield heapq.heappop(heap)[1] # valeur yield sans  la clé.

    """The cutoff function returns true if the alpha-beta/minimax
        search has to stop; false otherwise.
        """

    def cutoff(self, state, depth):

     board, player, step_number = state
     play_time = time.time() - self.start_time # play_time est le temps à partir duquel on a commencé à jouer.
     if depth > 0 and self.step < 2 :
         return True
     return play_time == self.time_left or board.is_finished() or self.max_depth==depth
      #return board.is_finished() or depth == 2

    """The evaluate function must return an integer value
        representing the utility function of the board.
        """

    def evaluate(self, state):

     board, player,step_number = state
     score = board.get_score()
     old_score = score
     # Do not evaluate this before step 2 because it won't happen
     if self.step < 2:
            return score
      # If We have non moveable complete tower with player's color
      # Increment score
     for i,j,tower in board.get_towers():
            if not board.is_tower_movable(i,j):
                h = board.get_height(board.m[i][j])
                if tower[4][1] == 1:
                    score+=8
                elif tower[4][1] == -1: #Check if oponent has full towers
                    score-=8
                # Check Right
                elif h == 3:
                    #test if the tower is not surrounded by any chip
                    if tower[h][1] == 1 and\
                    self.check_right(board,i,j) == None and \
                    self.check_left(board, i, j) == None and \
                    self.check_up(board, i, j) == None and \
                    self.check_down(board, i, j) == None:
                        score+=h
                    else: #Check if a near chip is from oponent because we can suppose that he will counter this move
                        left = self.left(board, i, j)
                        right = self.right(board, i,j)
                        up = self.up(board, i,j)
                        down = self.down(board, i,j)
                        if (left != None and board.get_height(left) == 1 and left[1][1] == -1) or \
                        (right != None and board.get_height(right) == 1 and right[1][1] == -1) or\
                        (up != None and board.get_height(up) == 1 and up[1][1] == -1) or\
                        (down != None and board.get_height(down) == 1 and down[1][1] == -1):
                            score-=h

            else: #Tower is movable
                if tower[4][1] == 1: #Tower can be reversed
                    if tower[1][0] == 1: #Reversing tower will give us points and is the only possible move
                        score+=4
                    elif tower[1][0] == -1: #Reversing the tower will give points to the opponent
                        score-=4
     return score



    def check_right(self,board, i,j):
        """ Checks whether the right cell is empty of not
            returns None if there are to tiles on the cell or if out of bounds
            returns True if there is a tile on the cell
        """
        if j+1 < board.columns:
            if board.get_height(board.m[i][j+1]) == 0:
                return None
            else:
                return True
        else:
            return None

    def left(self, board, i, j):
        """ Get the left tile
            Return None if no tile
        """
        if j+1 < board.columns:
            return board.m[i][j+1]
        else:
            return None

    def check_left(self, board,i,j):
        """ Checks whether the left cell is empty of not
            returns None if there are to tiles on the cell or if out of bounds
            returns True if there is a tile on the cell
        """
        if j > 0:
            if board.get_height(board.m[i][j-1]) == 0:
                return None
            else:
                return True
        else:
            return None

    def right(self, board, i, j):
        """ Get the right  tile
            Return None if no tile
        """
        if j > 0:
            return board.m[i][j-1]
        else:
            return None


    def check_up(self, board,i, j):
        """ Checks whether the upper cell is empty of not
            returns None if there are to tiles on the cell or if out of bounds
            returns True if there is a tile on the cell
        """
        if i > 0:
            if board.get_height(board.m[i-1][j]) == 0:
                return None
            else:
                return True
        else:
            return None

    def up(self, board, i, j):
        """ Get the up tile
            Return None if no tile
        """
        if i > 0:
            return board.m[i-1][j]
        else:
            return None

    def check_down(self, board,i, j):
        """ Checks whether the down cell is empty of not
            returns None if there are to tiles on the cell or if out of bounds
            returns True if there is a tile on the cell
        """
        if i+1 < board.rows:
            if board.get_height(board.m[i+1][j]) == 0:
                return None
            else:
                return True
        else:
            return None

    def down(self, board, i, j):
        """ Get the down tile
            Return None if no tile
        """
        if i+1 < board.rows:
            return board.m[i+1][j]
        else:
            return None


    def play(self, board, player, step, time_left):
        """This function is used to play a move according
        to the board, player and time left provided as input.
        It must return an action representing the move the player
        will perform.
        """
        if step % 2 == 0 :
            player = avalam.PLAYER2
        else :
             player = avalam.PLAYER1

        self.time_left = time_left
        self.step = step
        self.start_time = time.time()
        newBoard = avalam.Board(board.get_percepts(player))
        state = (newBoard, player, step)
        return minimax.search(state, self)


if __name__ == "__main__":
    avalam.agent_main(Agent())