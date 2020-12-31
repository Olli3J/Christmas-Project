class BaseScene extends Phaser.Scene {
    constructor(id) {
        super(id);
      }
      update() {
        if (this.inPlay) {
          if (this.cursors.left.isDown || this.keyA.isDown) {
            this.player.setVelocityX(-130);
            if (this.player.body.blocked.down) {
              this.player.anims.play('walk', true);
            } else {
              this.player.anims.play('idle', true);
            }
            this.player.flipX = true;
          } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(130);
            if (this.player.body.blocked.down) {
              this.player.anims.play('walk', true);
            } else {
              this.player.anims.play('idle', true);
            }
            this.player.flipX = false;
          } else {
            this.player.setVelocityX(0);
            this.player.anims.play('idle', true);
          }
          if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.jumpCount < 2) {
            this.player.jumpCount++;
            this.player.setVelocityY(-200);
          } else if (this.player.body.blocked.down) {
            this.player.jumpCount = 0;
    
          }
        }
      }
}