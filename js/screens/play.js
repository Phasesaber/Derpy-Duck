game.PlayScreen = me.ScreenObject.extend({
    init: function() {
        me.audio.play("theme", true);
        // lower audio volume on firefox browser
        var vol = me.device.ua.contains("Firefox") ? 0.3 : 0.5;
        me.audio.setVolume(vol);
        this.parent(this);
    },

    onResetEvent: function() {
        me.audio.stop("theme");
        if (!game.data.muted){
            me.audio.play("theme", true);
        }

        me.input.bindKey(me.input.KEY.SPACE, "fly", true);
        game.data.score = 0;
        game.data.steps = 0;
        game.data.start = false;
        game.data.newHiscore = false;


        var rand = Math.floor((Math.random() * 6) + 1);
        if(rand == 1){
            me.game.world.addChild(new BackgroundLayer('bg', 1));
        }
        else if(rand == 2){
            me.game.world.addChild(new BackgroundLayer('bg2', 1));
        }
        else if(rand == 3){
            me.game.world.addChild(new BackgroundLayer('bg3', 1));
        }
        else if (rand == 4){
            me.game.world.addChild(new BackgroundLayer('bg4', 1));
        }
        else if(rand == 5){
            me.game.world.addChild(new BackgroundLayer('bg5', 1));
        }
        else if(rand == 6){
            me.game.world.addChild(new BackgroundLayer('bg6', 1));
        }
        

        this.ground1 = new Ground(0, me.video.getHeight() - 96);
        this.ground2 = new Ground(me.video.getWidth(), me.video.getHeight() - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);

        this.bird = me.pool.pull("clumsy", 60, me.game.viewport.height/2 - 100);
        me.game.world.addChild(this.bird, 10);

        //inputs
        me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.SPACE);

        this.getReady = new me.SpriteObject(
            me.video.getWidth()/2 - 200,
            me.video.getHeight()/2 - 100,
            me.loader.getImage('getready')
        );
        me.game.world.addChild(this.getReady, 11);

        var fadeOut = new me.Tween(this.getReady).to({alpha: 0}, 2000)
            .easing(me.Tween.Easing.Linear.None)
            .onComplete(function() {
                        game.data.start = true;
                        me.game.world.addChild(new PipeGenerator(), 0);
             }).start();
    },

    onDestroyEvent: function() {
        me.audio.stopTrack('theme');
        // free the stored instance
        this.HUD = null;
        this.bird = null;
        this.ground1 = null;
        this.ground2 = null;
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.mouse.LEFT);
    }
});
