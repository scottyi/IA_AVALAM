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

SUCC_LIM =30 # Prendre apprixmativement 1/3 des successors

class Agent(avalam.Agent, minimax.Game):
    """This is the skeleton of an agent to play the Avalam game."""



    def __init__(self,name="Agent"):
         self.name=name # name est le nom de l'agent

    """The successors function must return (or yield) a list of
        pairs (a, s) in which a is the action played to reach the
        state s; s is the new state, i.e. a triplet (b, p, st) where
        b is the new board after the action a has been played,
        p is the player to play the next move and st is the next
        step number."""
    def successors(self, state):
         # Un state s est  un triplet (b,p,st) où  b est un board, p est un player et st le nombre de pas.
        board, player, step_number = state
        heap = []
        i = 0

        # On récupère le prochain joueur
        next_player = player *(-1)
        # get_actions retourne les actions valides.
        my_successors=board.get_actions()
        for successor in my_successors:
            new_board=board.clone().play_action(successor)
            i+=1
            # évaluation du score du successeur
            score = self.evaluate((new_board, next_player, step_number))
            if(self.player == player): # if MAX
                # heap sorts descending to ascending, so we invert the score
                heapq.heappush(heap, (-score, (successor, (new_board, next_player, step_number+1))))
            else: # if MIN
                # heap sorts ascending to descending so we invert the score
                heapq.heappush(heap, (score, (successor, (new_board, next_player, step_number+1))))
        # on check si on a pas dépassé le nombre de successeurs voulu
        # Si c'est le cas on ignore le reste des successeurs en limitant i à la borne SUCC_LIM
        if i > SUCC_LIM:
            i = SUCC_LIM

        for x in range(i):
            yield heapq.heappop(heap)[1]


    """The cutoff function returns true if the alpha-beta/minimax
        search has to stop; false otherwise.
        """
    def cutoff(self, state, depth):

        board, player, step_number = state
        # on récupere le temps de jeu (depuis combien de temps on joue)
        # car on doit jouer en moin de 2.5 minutes
        play_time = time.time() - self.start_time
        if depth > 0 and self.step < 2:
            return True
        return play_time > (2.5*60) or board.is_finished() or depth == 2

    """The evaluate function must return an integer value
        representing the utility function of the board.
        """
    def evaluate(self, state):

     board, player,step_number = state

     # on récupere le score donné par le board
     score = board.get_score()

     # Il ne faut pas faire l'évaluation avant l'étape 2
     if step_number < 2:
        return score
     # on va parcourir toutes les tours du board
     # sachant que qu'une tour est localisé dans le board
     # l'aide des indices i et j et sa hauteur par tower
     for i, j, tower in board.get_towers():
         # Si une tour à la position i et j n'est pas movable
         if not board.is_tower_movable(i,j):
            # si une tour appartient à l'adversaire
            if tower < 0:
                score -= -tower
            # si une tour nous appartient
            elif tower > 0 :
                score += tower
         # Si une tour est movable
         else :
            # On récupére toutes les tours voisines
            north = self.North(board, i, j)
            east = self.East(board, i,j)
            south = self.South(board, i,j)
            west = self.West(board, i,j)
            north_east = self.North_East(board, i, j)
            north_west = self.North_West(board, i,j)
            south_east = self.South_East(board, i,j)
            south_west = self.South_West(board, i,j)
            # Si une tour a une hauteur de 4
            # et sachant que la hauteur maximum d'une tour est 5
            if tower == 4 :
                # si dans le voisinage il existe une tour
                # de hauteur 1 appartenant à l'adversaire
                if (north != None and north == 1 and north < 0) or \
                   (east != None and east == 1 and east < 0) or\
                   (south != None and south == 1 and south < 0) or\
                   (west != None and west == 1 and west < 0) or\
                   (north_east != None and north_east == 1 and north_east < 0) or \
                   (north_west != None and north_west == 1 and north_west < 0) or\
                   (south_east != None and south_east == 1 and south_east < 0) or\
                   (south_west != None and south_west == 1 and south_west < 0):
                    score-=10
                else :
                    score+=11
            # Si une tour a une hauteur < 4
            if (0 < tower and tower < 5) :
                # si dans le voisinage il exite une tour appartenant à l'adversaire
                # avec une hauteur tels que l'addition des hauteurs deux tours == 5
                if (north != None and (-north+tower) == 5 and north < 0) or \
                   (east != None and (-east+tower) == 5 and east < 0) or\
                   (south != None and (-south+tower) == 5 and south < 0) or\
                   (west != None and (-west+tower) == 5 and west < 0) or\
                   (north_east != None and (-north_east+tower) == 5 and north_east < 0) or \
                   (north_west != None and (-north_west+tower) == 5 and north_west < 0) or\
                   (south_east != None and (-south_east+tower) == 5 and south_east < 0) or\
                   (south_west != None and (-south_west+tower) == 5 and south_west < 0):
                    score-=tower
                else :
                    score+=11
     # Si les deux joueurs possedent le même nombre de tours
     if score == 0 :
        # on va parcourir toutes les tours du board
        for i, j, tower in board.get_towers():
            # on vérifie si c'est une tour de l'adversaire
            # et si elle à la hauteur maximale
            if tower == -board.max_height:
               score -= 1
            # sinon on vérifie si c'est notre tour
            # et si elle à la hauteur maximale
            elif tower == board.max_height:
                  score += 1

     return score

    def North(self, board, i, j):
        """ Get the north neighbor
            Return None if no neighbor
        """
        if i > 0:
            return board.m[i-1][j]
        else:
            return None


    def East(self, board, i, j):
        """ Get the east neighbor
            Return None if no neighbor

        """
        if j+1 < board.columns:
            return board.m[i][j+1]
        else:
            return None


    def South(self, board, i, j):
        """ Get the south neighbor
            Return None if no neighbor

        """
        if i+1 < board.rows:
            return board.m[i+1][j]
        else:
            return None

    def West(self, board, i, j):
        """ Get the west  neighbor
            Return None if no neighbor
        """
        if j > 0:
            return board.m[i][j-1]
        else:
            return None


    def North_East(self, board, i, j):
        """ Get the north east neighbor
            Return None if no neighbor
        """
        if i > 0 and j+1 < board.columns :
            return board.m[i-1][j+1]
        else:
            return None

    def South_East(self, board, i, j):
        """ Get the south east neighbor
            Return None if no neighbor
        """
        if i+1 < board.rows and j+1 < board.columns :
            return board.m[i+1][j+1]
        else:
            return None


    def South_West(self, board, i, j):
        """ Get south west neighbor
            Return None if no neighbor
        """
        if i+1 < board.rows and j > 0 :
            return board.m[i+1][j-1]
        else:
            return None

    def North_West(self, board, i, j):
        """ Get the North west neighbor
            Return None if no neighbor
        """
        if i > 0 and j > 0 :
            return board.m[i-1][j-1]
        else:
            return None

    def play(self, board, player, step, time_left):
        """This function is used to play a move according
        to the board, player and time left provided as input.
        It must return an action representing the move the player
        will perform.
        """
        self.player = player
        self.step = step
        self.start_time = time.time()
        newBoard = avalam.Board(board.get_percepts(player==avalam.PLAYER2))
        state = (newBoard, player, step)
        return minimax.search(state, self)

if __name__ == "__main__":
    avalam.agent_main(Agent())