//add health bar NOT DONE
//different tilemap / SceneB# DONE
//add finish line
class SceneB extends BaseScene{
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
  finishScreen;

  constructor(config) {
    super('SceneB');
  }
  preload() {
    //screens
    this.load.image('rip', 'assets/deadFinal.png');
    this.load.image('win', 'assets/finishScreen.png');
    //images
    this.load.image('forest', 'assets/forest-image.jpg');
    this.load.image('tiles', 'assets/game-tiles2.png');
    this.load.image('coin', 'assets/goldCoing.png');
    this.load.image('flag', 'assets/flagRed.png');
    //tilemap data
    this.load.tilemapTiledJSON('platform-map2', 'assets/platform-christmas-part2.json');
    //player
    this.load.spritesheet('player', 'assets/alienFinal.png', {
      frameWidth: 24,
      frameHeight: 32
    })
    this.load.spritesheet('slime', 'assets/slime.png', {
      frameWidth: 20,
      frameHeight: 20,
    })

  }

  // create is making the images/spritesheet load into browser
   create() {
    //adding tilemap
    this.add.image(112, 112, 'forest').setScrollFactor(0, 0);
    this.map = this.make.tilemap({ key: 'platform-map2' });
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    //platform-tiles = the tiled name
    let tiles = this.map.addTilesetImage('platform-tiles2', 'tiles');
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
    //enemy
    this.anims.create({
      key: 'drag',
      frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 2 }),
      frameRate: 1.5,
      repeat: -1,

    })
    this.enemys = this.physics.add.group();
    let enemyPoints = SceneA.FindPoints(this.map, 'objectLayer', 'slime');
    let len = enemyPoints.length / 2;
    for (var slimeSpawn, slimeDest, line, slime, i = 1; i < len + 1; i++) {
      slimeSpawn = SceneA.FindPoint(this.map, 'objectLayer', 'slime', 'slimeSpawn' + i);
      slimeDest = SceneA.FindPoint(this.map, 'objectLayer', 'slime', 'slimeDest' + i);
      line = new Phaser.Curves.Line(slimeSpawn, slimeDest);
      slime = this.add.follower(line, slimeSpawn.x, slimeSpawn.y, 'slime');
      slime.startFollow({
        duration: Phaser.Math.Between(1500, 2500),
        //how many times will it play (infinite)
        repeat: -1,
        //to go left and right
        yoyo: true,
        ease: 'slime.easeInOut'
      });
      slime.anims.play('drag', true);
      this.enemys.add(slime);
      slime.body.allowGravity = false;
    }
    //phsysics for slime attack 
    this.slimeColliders = this.physics.add.collider(this.player, this.enemys, this.slimeAttack, null, this);
    
    //collectable = coin
    let coinPoints = SceneA.FindPoints(this.map, 'objectLayer', 'coin');
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
    //testing
    //this.player.anims.play('walk', true);
    this.player.on('animationComplete-idle', this.showEndScreen, this)
    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('player', {
        start: 5,
        end: 6
      }),
      frameRate: 12,      
      repeat: 0
    });
    this.player.on('animationcomplete-die', this.showEndScreen, this)
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
    //screens
    this.endScreen = this.add.image(224, 200, 'rip').setScrollFactor(0, 0).setAlpha(0);
    this.finishScreen = this.add.image(224, 200, 'win').setScrollFactor(0, 0).setAlpha(0);
    //Score
    this.scoreText = this.add.text(5, 5, 'Score 0', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontFamily: 'Century Gothic , sans-serif'
    }).setScrollFactor(0);
    //pointer down is an event
    this.input.on('pointerdown', this.startGame, this);


  } //end of create

  update() {
    super.update();
  }
  slimeAttack(player, slime) {
    this.inPlay = false;
    this.player.setVelocityX(0);
    this.player.anims.play('die', true);
    this.physics.world.removeCollider(this.slimeColliders);
  }


  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score:' + this.score);
    if( this.coins.countActive(true)==0) {
      this.tweens.add(
        {
          targets: this.finishScreen,
          //alpha = transparency
          alpha: { value: 1, duration: 1000, ease: 'Power1' }
        }
      )
      this.input.on('pointerdown', this.restartGame, this);
    }
  }

  startGame() {
    this.input.removeListener('pointerdown');
    this.inPlay = true;
  }

  showEndScreen() {
    this.tweens.add(
      {
        targets: this.endScreen,
        //alpha = transparency
        alpha: { value: 1, duration: 1000, ease: 'Power1' }
      }
    )
    this.input.on('pointerdown', this.restartGame, this);
  }

  restartGame(){
    this.input.removeListener('pointerdown');
    this.scene.start('MenuScene');
    //score restart
    this.score = 0;
    this.scoreText.setText('Score 0');
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