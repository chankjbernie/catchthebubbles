//canvas setup
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = "40px Georgia";
let gameSpeed = 1; //Allows me to alter the speed of the game
let gameOver = false;

//Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect(); //Measure the distance between the screen to the Viewport

const mouse = {
  //To capture mouse coordinates and make them available all around the game
  x: canvas.width / 2, //x coordinate property, in the middle of the screen
  y: canvas.height / 2, //y coordinate property, in the middle of the screen
  click: false, //False at start, to see mouse click or realise
};

canvas.addEventListener("mousedown", function (event) {
  //Run event function when mousedown occurs
  mouse.click = true;
  mouse.x = event.x - canvasPosition.left; //Update the x coordinate in the game when mouse is clicked within the Viewport
  mouse.y = event.y - canvasPosition.top; //Update the y coordinate in the game when mouse is clicked within the Viewport
});
canvas.addEventListener("mouseup", function () {
  mouse.click = false;
});
//Player
const playerLeft = new Image();
playerLeft.src = "kay.png";
const playerRight = new Image();
playerRight.src = "kay_flip.png";
class Player {
  constructor() {
    this.x = canvas.width / 2; //Initial position of the player at x axis before player moves (In the middle of the Viewport)
    this.y = canvas.height / 2; //Initial position of the player at y axis before player moves (In the middle of the Viewport)
    this.radius = 50; //Player symbol is represented by a circle
    this.angle = 0; //To rotate player towards current mouse position.
    this.frameX = -0.1; //Currently displayed frame(X) in spritesheet
    this.frameXRight = 0.0005;
    this.frameYRight = 0.1;
    this.frameY = 0.35; //Currently displayed frame(Y) in spritesheet
    this.frame = 0; //To be able to use multi-line sprite sheet. Keep track overall number of frames on the sheet and the current position we are animated
    this.spriteWidth = 498; //Width of a single frame. Sprite is 1992px wide.Has 4 column, so divide by 4
    this.spriteHeight = 327; //981px, 3 column. Divide by 3
  }
  update() {
    //To update player position to move player towards the mouse
    const dx = this.x - mouse.x; //Distance on the horizontal x axis
    const dy = this.y - mouse.y; // Distance on the vertical y axis
    let theta = Math.atan2(dy, dx);
    this.angle = theta;
    if (mouse.x != this.x) {
      this.x -= dx / 30; //Player can move left to right because dx can be both positive or negative.On reasonable speed, so I divide by 30.Depending on the relative position between mouse and player
    }
    if (mouse.y != this.y) {
      this.y -= dy / 30; //Player can move bottom to up because dy can be both positive or negative.On reasonable speed, so I divide by 30.Depending on the relative position between mouse and player
    }
  }
  draw() {
    // if (mouse.click) {
    //   ctx.lineWidth = 0.2; // Draw a line from mouse position to player
    //   ctx.beginPath();
    //   ctx.moveTo(this.x, this.y); //Start from current position
    //   ctx.lineTo(mouse.x, mouse.y); //End point
    //   ctx.stroke(); // Line that connect both the player and the mouse
    // }

    // ctx.fillStyle = "red"; // Draw a circle that represents player character
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // ctx.fill(); //Call this to draw the circle
    // ctx.closePath();

    ctx.save(); //To save current canvas setting
    ctx.translate(this.x, this.y); //To pass player's current x and y to move rotation center point where player currently is
    ctx.rotate(this.angle);
    if (this.x >= mouse.x) {
      //If x axis is more than my mouse click's x-axis, draw playerLeft
      ctx.drawImage(
        playerLeft, //Image we want to draw
        this.frameX * this.spriteWidth, //SOURCE X.The area we want to crop out from the source sprite sheet. Only want to crop out one frame at at time
        this.frameY * this.spriteHeight, //SOURCE Y.The area we want to crop out from the source sprite sheet. Only want to crop out one frame at at time
        this.spriteWidth, //SOURCE WIDTH.The particular width within the spritesheet that we want to crop out
        this.spriteHeight, //SOURCE HEIGHT.The particular height within the spritesheet that we want to crop out
        0 - 60, // After cropping the sprite from the spritesheet, I want to place the sprite on this particular x-axis. 0 now because position is now reflected in translate
        0 - 45, // After cropping the sprite from the spritesheet, I want to place the sprite on this particular y-axis 0 now because position is now reflected in translate
        this.spriteWidth / 3.5, // Scale the sprite down
        this.spriteHeight / 3.5 // Scale the sprite down
      );
    } else {
      //If my mouse click's x-axis is more than x-axis, draw playerRight
      ctx.drawImage(
        playerRight, //Image we want to draw
        this.frameXRight * this.spriteWidth, //SOURCE X.The area we want to crop out from the source sprite sheet. Only want to crop out one frame at at time
        this.frameYRight * this.spriteHeight, //SOURCE Y.The area we want to crop out from the source sprite sheet. Only want to crop out one frame at at time
        this.spriteWidth, //SOURCE WIDTH.The particular width within the spritesheet that we want to crop out
        this.spriteHeight, //SOURCE HEIGHT.The particular height within the spritesheet that we want to crop out
        0 - 40, // After cropping the sprite from the spritesheet, I want to place the sprite on this particular x-axis. 0 now because position is now reflected in translate
        0 - 40, // After cropping the sprite from the spritesheet, I want to place the sprite on this particular y-axis. 0 now because position is now reflected in translate
        this.spriteWidth / 3.5, // Scale the sprite down
        this.spriteHeight / 3.5 // Scale the sprite down
      );
    }
    ctx.restore(); //Reset all translate and rotate back to last called ctx save. Only player will get translated and rotated and not affect other elements
  }
}
const player = new Player();
//Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = "bubble1.png";
class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * canvas.height; //Add canvas.height in front so bubble will create from the bottom of the Viewport instead
    this.radius = 50;
    this.speed = Math.random() * 5 + 1;
    this.distance; //Keep track of each distance between the individual bubble and player, to trigger score and pop the bubble when player is near enough
    this.counted = false; //Only record 1 point when player touches the bubble. First set as false as counting havent start
    this.sound = Math.random() <= 0.5 ? "sound1" : "sound2"; //if random number is less than or  equal to 0.5 return sound 1 else(:) return sound 2
  }
  update() {
    this.y -= this.speed; //Move bubbles up in negative direction on vertical y axis depending on individual speed
    const dx = this.x - player.x; //bubble's x position - player's current x position
    const dy = this.y - player.y; //bubble's y position - player's current y position
    //With this, we can plot the right angle triangle and identify the hypotenuse(longest side of right angle triangle) Can use Pythagorean theory to calculate the longest side
    this.distance = Math.sqrt(dx * dx + dy * dy); //The formula for the Pythagoras
  }
  draw() {
    // ctx.fillStyle = "blue";
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();
    // ctx.stroke();
    ctx.drawImage(
      bubbleImage,
      this.x - 50,
      this.y - 49,
      this.radius * 2,
      this.radius * 2
    );
  }
}
const bubblePop1 = document.createElement("audio");
bubblePop1.src = "plop.ogg";
const bubblePop2 = document.createElement("audio");
bubblePop2.src = "pop.ogg";

const handleBubbles = () => {
  //if frames at 50/100/150 etc, create new Bubble
  if (gameFrame % 50 == 0) {
    bubblesArray.push(new Bubble());
  }
  for (let i = 0; i < bubblesArray.length; i++) {
    //run through entire array and for each bubble, update and draw it
    bubblesArray[i].update();
    bubblesArray[i].draw();
    if (bubblesArray[i] < 0) {
      //If bubble vertical position is less than 0,
      bubblesArray.splice(i, 1); //Remove bubble with vertical value less than 0, 1 is that I just want to remove 1 element from the array
    }
    if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
      //Check  distance between player and bubble,if close enough, add 1 to score and remove bubble

      if (!bubblesArray[i].counted) {
        if (bubblesArray[i].sound == "sound1") {
          bubblePop1.play();
        } else {
          bubblePop2.play();
        }
        // Only if this not counted is false
        score++; //Record a score after player touches the bubble
        bubblesArray[i].counted = true; //This will only make each bubble count once
        bubblesArray.splice(i, 1); // Bubble disappear when player touches it
      }
    }
  }
};

//Repeating Background
const background = new Image();
background.src = "background1.png";

class Enemy {
  constructor() {
    this.x = canvas.width + 200;
    this.y = Math.random() * (canvas.height - 150) + 90;
    this.radius = 60;
    this.speed = Math.random() * 2 + 2;
    // this.frame = 0;
    // this.frameX = 0;
    // this.frameY = 0;
    // this.spriteWidth = 418;
    // this.spriteHeight = 397;
  }
  draw() {
    // ctx.fillStyle = "red";
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // ctx.fill();
    ctx.drawImage(
      enemyImage,
      this.x - 55,
      this.y - 55,
      this.radius * 1.8,
      this.radius * 1.8
    );
  }
  update() {
    this.x -= this.speed;
    if (this.x < 0 - this.radius * 2) {
      this.x = canvas.width + 200;
      this.y = Math.random() * (canvas.height - 150) + 90;
      this.speed = Math.random() * 2 + 2;
    }
    //collision with player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + player.radius) {
      handleGameOver();
    }
  }
}

const enemy1 = new Enemy();
const handleEnemies = () => {
  enemy1.draw();
  enemy1.update();
};

const handleBackground = () => {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
};
//Enemies
const enemyImage = new Image();
enemyImage.src = "donuts.png";

const handleGameOver = () => {
  ctx.fillStyle = "white";
  ctx.fillText("You ate too many donuts!", 180, 250);
  ctx.fillText("Score: " + score, 330, 300);
  gameOver = true;
};

//Animation Loop
const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //To clear the trail within the canvas dimension
  handleBackground();
  handleBubbles();
  player.update(); //To show player position
  player.draw(); //Draw a line beteween player and mouse and draw circle representing the player
  handleEnemies();
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 10, 50); //Place the score board on x-axis 10 and y-axis 50
  gameFrame++;
  if (!gameOver) requestAnimationFrame(animate);
  // requestAnimationFrame(animate); //Recursion loop animate
};
animate();

// window.addEventListener("resize", function () {
//   //In the event if the window resize, it wont affect the canvas size
//   canvasPosition = canvas.getBoundingClientRect();
// });
