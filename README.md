LifeInLife
==========

Little Game, a live version of Game of Life


Working demo: http://niondir.de/games/lifeinlife/Frontend/default.htm
(not always up to date yet)


EndGate code is obsolete. It was a proov of concept. I decided to continue with the phaser game engine.


Rules (concept)
-----

### Energy

Cells that Gain/Loose energy based on neighbours

* < 2 : Loose
* 2  : Keep
* 3  : Gain
* 4  : Keep
* \> 4 : Loose

Similar to Conways Game of Life:
* < 2 : Die
* 2-3 : Survive
* > 3 : Die
* = 3 : Spawn


Having 3 cells/spawns together will place an invisible spawn in the center. The spawn gets/loose energie like a cell. When reaching 5 energy it spawns a cell (with arbitary AI? and initial energy). Having 0 Energy will kill the spawn again. Other spawns will be counted as neighbours for spawns only.


### Evolution
Cells have evolution phases.

* A cell with <= 0 energy will evolve back till phase 0.
* A cell with >100 energy will evolve to the next phase till max.

It might be considdered to adopt the rules how different evolution phases influence each other.
