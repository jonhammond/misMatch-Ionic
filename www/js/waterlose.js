var loseState = {
  create: function () {

    var background = game.add.tileSprite(0, 0, 800, 600, 'background')

    var loseLabel = game.add.text(80, 80, 'GAME OVER! Try Again?', { font: '25px Arial', fill: '#ffffff'})

    var startLabel = game.add.text(80, 200, 'Press the "W" key to try again.', {font: "25px Arial", fill: "#ffffff"})

    var startLabel = game.add.text(80, 300, 'Press the "C" key to play a different game.', {font: "25px Arial", fill: "#ffffff"})

    var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);

    wkey.onDown.addOnce(this.restart, this)

    var ckey = game.input.keyboard.addKey(Phaser.Keyboard.C);

    ckey.onDown.addOnce(this.differentGame, this)

  },

  restart: function () {
    game.state.start('Game');
    game.state.states.Game.lost = false;
    game.state.states.Game.playerHealth = 100;
  },

  differentGame: function () {
    window.location.href = '/'
  }
  
}
