//add spikes
//add health bar
//different tilemap / SceneB
class MenuScene extends BaseScene {
  map;
  player;
  playerStartPoint;
  cursors; //controls
  keyA;
  keyD;
  inPlay = false; //boollean
  coins;
  score = 0;
  scoreText;
  enemys; //enemy slime
  slimeColliders;
  
  endScreen;

  constructor(config) {
    super('MenuScene');
  }
  preload() {
    //screens
    //this.load.image('intro', 'assets/introScren.png');
    //this.load.image('rip', 'assets/deadFinal.png');
    //audio
    //this.load.audio('music', 'assets/sounds/Motivated.mp3');
    //images
    this.load.image('menu', 'assets/menuScreen.png');
    this.load.image('tiles', 'assets/game-tiles.png');
    this.load.image('coin', 'assets/goldCoing.png');
    //tilemap data
    this.load.tilemapTiledJSON('interactive-menu', 'assets/interactive-menu.json');
    //player
    this.load.spritesheet('player', 'assets/alienFinal.png', {
      frameWidth: 24,
      frameHeight: 32
    })
  } //end of preload

  // create is making the images/spritesheet load into browser
  create() {
    this.add.image(240, 222, 'menu').setScrollFactor(0, 0);
    this.map = this.make.tilemap({ key: 'interactive-menu' });
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    //platform-tiles = the tiled name
    let tiles = this.map.addTilesetImage('menu-tiles', 'tiles');
    let collisionLayer = this.map.createStaticLayer('collisionLayer', [tiles], 0, 0);
    collisionLayer.setCollisionBetween(1, 1000);
    //extras
    this.map.createStaticLayer('extrasLayer', [tiles]);
    //player
    this.playerStartPoint = SceneA.FindPoint(this.map, 'objectLayer', 'player', 'playerSpawn');
    this.player = this.physics.add.sprite(this.playerStartPoint.x, this.playerStartPoint.y, 'player');
    this.player.jumpCount = 0;
    //resize the body of player 
    //using the dimensions of the image 23x32
    this.player.body.setSize(23, 32, true);
    //collision to tilemap
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, collisionLayer);
    //collectable = coin
    let coinPoints = MenuScene.FindPoints(this.map, 'objectLayer', 'coin');
    this.coins = this.physics.add.staticGroup();
    for (var point, i = 0; i < coinPoints.length; i++) {
      point = coinPoints[i];
      this.coins.create(point.x, point.y, 'coin');
    }
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    //controls
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    //walking anims
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', {
        start: 1,
        end: 4
      }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 0
      }),
    });
    //controls
    this.cursors = this.input.keyboard.createCursorKeys();
    //camera control
    let camera = this.cameras.getCamera('');
    camera.startFollow(this.player); //can add other params
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    //pointer down is an event
    this.input.on('pointerdown', this.startGame, this);
  } //end of create

  update() {
    super.update();
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);

    if( this.coins.countActive(true)==0) {
      this.scene.start('SceneA');
    }
  }

  startGame() {
    this.input.removeListener('pointerdown');
    this.inPlay = true;
  }

  
  restartGame(){
    this.input.removeListener('pointerdown');
    this.tweens.add(
      
    )
    //restating music
    this.music.stop();
    
    //screen
    //this.introScreen;
    this.endScreen;
    //score restart
    this.score = 0;
    this.scoreText.setText('Score 0');
    //player restart
    this.player.x = this.playerStartPoint.x;
    this.player.y = this.playerStartPoint.y;
    this.inPlay = true;
    //slime restart
    this.slimeColliders = this.physics.add.collider(this.player, this.enemys, this.slimeAttack, null, this); 
    this.enemys.x = this.slimeStartPoint.x;
    this.enemys.y = this.slimeStartPoint.y;
    this.inPlay = true;
    //collectable restart
    this.coins.children.iterate(function(child){
      child.enableBody(true, child.x, child.y, true, true);
      
    })
  }
  static FindPoint(map, layer, type, name) {
    var loc = map.findObject(layer, function (object) {
      if (object.type === type && object.name === name) {
        return object;
      }
    });
    return loc
  }
  static FindPoints(map, layer, type) {
    var locs = map.filterObjects(layer, function (object) {
      if (object.type === type) {
        return object
      }
    });
    return locs
  }
} // end of class 