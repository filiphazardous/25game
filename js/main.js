/* The main game action */

require(['hazUtils.js/general/debug', 'hazUtils.js/web/dom/elements'], function requireAnonFunc(debug, elm) {

    var startButton = elm.get('#start-button');
    var scoreDisplay = elm.get('#score');
    var gameTiles = elm.get('.game-tile');
    var gameBoardWidth = 5;
    var draggedTile = null;
    var dropTiles = [];

    var gameStats = {
        running: false,
        score: 0
    };

    elm.addEvent(startButton, 'click', gameStart);


    function gameStart() {

        scrambleElements();

        if (gameStats.running === false) {
            elm.setAttr(gameTiles, 'draggable', true);
            elm.addEvent(gameTiles, 'dragstart', onDragStart);
        }

        gameStats.score = 0;
        gameStats.running = true;

        updateScore();
    }

    function gameEnd() {

        // Remove dragability on all elements
        elm.remAttr(gameTiles, 'draggable');
        elm.remEvent(gameTiles, 'dragstart', onDragStart);
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

        for (var i = gameTiles.length - 1; i >= 0; --i) {
            if (gameTiles[i].data.index === draggedTile.data.index) continue;

            if (gameTiles[i].data.col === draggedTile.data.col
                || gameTiles[i].data.row === draggedTile.data.row) {
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
        draggedTile = null;
    }

    function onDragOver(evt) {

        // Don't do much, maybe change color?
        evt.preventDefault();
    }

    function onDrop(evt) {

        // Update positions, remove dropability, and change colors back
        evt.preventDefault();
        debug.log("onDrop\n", evt);



        updateElementPos();

        ++gameStats.score;
        updateScore();

        setTimeout(checkIfComplete, 200);
    }

    function checkIfComplete() {

        // Loop through elements and check if expected position in array is the same as actual position
    }

    function scrambleElements() {

        // Scramble element order
        var newGameTiles = [];
        while (gameTiles.length) {
            var index = Math.floor(Math.random() * gameTiles.length);
            var tile = gameTiles.splice(index, 1)[0];
            tile.data = {};
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

        debug.log(gameTiles);
        for (var i = gameTiles.length - 1; i >= 0; --i) {
            debug.log(i, gameTiles.length, gameTiles[i]);
            var left = ((i % gameBoardWidth) * tileWidth) + '%';
            var top = (tileHeight * Math.floor(i / gameBoardWidth)) + '%';
            gameTiles[i].style.left = left;
            gameTiles[i].style.top = top;
            gameTiles[i].data = {
                index: i,
                row: Math.floor(i / gameBoardWidth),
                col: i % gameBoardWidth
            };
        }
    }

    function updateScore() {
        scoreDisplay.innerText = document.createTextNode(gameStats.score);
    }


});