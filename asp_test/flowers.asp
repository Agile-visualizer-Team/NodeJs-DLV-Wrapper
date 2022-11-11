%Modello dei dati in input

% tile(Flower, X, Y). Flower può essere white, pink, red, blue, green, yellow, purple oppure none se non cè nessun fiore.
% next(Flower, N). N è il numero di fiori di tipo Flower che stanno per arrivare

flower(white).
flower(pink).
flower(red).
flower(blue).
flower(green).
flower(yellow).
flower(purple).

tile(blue, 0, 1).
tile(pink, 1, 1).
tile(white, 1, 8).
tile(white, 2, 4).
tile(white, 3, 4).
tile(white, 4, 4).
tile(blue, 4, 5).
tile(blue, 5, 1).
tile(yellow, 5, 3).
tile(purple, 5, 4).
tile(pink, 6, 7).
tile(purple, 7, 7).

row(0..8).
column(0..8).

grid(X, Y) :- row(X), column(Y).

occupied(X, Y) :- tile(Flower, X, Y), Flower != none.
tile(none, X, Y) :- grid(X, Y), not occupied(X, Y).

%Spostare un fiore in una casella vuota adiacente nei confini della matrice è una mossa valida
validMove(X, Y, X + 1, Y):- tile(Flower, X, Y), Flower != none, tile(none, X + 1, Y), X + 1 < 9.
validMove(X, Y, X - 1, Y):- tile(Flower, X, Y), Flower != none, tile(none, X - 1, Y), X - 1 >= 0.
validMove(X, Y, X, Y + 1):- tile(Flower, X, Y), Flower != none, tile(none, X, Y + 1), Y + 1 < 9.
validMove(X, Y, X, Y - 1):- tile(Flower, X, Y), Flower != none, tile(none, X, Y - 1), Y - 1 >= 0.

%Se muovere un fiore in una casella è una mossa valida, muovere lo stesso fiore in una casella vuota adiacente a quella in cui si può muovere è anche una mossa valida
validMove(X1, Y1, X2 + 1, Y2):- validMove(X1, Y1, X2, Y2), tile(none, X2 + 1, Y2), X2 + 1 < 9.
validMove(X1, Y1, X2 - 1, Y2):- validMove(X1, Y1, X2, Y2), tile(none, X2 - 1, Y2), X2 - 1 >= 0.
validMove(X1, Y1, X2, Y2 + 1):- validMove(X1, Y1, X2, Y2), tile(none, X2, Y2 + 1), Y2 + 1 < 9.
validMove(X1, Y1, X2, Y2 - 1):- validMove(X1, Y1, X2, Y2), tile(none, X2, Y2 - 1), Y2 - 1 >= 0.

%Data una mossa valida, o la faccio o non la faccio
makeMove(X1, Y1, X2, Y2) | notMakeMove(X1, Y1, X2, Y2) :- validMove(X1, Y1, X2, Y2).

%Non si possono fare due mosse diverse
:- makeMove(X1, Y1, X2, Y2), makeMove(X3, Y3, X4,  Y4), X1 != X3.
:- makeMove(X1, Y1, X2, Y2), makeMove(X3, Y3, X4,  Y4), X2 != X4.
:- makeMove(X1, Y1, X2, Y2), makeMove(X3, Y3, X4,  Y4), Y1 != Y3.
:- makeMove(X1, Y1, X2, Y2), makeMove(X3, Y3, X4,  Y4), Y2 != Y4.

%Non è possibile non fare una mossa
moveMade :- makeMove(_, _, _, _).
:- not moveMade.

changedTile(X, Y) :- makeMove(X, Y, _, _).
changedTile(X, Y) :- makeMove(_, _, X, Y).
newTile(Flower, X, Y) :- tile(Flower, X, Y), not changedTile(X, Y).
newTile(none, X, Y) :- makeMove(X, Y, _, _).
newTile(Flower, X2, Y2) :- makeMove(X1, Y1, X2, Y2), tile(Flower, X1, Y1).

%Calcola il numero di fiori uguali nella stessa colonna
sameFlowerInColumn(X2, Y2, Flower) :- makeMove(X1, Y1, X2, Y2), newTile(Flower, X2, Y2).
sameFlowerInColumn(X2 + 1, Y2, Flower) :- sameFlowerInColumn(X2, Y2, Flower), newTile(Flower, X2 + 1, Y2).
sameFlowerInColumn(X2 - 1, Y2, Flower) :- sameFlowerInColumn(X2, Y2, Flower), newTile(Flower, X2 - 1, Y2).
sameFlowerInColumnCount(Count) :- Count = #count{X : sameFlowerInColumn(X, _, _)}.

%Calcola il numero di fiori uguali nella stessa riga
sameFlowerInRow(X2, Y2, Flower) :- makeMove(X1, Y1, X2, Y2), newTile(Flower, X2, Y2).
sameFlowerInRow(X2, Y2 + 1, Flower) :- sameFlowerInRow(X2, Y2, Flower), newTile(Flower, X2, Y2 + 1).
sameFlowerInRow(X2, Y2 - 1, Flower) :- sameFlowerInRow(X2, Y2, Flower), newTile(Flower, X2, Y2 - 1).
sameFlowerInRowCount(Count) :- Count = #count{Y : sameFlowerInRow(_, Y, _)}.

%Nota: I fiori vengono distrutti se sono almeno 5 in riga, colonna o diagonale
%Si paga di meno ad un livello intermedio più sono i fiori che vengono messi in riga o in colonna
%Si paga di meno ad un livello alto più sono i fiori che vengono distrutti
%Se non vengono distrutti fiori si paga il costo massimo al livello alto
:~ sameFlowerInColumnCount(Count), Count >= 5. [9 - Count@5]
:~ sameFlowerInColumnCount(Count), Count < 5. [9 - Count@3]
:~ sameFlowerInColumnCount(Count), Count < 5. [9@5]
:~ sameFlowerInRowCount(Count), Count >= 5. [9 - Count@5]
:~ sameFlowerInRowCount(Count), Count < 5. [9 - Count@3]
:~ sameFlowerInRowCount(Count), Count < 5. [9@5]

%È preferibile muovere un fiore dello stesso tipo di quelli che stanno per arrivare.
%Più sono i fiori che stanno per arrivare e non sono dello stesso tipo di quello che si sta muovendo, più si paga.
:~ makeMove(X1, Y1, X2, Y2), newTile(Flower1, X2, Y2), next(Flower2, N), Flower1 != Flower2. [N@2]

%Calcola le dimensioni delle colonne di fiori uguali ma di tipo diverso da quello che si sta muovendo la cui formazione verrà quindi bloccata dalla mossa
differentFlowerInColumn(X2 + 1, Y2, Flower2) :- makeMove(X1, Y1, X2, Y2), newTile(Flower, X2, Y2), newTile(Flower2, X2 + 1, Y2), Flower2 != none, Flower2 != Flower.
differentFlowerInColumn(X2 - 1, Y2, Flower2) :- makeMove(X1, Y1, X2, Y2), newTile(Flower, X2, Y2), newTile(Flower2, X2 - 1, Y2), Flower2 != none, Flower2 != Flower.
differentFlowerInColumn(X2 + 1, Y2, Flower) :- differentFlowerInColumn(X2, Y2, Flower), newTile(Flower, X2 + 1, Y2).
differentFlowerInColumn(X2 - 1, Y2, Flower) :- differentFlowerInColumn(X2, Y2, Flower), newTile(Flower, X2 - 1, Y2).
differentFlowerInColumnCount(Count, Flower) :- differentFlowerInColumn(_, _, Flower), Count = #count{X : differentFlowerInColumn(X, _, Flower)}.

%Calcola le dimensioni delle righe di fiori uguali ma di tipo diverso da quello che si sta muovendo la cui formazione verrà quindi bloccata dalla mossa
differentFlowerInRow(X2, Y2 + 1, Flower2) :- makeMove(X1, Y1, X2, Y2), newTile(Flower, X2, Y2), newTile(Flower2, X2, Y2 + 1), Flower2 != none, Flower2 != Flower.
differentFlowerInRow(X2, Y2 - 1, Flower2) :- makeMove(X1, Y1, X2, Y2), newTile(Flower, X2, Y2), newTile(Flower2, X2, Y2 - 1), Flower2 != none, Flower2 != Flower.
differentFlowerInRow(X2, Y2 + 1, Flower) :- differentFlowerInRow(X2, Y2, Flower), newTile(Flower, X2, Y2 + 1).
differentFlowerInRow(X2, Y2 - 1, Flower) :- differentFlowerInRow(X2, Y2, Flower), newTile(Flower, X2, Y2 - 1).
differentFlowerInRowCount(Count, Flower) :- differentFlowerInRow(_, _, Flower), Count = #count{Y : differentFlowerInRow(_, Y, Flower)}.

%Si paga ad un livello alto se si blocca una riga o colonna che sta per essere distrutta (viene comunque data priorità alla distruzione dei fiori)
%Si paga ad un livello intermedio se si blocca una riga o colonna di fiori in via di formazione (si paga di più a seconda della grandezza della riga o colonna che si blocca)
%:~ differentFlowerInColumnCount(Count, Flower), Count >= 4. [Count@4, Flower, Count]
%:~ differentFlowerInColumnCount(Count, Flower), Count < 4. [Count@3, Flower, Count]
%:~ differentFlowerInRowCount(Count, Flower), Count >= 4. [Count@4, Flower, Count]
%:~ differentFlowerInRowCount(Count, Flower), Count < 4. [Count@3, Flower, Count]

%makeMove(1,8,1,4).

:~ flower(white). [2@2]
:~ flower(white). [2@1]

#show makeMove/4.
#show sameFlowerInColumnCount/1.
#show sameFlowerInRowCount/1.