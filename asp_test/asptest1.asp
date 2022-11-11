m(Y) :- s(Y,X), not v(Y).
s(X,Z) :- m(X), v(Y), Z=X+Y.
v(Y) | p(Y) :- not m(Y), s(Y,Z).
s(2,3).