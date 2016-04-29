var winState = {
  preload: function () {
    // Load assets
    this.load.image('jumpButton', 'assets/waterLevel/redButton.png');

  }, //end of preload

  create: function () {

    var background = game.add.tileSprite(0, 0, 360, 600, 'background')

    var winLabel = game.add.text(20, 80, 'YOU GOT THE TREASURE!', { font: '25px Arial', fill: '#ffffff'})

    var startLabel = game.add.text(20, 200, 'Restart', {font: "25px Arial", fill: "#ffffff"})

    var restart = this.add.button(120, 190, 'jumpButton', this.restart, this)

    var startLabel = game.add.text(20, 300, 'Play a different game.', {font: "25px Arial", fill: "#ffffff"})

    var differentGameButton = this.add.button(270, 290, 'jumpButton', this.differentGame, this)

  },

  restart: function () {
    game.state.start('Game')
    game.state.states.Game.playerHealth = 100;
    game.state.states.Game.movingRight = false;
    game.state.states.Game.movingLeft = false;
  },

  differentGame: function () {
    window.location.href = '/'
  }

}
