var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game');
var PhaserGame = function () {
    this.bg = null;
    this.trees = null;
    this.player = null;
    this.stationary = null;
    this.lava = null;
    this.clouds = null;
    this.ground = null;
    this.facing = 'right';
    this.jumpTimer = 0;
    this.cursors;
    this.locked = false;
    this.lockedTo = null;
    this.wasLocked = false;
    this.willJump = false;
    var music;
    var jump;

};
PhaserGame.prototype = {
    init: function () {
        this.game.renderer.renderSession.roundPixels = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 600;
    },
    preload: function () {
        this.load.image('background', 'assets/spaceLevel/background2.jpg');
        this.load.image('platform', 'assets/spaceLevel/whiteplatform.png');
        this.load.spritesheet('hero', 'assets/sprites/MegaManSprite.png', 41.2,43 );
        this.load.audio('theBeats', 'assets/sounds/Scott Pilgrim Vs The World - The Game - Scott Pilgrim Theme.mp3');
        this.load.audio('jump', 'assets/sounds/jump.mp3');


    },
    create: function () {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background');
        //this.background.fixedToCamera = true;
        jump = this.add.audio('jump');
        music = this.add.audio('theBeats');
        music.play();

        this.stationary = this.add.physicsGroup();
        this.stationary.create(-20, 220, 'platform');
        this.stationary.create(700, 380, 'platform');
        this.stationary.create(-5,575,'platform');
        this.stationary.create(300,575,'platform');
        this.stationary.create(625, 575, 'platform');
        this.stationary.setAll('body.allowGravity', false);
        this.stationary.setAll('body.immovable', true);
        //  Platforms that move
        this.clouds = this.add.physicsGroup();
        var cloud1 = new CloudPlatform(this.game, 400, 450, 'platform', this.clouds);
        cloud1.scale.x = 0.75;
        cloud1.addMotionPath([
            { x: "0", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" },
            { x: "0", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeOut" },
            { x: "0", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeIn" },
            { x: "0", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeOut" }
        ]);
        var cloud2 = new CloudPlatform(this.game, 100, 450, 'platform', this.clouds);
        cloud2.scale.x = 0.5;
        cloud2.addMotionPath([
            { x: "+100", xSpeed: 2000, xEase: "Linear", y: "+0", ySpeed: 2500, yEase: "Sine.easeIn" },
            { x: "-100", xSpeed: 2000, xEase: "Linear", y: "-0", ySpeed: 2500, yEase: "Sine.easeOut" }
        ]);
        var cloud3 = new CloudPlatform(this.game, 650, 150,'platform', this.clouds);
        cloud3.addMotionPath([
            { x: "+200", xSpeed: 2000, xEase: "Linear", y: "+0", ySpeed: 2500, yEase: "Sine.easeIn" },
            {x: "-200", xSpeed: 2000, xEase: "Linear", y: "-0", ySpeed: 2500, yEase: "Sine.easeOut"}
        ]);

        //  The Player
         this.player = this.add.sprite(32, 0, 'hero');

         this.physics.arcade.enable(this.player);
        //
         this.player.body.collideWorldBounds = true;
         this.player.body.setSize(20, 32, 5, 16);

         this.player.animations.add('left', [0, 1, 2, 3,4], 10, true);
         //this.player.animations.add('turn', [4], 20, true);
         this.player.animations.add('right', [5, 6, 7, 8,9], 10, true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.clouds.callAll('start');

    },
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
        {
            this.cancelLock();
        }
    },
    cancelLock: function () {
        this.wasLocked = true;
        this.locked = false;
    },
    preRender: function () {
        if (this.game.paused)
        {
            //  Because preRender still runs even if your game pauses!
            return;
        }
        if (this.locked || this.wasLocked)
        {
            this.player.x += this.lockedTo.deltaX;
            this.player.y = this.lockedTo.y - 48;
            if (this.player.body.velocity.x !== 0)
            {
                this.player.body.velocity.y = 0;
            }
        }
        if (this.willJump)
        {
            this.willJump = false;
            if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked)
            {
                //  If the platform is moving up we add its velocity to the players jump
                this.player.body.velocity.y = -400 + (this.lockedTo.deltaY * 10);
            }
            else
            {
                this.player.body.velocity.y = -400;
            }
            this.jumpTimer = this.time.time + 750;
        }
        if (this.wasLocked)
        {
            this.wasLocked = false;
            this.lockedTo.playerLocked = false;
            this.lockedTo = null;
        }
    },
    update: function () {
        this.background.tilePosition.x = -(this.camera.x * 0.7);
        // this.lava.tilePosition.x = -(this.camera.x * 10);
        this.physics.arcade.collide(this.player, this.stationary);
        this.physics.arcade.collide(this.player, this.clouds, this.customSep, null, this);
        //  Do this AFTER the collide check, or we won't have blocked/touching set
        var standing = this.player.body.blocked.down || this.player.body.touching.down || this.locked;
        this.player.body.velocity.x = 0;
        if (this.cursors.left.isDown)
        {
            this.player.body.velocity.x = -150;
            if (this.facing !== 'left')
            {
                this.player.play('left');
                this.facing = 'left';
            }
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.velocity.x = 150;
            if (this.facing !== 'right')
            {
                this.player.play('right');
                this.facing = 'right';
            }
        }
        else
        {
            if (this.facing !== 'idle')
            {
                this.player.animations.stop();
                if (this.facing === 'left')
                {
                    this.player.frame = 0;
                }
                else
                {
                    this.player.frame = 5;
                }
                this.facing = 'idle';
            }
        }
        if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer)
        {
            if (this.locked)
            {
                this.cancelLock();
            }
            this.willJump = true;
            jump.play();
        }
        if (this.locked)
        {
            this.checkLock();
        }
        game.physics.arcade.overlap(this.player, this.lava, lavaKill, null, this);
        function lavaKill(player, lava) {
            player.kill()
        }
        // fix function above to kill player on overlap with lava
    }
};
CloudPlatform = function (game, x, y, key, group) {
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
CloudPlatform.prototype = Object.create(Phaser.Sprite.prototype);
CloudPlatform.prototype.constructor = CloudPlatform;
CloudPlatform.prototype.addMotionPath = function (motionPath) {
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
CloudPlatform.prototype.start = function () {
    this.tweenX.start();
    this.tweenY.start();
};
CloudPlatform.prototype.stop = function () {
    this.tweenX.stop();
    this.tweenY.stop();
};
game.state.add('Game', PhaserGame, true);
