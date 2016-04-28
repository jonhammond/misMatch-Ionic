var game = new Phaser.Game(360, 600, Phaser.AUTO, 'game')

var PhaserGame = function () {
  this.player = null;
  this.ground = null;
  this.cursors;
  this.playerHealth = 100;
  this.playerHealthText;
  this.treasureText;
  this.stationary = null;
  this.floatingPlatforms = null;

  this.facing = 'right';
  this.jumpTimer = 0;
  this.locked = false;
  this.lockedTo = null;
  this.wasLocked = false;
  this.willJump = false;
  this.jumpCount = 0;

  this.pad;
  this.rightButton;
  this.leftButton;
  this.jumpButton;
  this.movingLeft = false;
  this.movingRight = false;

};

PhaserGame.prototype = {
  // Initialize Game Render and Physics Systen
  init: function () {
    this.game.renderer.renderSession.roundPixels = true;
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 600;
    this.world.resize(800*2, 600);
  },

  preload: function () {
    // Load assets
    this.load.image('background', 'assets/waterLevel/coralBackground.png');
    this.load.image('rightPlatform', 'assets/waterLevel/rightwaterplatform.png');
    this.load.image('smallLeftPlatform', 'assets/waterLevel/smallLeftWaterPlatform.png');
    this.load.image('smallPlatform', 'assets/waterLevel/smallPlatform.png');
    this.load.image('floor', 'assets/waterLevel/waterFloor.png');
    this.load.image('bubble', 'assets/waterLevel/bubble.png');
    this.load.image('rightStick', 'assets/waterLevel/rightArrow.png');
    this.load.image('leftStick', 'assets/waterLevel/leftArrow.png');
    this.load.image('jumpButton', 'assets/waterLevel/redButton.png');

    this.load.spritesheet('treasure', 'assets/waterLevel/treasure.png', 56, 39);
    this.load.spritesheet('shark', 'assets/waterLevel/customSharkSheet.png', 200, 98);
    this.load.spritesheet('mario', 'assets/sprites/mariosprite.png', 21, 35);
    this.load.spritesheet('dude', 'assets/sprites/dude.png', 32, 48);
  }, //end of preload

  create: function () {
    // Initialize background
    this.background = this.add.tileSprite(0, 0, 800, 600, 'background');
    this.background.fixedToCamera = true;

    this.ground = this.add.tileSprite(0, 600, 1600, 20, 'floor');
    this.physics.arcade.enable(this.ground);
    this.ground.immovable = true;
    this.ground.body.collideWorldBounds = true;

    // Fixed ground glitch with below code, but ground does not extend full width
    // this.ground = this.add.physicsGroup();
    // this.ground.create(0, 570, 'floor')
    // this.ground.setAll('body.allowGravity', false);
    // this.ground.setAll('body.immovable', true);

    // create stationary platforms
    this.stationary = this.add.physicsGroup();
    this.stationary.create(1450, 150, 'rightPlatform');
    this.stationary.setAll('body.allowGravity', false);
    this.stationary.setAll('body.immovable', true);

    // create moving platforms
    this.floatingPlatforms = this.add.physicsGroup();
    this.floatingPlatforms.collideWorldBounds = true;
    // this.floatingPlatforms.setAll('body.immovable', true);
    this.physics.arcade.enable(this.floatingPlatforms);

    this.floatingPlatform1 = new MovingPlatform(this.game, 0, 300, 'smallLeftPlatform', this.floatingPlatforms)
    this.floatingPlatform1.addMotionPath([
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-50", ySpeed: 3500, yEase: "Linear" },
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+50", ySpeed: 3500, yEase: "Linear" }
      ])

    this.floatingPlatform2 = new MovingPlatform(this.game, 400, 100, 'smallPlatform', this.floatingPlatforms)
    this.floatingPlatform2.addMotionPath([
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+75", ySpeed: 3500, yEase: "Linear" },
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-75", ySpeed: 3000, yEase: "Linear" }
      ])

    this.floatingPlatform3 = new MovingPlatform(this.game, 700, 400, 'smallPlatform', this.floatingPlatforms)
    this.floatingPlatform3.addMotionPath([
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+50", ySpeed: 3500, yEase: "Linear" },
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-50", ySpeed: 3500, yEase: "Linear" }
      ])

    this.floatingPlatform3 = new MovingPlatform(this.game, 1100, 200, 'smallPlatform', this.floatingPlatforms)
    this.floatingPlatform3.addMotionPath([
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+150", ySpeed: 3500, yEase: "Linear" },
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-150", ySpeed: 3500, yEase: "Linear" }
      ])

    // Run floating platforms
    this.floatingPlatforms.callAll('start')

    // Baddies

    this.baddies = this.add.physicsGroup();

    // Shark 1
    this.shark = new Baddie(this.game, -100, 400, 'shark', this.baddies)
    this.shark.addMotionPath([
      { x: "+600", xSpeed: 6000, xEase: "Linear", y: "-50", ySpeed: 2500, yEase: "Sine.easeIn" },
      { x: "-500", xSpeed: 6000, xEase: "Linear", y: "+50", ySpeed: 2500, yEase: "Sine.easeIn" }
    ])
    this.shark.animations.add('right', [0, 1, 2, 1, 0], 10, true);
    this.shark.animations.add('left', [3, 4, 5, 4, 3], 10, true);
    this.shark.animations.add('rightBite', [8, 6], 10, true);
    this.shark.animations.add('leftBite', [9, 7], 10, true);

    // Shark 2
    this.shark2 = new Baddie(this.game, 600, 200, 'shark', this.baddies)
    this.shark2.addMotionPath([
      { x: "+300", xSpeed: 5000, xEase: "Linear", y: "+75", ySpeed: 2500, yEase: "Sine.easeIn" },
      { x: "-300", xSpeed: 3500, xEase: "Linear", y: "-75", ySpeed: 2500, yEase: "Sine.easeIn" }
    ])
    this.shark2.animations.add('right', [0, 1, 2, 1, 0], 10, true);
    this.shark2.animations.add('left', [3, 4, 5, 4, 3], 10, true);
    this.shark2.animations.add('rightBite', [8, 6], 10, true);
    this.shark2.animations.add('leftBite', [9, 7], 10, true);

    // Run animation for baddies
    this.baddies.callAll('start');

    // Instantiate cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);

    // Instantiate Buttons
    this.rightButton = this.add.button(50, 0, 'rightStick', moveRight, this)
    this.leftButton = this.add.button(0, 0, 'leftStick', moveLeft, this)
    this.jumpButton = this.add.button(100, 0, 'jumpButton', moveUp, this)

    this.rightButton.fixedToCamera = true;
    this.leftButton.fixedToCamera = true;
    this.jumpButton.fixedToCamera = true;

    // Create Player
    // Mario Sprite
    // this.player = this.add.sprite(0, 200, 'mario')
    // this.physics.arcade.enable(this.player);
    // this.player.body.collideWorldBounds = true;
    // this.player.body.setSize(20, 20, 5, 16);
    // this.player.body.gravity.y = 600;

    //  Dude Sprite
    this.player = this.add.sprite(32, 0, 'dude');
    this.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20, 32, 5, 16);
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    //camera follows player
    this.camera.follow(this.player)

    // Player directional animations
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [7, 8, 9, 10, 11], 10, true);

    // Player Health and Treasure indicator
    this.playerHealthText = game.add.text(16, 48, 'Health: 100', {
      fontSize: '32px',
      fill: '#000'
    })
    this.playerHealthText.fixedToCamera = true;

    this.treasure = this.add.sprite(1550, 50, 'treasure');
    this.physics.arcade.enable(this.treasure);
    this.treasure.body.collideWorldBounds = true;
    this.treasure.body.setSize(56, 39, 0, -10);

  },   //end of create

  customSep: function (player, platform) {
    if (!this.locked && player.body.velocity.y > 0)
    {
      this.locked = true;
      this.lockedTo = platform;
      platform.playerLocked = true;
      player.body.velocity.y = 0;
    }
  },

  checkLock: function () {
      this.player.body.velocity.y = 0;
      //  If the player has walked off either side of the platform then they're no longer locked to it
      if (this.player.body.right < this.lockedTo.body.x || this.player.body.x > this.lockedTo.body.right)
      { this.cancelLock(); }
    },

    cancelLock: function () {
      this.wasLocked = true;
      this.locked = false;
    },

    preRender: function () {
      if (this.game.paused)
      { //  Because preRender still runs even if your game pauses!
        return;}
      if (this.locked || this.wasLocked)
      { this.player.x += this.lockedTo.deltaX;
        this.player.y = this.lockedTo.y - 48;
          if (this.player.body.velocity.x !== 0)
          { this.player.body.velocity.y = 0; }
      }
      if (this.willJump)
      { this.willJump = false;
        if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked)
        { //  If the platform is moving up we add its velocity to the players jump
          this.player.body.velocity.y = -400 + (this.lockedTo.deltaY * 10); }
          else
          { this.player.body.velocity.y = -400; }
          this.jumpTimer = this.time.time + 750;
      }
      if (this.wasLocked)
      { this.wasLocked = false;
        this.lockedTo.playerLocked = false;
        this.lockedTo = null;}
    },

  update: function() {
  // BADDIE PHYSICS
  //Shark 1 Animation
  if(this.shark.body.position.x === -200 || this.shark.body.position.x < 1) {
    {this.shark.play('right')}
  }
  if(this.shark.body.position.x === 500)
   {this.shark.play('left')}

  // Shark 2 Animation
  if(this.shark2.body.position.x === 600 || this.shark2.body.position.x === 500) {
    {this.shark2.play('right')}
  }
  if(this.shark2.body.position.x === 900)
   {this.shark2.play('left')}


  // PLAYER PHYSICS
    this.physics.arcade.collide(this.player, this.stationary);
    this.physics.arcade.collide(this.player, this.ground);
    this.physics.arcade.collide(this.treasure, this.stationary);
    this.physics.arcade.collide(this.player, this.floatingPlatforms, this.customSep, null, this);

    //  Do this AFTER the collide check, or we won't have blocked/touching set
    var standing = this.player.body.blocked.down || this.player.body.touching.down || this.locked;

    this.player.body.velocity.x = 0;


    if (this.cursors.left.isDown || this.movingLeft)
      { this.player.body.velocity.x = -150;
        if (this.facing !== 'left')
        { this.player.play('left');
          this.facing = 'left'; }
      }
      else if (this.cursors.right.isDown || this.movingRight)
      { this.player.body.velocity.x = 150;
        if (this.facing !== 'right')
        { this.player.play('right');
          this.facing = 'right'; }
      }
      else {
       if (this.facing !== 'idle')
        { this.player.animations.stop();
          if (this.facing === 'left') { this.player.frame = 0; }
          else { this.player.frame = 5; }
        this.facing = 'idle';
        }
      }

      if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer)
      {
        if (this.locked)
        { this.cancelLock(); }
      }

      if (this.locked)
      { this.checkLock();}

      if (standing) {
        this.jumpCount = 0;
        // console.log(this.jumpCount)
      }

    // Jump and double-jump
    this.jumpKey.onDown.add(jumpCheck, this);

    // Decrement player playerHealth when colliding with sharks
    game.physics.arcade.overlap(this.player, this.shark, lowerHealth, null, this);
    game.physics.arcade.overlap(this.player, this.shark, sharkBite, null, this);
    game.physics.arcade.overlap(this.player, this.shark2, lowerHealth, null, this);
    game.physics.arcade.overlap(this.player, this.shark2, shark2Bite, null, this);
    game.physics.arcade.overlap(this.player, this.treasure, this.Win, null, this);

    // Function: Animate shark1 bite
    function sharkBite(player, shark) {
      if (this.shark.animations.currentAnim.name === "right")
        {this.shark.play('rightBite')}
      if (this.shark.animations.currentAnim.name === "left")
        {this.shark.play('leftBite')}
      // console.log(this.shark.animations.currentAnim.name)
      this.player.body.velocity.y = -200;
    }

    // Function: Animate shark2 bite
    function shark2Bite(player, shark) {
      if (this.shark2.animations.currentAnim.name === "right")
        {this.shark2.play('rightBite')}
      if (this.shark2.animations.currentAnim.name === "left")
        {this.shark2.play('leftBite')}
      // console.log(this.shark.animations.currentAnim.name)
      this.player.body.velocity.y = -200;
    }

    // Function: Lower player playerHealth, kill player
    function lowerHealth(player, shark) {
      this.playerHealth -= 10;
      this.playerHealthText.text = 'Health:' + this.playerHealth
      if (this.playerHealth === 0) {
        player.kill()
      }
    }

    // Function: Collect treasure
    function collectTreasure(player, treasure) {
      treasure.kill()
    }

    // Add bubbles
    Bubble();

  },   //end of update
  Win: function () {
    game.state.start('win');
  }
}

moveRight = function() {
  this.player.body.velocity.x = 150;
  this.movingLeft = false;
  this.movingRight = true;
}

moveLeft = function() {
  this.player.body.velocity.x = -150;
  this.movingRight = false;
  this.movingLeft = true;
}

moveUp = function() {
  this.player.body.velocity.y = -350;
  console.log('jump')
}

jumpCheck = function () {
  if (this.jumpCount < 2) {
    this.player.body.velocity.y = -350;
    this.jumpCount ++;
  }
}

Baddie = function (game, x, y, key, group) {
  if (typeof group === 'undefined') {
    group = game.world; }

  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.immovable = true;
  this.playerLocked = false;
  group.add(this);
};

// Adding Bubbles
Bubble = function () {
  for (var i = 0; i < 1; i ++) {
    this.bubbles = game.add.group();
    this.bubbles.enableBody = true;
    var x = Math.random()*1600;
    this.bubble = this.bubbles.create(x, 900, 'bubble');
    this.bubble.body.gravity.y = -700;
    }
  }

// Adding Moving Platforms
MovingPlatform = function (game, x, y, key, group) {
  if (typeof group === 'undefined') { group = game.world; }
  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.immovable = true;
  this.playerLocked = false;
  group.add(this);
};


// Prototypes
Baddie.prototype = Object.create(Phaser.Sprite.prototype);
Baddie.prototype.constructor = Baddie;

Baddie.prototype.addMotionPath = function (motionPath) {
  this.tweenX = this.game.add.tween(this.body);
  this.tweenY = this.game.add.tween(this.body);

  for (var i = 0; i < motionPath.length; i++)
  { this.tweenX.to( { x: motionPath[i].x },
  motionPath[i].xSpeed, motionPath[i].xEase);
    this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
  }
  this.tweenX.loop();
  this.tweenY.loop();
};

Baddie.prototype.start = function () {
  this.tweenX.start();
  this.tweenY.start();
};

Baddie.prototype.stop = function () {
  this.tweenX.stop();
  this.tweenY.stop();
};

MovingPlatform.prototype = Object.create(Phaser.Sprite.prototype);
MovingPlatform.prototype.constructor = MovingPlatform;

MovingPlatform.prototype.addMotionPath = function (motionPath) {
    this.tweenX = this.game.add.tween(this.body);
    this.tweenY = this.game.add.tween(this.body);
    for (var i = 0; i < motionPath.length; i++)
    {
        this.tweenX.to( { x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
        this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
    }
    this.tweenX.loop();
    this.tweenY.loop();
};

MovingPlatform.prototype.start = function () {
    this.tweenX.start();
    this.tweenY.start();
};

MovingPlatform.prototype.stop = function () {
    this.tweenX.stop();
    this.tweenY.stop();
};

// Call game
game.state.add('Game', PhaserGame, true);
game.state.add('win', winState)
