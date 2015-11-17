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
     score = board.get_score() # On récupère le score renvoyé par  board.get_score()
     # Ne pas evaluer le score avant d'avoir fait 2 pas
     if self.step < 2:
        return score

     for i, j, tower in board.get_towers():
         #if the tower CAN'T move
         if not board.is_tower_movable(i,j) :
            if tower > 0:
                score += (5*2)
            #Check if oponent has full towers
            elif tower < 0:
                score -= (5*2)
         else : #if tower CAN move
             if tower == 4 : #this tower can be taken
                 #Check if a near chip is from oponent because we can suppose that he will counter this move
                 left = self.left(board, i, j)
                 right = self.right(board, i,j)
                 up = self.up(board, i,j)
                 down = self.down(board, i,j)
                 if (left != None and left == 1 and left < 0) or \
                        (right != None and right == 1 and right < 0) or\
                        (up != None and up == 1 and up < 0) or\
                        (down != None and down == 1 and down < 0):
                            score-=tower
                 else :
                    score+=tower
             if tower == 3 : #this tower can be taken if openent chip has height of 2
                 #Check if a near chip is from oponent because we can suppose that he will counter this move
                 left = self.left(board, i, j)
                 right = self.right(board, i,j)
                 up = self.up(board, i,j)
                 down = self.down(board, i,j)
                 if (left != None and left == 2 and left < 0) or \
                        (right != None and right == 2 and right < 0) or\
                        (up != None and up == 2 and up < 0) or\
                        (down != None and down == 2 and down < 0):
                            score-=tower
                 else :
                    score+=tower
             if tower == 2 : #this tower can be taken if openent chip has height of 3
                 #Check if a near chip is from oponent because we can suppose that he will counter this move
                 left = self.left(board, i, j)
                 right = self.right(board, i,j)
                 up = self.up(board, i,j)
                 down = self.down(board, i,j)
                 if (left != None and left == 3 and left < 0) or \
                        (right != None and right == 3 and right < 0) or\
                        (up != None and up == 3 and up < 0) or\
                        (down != None and down == 3 and down < 0):
                            score-=tower
                 else :
                    score+=tower
             if tower == 1 : #this tower can be taken if openent chip has height of 4
                 #Check if a near chip is from oponent because we can suppose that he will counter this move
                 left = self.left(board, i, j)
                 right = self.right(board, i,j)
                 up = self.up(board, i,j)
                 down = self.down(board, i,j)
                 if (left != None and left == 4 and left < 0) or \
                        (right != None and right == 4 and right < 0) or\
                        (up != None and up == 4 and up < 0) or\
                        (down != None and down == 4 and down < 0):
                            score-=tower
                 else :
                    score+=tower
     return score



    def check_right(self,board, i,j):
        """ Vérifie si la cellule à droite est  vide ou pas
            Retourne None si il n'y a pas des pions sur cette cellule ou si on sort du board
            Retourne True s'il y a de pion sur cette cellule qui se trouve à droite
        """
        if j+1 < board.columns:
            if board.get_height(board.m[i][j+1]) == 0:
                return None
            else:
                return True
        else:
            return None

    def left(self, board, i, j):
        """ Prendre le pion qui se trouve à gauche
            Retourne None s'il n'y a pas de pion
        """
        if j+1 < board.columns:
            return board.m[i][j+1]
        else:
            return None

    def check_left(self, board,i,j):
        """ Vérifie si la cellule à gauche est vide ou pas
            Retourne None si il n'y a pas de pions sur cette cellule ou si on sort du board
            Retourne True s'il y a de pion sur cette cellule qui se trouve à gauche
        """
        if j > 0:
            if board.get_height(board.m[i][j-1]) == 0:
                return None
            else:
                return True
        else:
            return None

    def right(self, board, i, j):
        """ Prendre le pion qui se trouve à droite
            Retourne None s'il n'y a pas de pion
        """
        if j > 0:
            return board.m[i][j-1]
        else:
            return None


    def check_up(self, board,i, j):
        """ Verifie si la cellule devant est vide ou pas.
            Retourne None s'il n'y a pas de pion sur cette cellule ou si on sort du board
            Retourne True s'il y a de pion sur cette cellule qui se trouve devant
        """
        if i > 0:
            if board.get_height(board.m[i-1][j]) == 0:
                return None
            else:
                return True
        else:
            return None

    def up(self, board, i, j):
        """ Prendre le pion  qui se trouve devant.
            Retourne None s'il n'y a pas de pion
        """
        if i > 0:
            return board.m[i-1][j]
        else:
            return None

    def check_down(self, board,i, j):
        """ Verifier si la cellule derrière est vide ou pas.
            Retourne None s'il n'y a de pion  sur cette cellule ou si sort du board
            Retoune True s'il  y a un pion sur la cellule qui se trouve derrière
        """
        if i+1 < board.rows:
            if board.get_height(board.m[i+1][j]) == 0:
                return None
            else:
                return True
        else:
            return None

    def down(self, board, i, j):
        """ Prendre le pion qui se trouve derrière.
            Retourne None s'il n'y a pas de pion
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