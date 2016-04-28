var winState = {
  create: function () {

    var winLabel = game.add.text(80, 80, 'YOU WON!', { font: '25px Arial', fill: '#ffffff'})

    var startLabel = game.add.text(80, game.world.height-80, 'press the "W" key to restart', {font: "25px Arial", fill: "#ffffff"})

    var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);

    wkey.onDown.addOnce(this.restart, this)

  },

  restart: function () {
    game.state.start('Game')
  }
}
 // add this to waterlevel.js: game.physics.arcade.overlap(this.player, this.treasure, collectTreasure, this.Win, null, this)
