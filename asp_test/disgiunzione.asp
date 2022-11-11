d(X)|a(X) :- c(_,X), X < 4.
c(U,Z) :- b(U), not t(U), b(Z).
t(W) :- b(X), not c(W,X), W = X - 1.
b(3).
b(4).

%instanziazione
%c(3,3) :- not t(3).
%c(3,4) :- not t(3).
%c(4,3).
%c(4,4).
%t(2).
%t(3) :- not c(3,4).
%d(3)|a(3) :- c(3,3).

%Answer Sets:
% F + {t(3),d(4)}
% F + (t(3),a(4))
% F + {c(3,3),c(3,4),a(3)}
% F + {c(3,3),c(3,4),d(3)}