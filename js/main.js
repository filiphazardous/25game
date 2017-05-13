/* The main game action */

require(['hazUtils.js/general/debug', 'hazUtils.js/web/dom/elements'], function requireAnonFunc(debug, elm) {

    var startButton = elm.get('#start-button');
    var scoreDisplay = elm.get('#score');
    var gameTiles = elm.get('.game-tile');
    var gameBoardWidth = 5;

    var gameStats = {
        running: false,
        score: 0,
    };

    elm.addEvent(startButton, 'click', gameStart);


    function gameStart() {

        gameStats.score = 0;
        gameStats.running = true;

        scrambleElements();

        elm.setAttr(gameTiles, 'draggable', true);

        updateScore();
    }

    function gameEnd() {

        // Remove dragability on all elements
        elm.remAttr(gameTiles, 'draggable');
    }

    function onDragStart() {

        // Enable dropability on elements on the same x- and y-axes
    }

    function onDragStop() {

        // Update positions and
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
        }
    }

    function updateScore() {
        scoreDisplay.innerText = document.createTextNode(gameStats.score);
    }


});