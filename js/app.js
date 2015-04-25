// Variables applied to each of our instances go here,
// we've provided one for you to get started
var Enemy = function(x, y) {
// The image/sprite for our enemies, this uses
// a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    //Added these variables for extra functionality.
    this.speed = (Math.random() * 2) + 1;
//It would be best to compute the width and height from the sprite.
//However, I'll be using hardcoded values for now since there's only one enemy type.
    this.width = 80;
    this.height = 80; //Originally 171, currently being reduced to keep collision detection working.
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

    this.x += dt * (50 + (currentScore / 10)) * this.speed;
//Use the enemy's computed speed and our delta to compute movement.
//Monsters now move faster as your score gets higher, but start slower. 
}

// Draw the enemy on the screen, required method for game.
// This uses the provided functions in resources.js
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

var Player = function(x, y) {
    this.sprite = "images/char-boy.png";
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 80; //See Enemy.height for an explanation of this value.
}

Player.prototype.update = function(dt) {
//This function doesn't do anything or even get called because of how I handle collision detection.
//I'm leaving it in, in case I need to call a player-related function every frame(delta).
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y); //Exact same type of function as Enemy.render
}

Player.prototype.handleInput = function(code) {
//Converts keyboard input codes (mapped to words instead of IDs) into player movement. 
    if (pauseState == false) {
        switch (code) {
            case "left":
                if (this.x == 0) {
                    break;
                } //prevent the player from moving offscreen.
                this.x -= 100;
                playerMove.play();
                break;
            case "up":
                this.y -= 84;
                playerMove.play();
                if (this.y <= 0) { //moves the player back to the start and increases their score.
                    this.x = 200;
                    this.y = 375;
                    currentScore += 100;
                    console.log((1000 - (currentScore / 20)));
                };
                break;
            case "right":
                if (this.x == 400) {
                    break;
                }
                this.x += 100;
                playerMove.play();
                break;
            case "down":
                if (this.y == 375) {
                    break;
                }
                this.y += 84;
                playerMove.play();
                break;
        }
    }
}

//Declaration of useful variables.
var player = new Player(200, 375); //Player spawns at the bottom-center of the playfield.
var allEnemies = []; //An array of enemies for pushEnemies
var pauseState = false; //Used to suppress calculations when the game is paused
var currentScore = 0; //Earned by playing well, lost by resetting the game.
//Sound effects.
var playerMove = new Audio("js/move.wav");
var playerDeath = new Audio("js/dead2.wav")

//Generates a new enemy every second at the start. For consistency, this is not tied to the delta.
//As the player's score increases, so does the amount of bugs on the screen.
//It should be essentially impossible to get to 20,000 points, at which point this function breaks.
//Spawn times should be consistent on all but the oldest and weakest computers.
setInterval(function() {
    pushEnemies()
}, (1000 - (currentScore / 20)));

function pushEnemies() {
/*
Complicated math! This generates a new Y-coord with one of the following values: 55, 135, 215.
These correspond to the stone lanes. Also, we don't want to create more enemies if paused.
*/
    if (pauseState == false) {
        var enemy = new Enemy(-100, (55 + (Math.floor((Math.random() * 3)) * 80)))
        allEnemies.push(enemy);
    }
//Removes enemies from allEnemies when they're off the screen. 
//It waits until a bug is ~100 pixels off the screen to prevent random disappearances.
//This should probably called somewhere else, though.
    if (allEnemies[0].x >= 600) {
        allEnemies.shift()
    };
}

/*A simple bounding box algorithm for collision detection.
  This was modified because the game's graphics contain large amounts of vertical whitespace.
  Based off code from:
  http://blog.sklambert.com/html5-canvas-game-2d-collision-detection/

  If I implement powerups, this code will either need to be modified,
  or I may need to implement a different system, perhaps with coordinates.
*/
function checkCollisions() {
//Checking for collisions with enemies first.
    for (var i = 0; i < allEnemies.length; i++) {
//Comparing the location of the player and each enemy.
//The Y coordinate check was modified because bugs can only impact from the left and right.
//It still needs tweaking in that regard.
        if (
            player.x < allEnemies[i].x + allEnemies[i].width && player.x + player.width > allEnemies[i].x
            //Due to desync in the y-values of objects, this is required to make collision detection work.
            && (player.y - allEnemies[i].y) < 10 && (player.y - allEnemies[i].y) >= -20
        ) //The second y-clause is required to prevent bugs below the player from registering as hits.
        {
//Play a sound effect before resetting.
            playerDeath.play();
            resetGame();
        }

    }
//You can just have a different collision loop for different types of collidables!
//Nothing yet, though.

}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. I didn't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'

    };

    player.handleInput(allowedKeys[e.keyCode]);
});

//Linked to a button on the page.
//Implementing a more robust pause that keeps bugs from moving while the game is paused.
//See engine.js for more details.
function changePauseState() {

//Stops the update function from doing anything, though it still gets called.
    if (pauseState == false) {
        pauseState = true;
    } else pauseState = false;


}