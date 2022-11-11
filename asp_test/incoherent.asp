%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%Modello dati in input
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%node(V).
%edge(U,V,C).
%pMax(C).
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

selectedNode(V) | notSelectedNode(V) :- node(V).

%primo constraint
adjacentSelectedNode :- selectedNode(U), selectedNode(V), edge(U,V,_).
:- adjacentSelectedNode.

%secondo constraint
coveredEdge(U,V,C) :- edge(U,V,C), selectedNode(U).
coveredEdge(U,V,C) :- edge(U,V,C), selectedNode(V).
:- not coveredEdge(U,V,C), edge(U,V,C).
:- vSelCost(0).
%terzo constraint
selectedNodeCost(V,C) :- selectedNode(V), C = #min{C1: edge(_,V,C1)}.
vSelCost(C) :- C = #sum{C1: selectedNodeCost(V,C1)}.
:- vSelCost(C1), pMax(C2), C1 > C2.

%primo weak
:~ vSelCost(C1), pMax(C2). [C2-C1@2]

%secondo weak
reachable(U,V) :- edge(U,V,_), node(U), node(V).
reachable(U,V) :- reachable(U,W), reachable(W,V).

biggerNodeCost(V) :- selectedNodeCost(V,C), selectedNodeCost(V1,C1), C > C1.
smallerNodeCost(V) :- selectedNodeCost(V,C), selectedNodeCost(V1,C1), C < C1.

minNodeCost(V) :- selectedNode(V), not biggerNodeCost(V).
maxNodeCost(V) :- selectedNode(V), not smallerNodeCost(V).

:~ not reachable(U,V), minNodeCost(U), maxNodeCost(V). [1@1,U,V]