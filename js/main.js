/* The main game action */

require(['hazUtils.js/general/debug', 'hazUtils.js/web/dom/elements'], function requireAnonFunc(debug, elm) {

    var startButton = elm.get('#start-button');
    var scoreDisplay = elm.get('#score');
    var gameTiles = elm.get('.game-tile');
    var gameBoard = elm.get('#game-board');
    var gameBoardWidth = 5;
    var draggedTile = null;
    var dropTiles = [];

    var gameStats = {
        running: false,
        score: 0
    };

    elm.addEvent(startButton, 'click', gameStart);

    function gameStart() {

        initElements();
        scrambleElements();

        if (gameStats.running === false) {
            elm.setAttr(gameTiles, 'draggable', true);
            elm.addEvent(gameTiles, 'dragstart', onDragStart);
            elm.addEvent(gameTiles, 'touchstart', onTouchStart);
        }

        gameStats.score = 0;
        gameStats.running = true;

        updateScore();
    }

    function gameEnd(success) {

        // Remove dragability on all elements
        elm.remAttr(gameTiles, 'draggable');
        elm.remEvent(gameTiles, 'dragstart', onDragStart);

        if (success) {
            alert("You made it!\nScore: " + gameStats.score + "\n(Lower is better.)");
        }
    }

    function initElements() {

        for (var i = gameTiles.length - 1; i >= 0; --i) {
            gameTiles[i].data = {
                tile: null,
                goalIndex: i
            }
        }
    }

    function onTouchStart(evt) {


        if (draggedTile) {
            debug.log("Error: A tile is already being dragged!\n", draggedTile);
            return;
        }

        debug.log("onTouchStart\n", evt);
        draggedTile = evt.target ? evt.target : evt.srcElement;
        debug.log(draggedTile.data);

        elm.addEvent(draggedTile, 'touchend', onTouchEnd);
        elm.addEvent(draggedTile, 'touchcancel', onTouchEnd);
        elm.addEvent(gameBoard, 'touchmove', onTouchMove);
        elm.addClasses(draggedTile, 'dragged-tile');


        for (var i = gameTiles.length - 1; i >= 0; --i) {
            if (gameTiles[i].data.tile.index === draggedTile.data.tile.index) continue;

            if (gameTiles[i].data.tile.col === draggedTile.data.tile.col
                || gameTiles[i].data.tile.row === draggedTile.data.tile.row) {
                dropTiles.push(gameTiles[i]);
            }
        }

        elm.addClasses(dropTiles, 'drop-zone');

        // TODO: copy the dragged tile, and store the pos of the touch ptr
    }

    function onTouchEnd(evt) {

        debug.log("onTouchgEnd called\n", evt);

        elm.remClasses(dropTiles, 'drop-zone');
        dropTiles = [];

        elm.remEvent(draggedTile, 'touchend', onTouchEnd);
        elm.remEvent(draggedTile, 'touchcancel', onTouchEnd);
        elm.remEvent(gameBoard, 'touchmove', onTouchMove);

        // TODO: Determine over which tile the dragged tile is held

        setTimeout(function anon() {
            elm.remClasses(draggedTile, 'dragged-tile');
            draggedTile = null;
        }, 1);
    }

    function onTouchMove(evt) {
        // TODO: Move the copy of the dragged tile with the same delta as the touch ptr
    }

    function onDragStart(evt) {

        if (draggedTile) {
            debug.log("Error: A tile is already being dragged!\n", draggedTile);
            return;
        }

        // Enable dropability on elements on the same x- and y-axes and change their color?
        debug.log("onDragStart\n", evt);
        draggedTile = evt.target ? evt.target : evt.srcElement;
        debug.log(draggedTile.data);

        elm.addEvent(draggedTile, 'dragend', onDragEnd);
        elm.addClasses(draggedTile, 'dragged-tile');

        for (var i = gameTiles.length - 1; i >= 0; --i) {
            if (gameTiles[i].data.tile.index === draggedTile.data.tile.index) continue;

            if (gameTiles[i].data.tile.col === draggedTile.data.tile.col
                || gameTiles[i].data.tile.row === draggedTile.data.tile.row) {
                dropTiles.push(gameTiles[i]);
            }
        }

        elm.addEvent(dropTiles, 'dragover', onDragOver);
        elm.addEvent(dropTiles, 'drop', onDrop);
        elm.addClasses(dropTiles, 'drop-zone');
    }

    function onDragEnd(evt) {

        debug.log("onDragEnd called\n", evt);

        elm.remEvent(dropTiles, 'dragover', onDragOver);
        elm.remEvent(dropTiles, 'drop', onDragStart);
        elm.remClasses(dropTiles, 'drop-zone');
        dropTiles = [];

        elm.remEvent(draggedTile, 'dragend', onDragEnd);

        setTimeout(function anon() {
            elm.remClasses(draggedTile, 'dragged-tile');
            draggedTile = null;
        }, 1);
    }

    function onDragOver(evt) {

        // Don't do much, maybe change color?
        evt.preventDefault();
    }

    function findDropTile(evt) {

        var candidateNames = ['target', 'srcElement'];
        var parentCandidates = ['parentNode', 'parentElement'];

        for (var i = candidateNames.length - 1; i >= 0; --i) {
            if (!evt[candidateNames[i]]) continue;
            debug.log('Checking', candidateNames[i]);
            var candidateNode = evt[candidateNames[i]];

            if (candidateNode.data && candidateNode.data.tile) {
                return candidateNode;
            }

            for (var j = parentCandidates.length - 1; j >= 0; --j) {
                if (!candidateNode[parentCandidates[j]]) continue;
                debug.log('Checking parent', parentCandidates[j]);
                var parentNode = candidateNode[parentCandidates[j]];

                if (parentNode.data && parentNode.data.tile) {
                    return parentNode;
                }
            }
        }

        var e = {
            name: 'NO_SUITABLE_NODE',
            message: 'No suitable drop target found!',
            data: evt
        };
        debug.log("Throwing\n", e);
        throw(e);
    }

    function onDrop(evt) {

        // Update positions, remove dropability, and change colors back
        var targetTile = findDropTile(evt);

        evt.preventDefault();
        debug.log("onDrop\n", evt);

        // Move the dragged tile to its new position
        var newIndex = targetTile.data.tile.index;
        var startIndex = draggedTile.data.tile.index;

        gameTiles.splice(startIndex, 1);
        gameTiles.splice(newIndex, 0, draggedTile);

        var rows = draggedTile.data.tile.row - targetTile.data.tile.row;
        var incr = rows / Math.abs(rows);

        for (var i = 0, row = 0; i < Math.abs(rows); ++i, row += incr) {
            var srcIndex = row * gameBoardWidth + newIndex + incr;
            var targetIndex = srcIndex + incr * gameBoardWidth - incr;

            var tile = gameTiles.splice(srcIndex, 1)[0];
            gameTiles.splice(targetIndex, 0, tile);
        }

        updateElementPos();

        ++gameStats.score;
        updateScore();

        setTimeout(function anon() {
            if (checkIfComplete()) {
                gameEnd(true);
            }
        }, 200);
    }

    function checkIfComplete() {

        // Loop through elements and check if expected position in array is the same as actual position
        for (var i = gameTiles.length - 1; i >= 0; --i) {
            if (gameTiles[i].data.tile.index !== gameTiles[i].data.goalIndex) return false;
        }
        return true;
    }

    function scrambleElements() {

        // Scramble element order
        var newGameTiles = [];
        while (gameTiles.length) {
            var index = Math.floor(Math.random() * gameTiles.length);
            var tile = gameTiles.splice(index, 1)[0];
            newGameTiles.push(tile);
        }

        gameTiles = newGameTiles;

        updateElementPos();
    }

    function updateElementPos() {

        // Loop through elements and update top and left
        var tileWidth = 100 / gameBoardWidth;
        var rows = gameTiles.length / gameBoardWidth;
        var tileHeight = 100 / rows;

        //debug.log(gameTiles);
        for (var i = gameTiles.length - 1; i >= 0; --i) {
            //debug.log(i, gameTiles.length, gameTiles[i]);
            var left = ((i % gameBoardWidth) * tileWidth) + '%';
            var top = (tileHeight * Math.floor(i / gameBoardWidth)) + '%';
            gameTiles[i].style.left = left;
            gameTiles[i].style.top = top;
            gameTiles[i].data.tile = {
                index: i,
                row: Math.floor(i / gameBoardWidth),
                col: i % gameBoardWidth
            };
        }
    }

    function updateScore() {
        scoreDisplay[0].innerText = '' + gameStats.score;
    }
});