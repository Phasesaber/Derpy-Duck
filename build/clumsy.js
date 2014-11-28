var game = {
    data: {
        score : 0,
        steps: 0,
        start: false,
        newHiScore: false,
        muted: false,
        paused: false
    },

    "onload": function() {
        if (!me.video.init("screen", 900, 600, true, 'auto')) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        me.audio.init("mp3,ogg");
        me.loader.onload = this.loaded.bind(this);
        me.loader.preload(game.resources);
        me.state.change(me.state.LOADING);
    },

    "loaded": function() {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());
        me.state.set(me.state.GAME_OVER, new game.GameOverScreen());

        me.input.bindKey(me.input.KEY.SPACE, "fly", true);
        me.input.bindKey(me.input.KEY.M, "mute", true);
        me.input.bindKey(me.input.KEY.P, "pause", true);
        me.input.bindPointer(me.input.KEY.SPACE);


        me.pool.register("clumsy", BirdEntity);
        me.pool.register("pipe", PipeEntity, true);
        me.pool.register("hit", HitEntity, true);

        // in melonJS 1.0.0, viewport size is set to Infinity by default
        me.game.viewport.setBounds(0, 0, 900, 600);
        me.state.change(me.state.MENU);
    }
};

game.resources = [
    // images
    {name: "bg", type:"image", src: "data/img/bg.png"},
    {name: "bg6", type:"image", src: "data/img/bg6.png"},
    {name: "bg2", type:"image", src: "data/img/bg2.png"},
    {name: "bg3", type:"image", src: "data/img/bg3.png"},
    {name: "bg4", type:"image", src: "data/img/bg4.png"},
    {name: "bg5", type:"image", src: "data/img/bg5.png"},
    {name: "clumsy", type:"image", src: "data/img/clumsy.png"},
    {name: "clumsy2", type:"image", src: "data/img/clumsy2.png"},
    {name: "clumsy3", type:"image", src: "data/img/clumsy3.png"},
    {name: "clumsy4", type:"image", src: "data/img/clumsy4.png"},
    {name: "clumsy5", type:"image", src: "data/img/clumsy5.png"},
    {name: "clumsy6", type:"image", src: "data/img/clumsy6.png"},
    {name: "pipe", type:"image", src: "data/img/pipe.png"},
    {name: "logo", type:"image", src: "data/img/logo.png"},
    {name: "ground", type:"image", src: "data/img/ground.png"},
    {name: "gameover", type:"image", src: "data/img/gameover.png"},
    {name: "gameoverbg", type:"image", src: "data/img/gameoverbg.png"},
    {name: "hit", type:"image", src: "data/img/hit.png"},
    {name: "getready", type:"image", src: "data/img/getready.png"},
    {name: "new", type:"image", src: "data/img/new.png"},
    {name: "share", type:"image", src: "data/img/share.png"},
    {name: "tweet", type:"image", src: "data/img/tweet.png"},
    {name: "swagfaat", type:"image", src: "data/img/swagfaat.png"},
    {name: "alimesbah", type:"image", src: "data/img/alimesbah.png"},
    // sounds
    {name: "theme", type: "audio", src: "data/bgm/"},
    {name: "hit", type: "audio", src: "data/sfx/"},
    {name: "lose", type: "audio", src: "data/sfx/"},
    {name: "wing", type: "audio", src: "data/sfx/"},
];
var BirdEntity = me.ObjectEntity.extend({
    init: function(x, y) {
        var settings = {};
        var rand = Math.floor((Math.random() * 6) + 1);
        if(rand == 1){
            settings.image = me.loader.getImage('alimesbah');
        }
        else if(rand == 2){
            settings.image = me.loader.getImage('clumsy2');
        }
        else if(rand == 3){
            settings.image = me.loader.getImage('clumsy3');
        }
        else if (rand == 4){
            settings.image = me.loader.getImage('clumsy4');
        }
        else if(rand == 5){
            settings.image = me.loader.getImage('clumsy');
        }
        else if(rand == 6){
            settings.image = me.loader.getImage('clumsy5');
        }
        settings.width = 85;
        settings.height = 60;
        settings.spritewidth = 85;
        settings.spriteheight= 60;

        this.parent(x, y, settings);
        this.alwaysUpdate = true;
        this.gravity = 0.2;
        this.gravityForce = 0.01;
        this.maxAngleRotation = Number.prototype.degToRad(30);
        this.maxAngleRotationDown = Number.prototype.degToRad(90);
        this.renderable.addAnimation("flying", [0, 1, 2]);
        this.renderable.addAnimation("idle", [0]);
        this.renderable.setCurrentAnimation("flying");
        this.renderable.anchorPoint = new me.Vector2d(0.2, 0.5);
        this.animationController = 0;
        // manually add a rectangular collision shape
        this.addShape(new me.Rect(new me.Vector2d(5, 5), 70, 50));

        // a tween object for the flying physic effect
        this.flyTween = new me.Tween(this.pos);
        this.flyTween.easing(me.Tween.Easing.Exponential.InOut);

        this.endTween = new me.Tween(this.pos);
        this.flyTween.easing(me.Tween.Easing.Exponential.InOut);
    },

    update: function(dt) {
        // mechanics
        if (!game.data.start) {
            return this.parent(dt);
        }
        if (me.input.isKeyPressed('pause')) {
            game.data.paused = !game.data.paused;
        }
        if (game.data.paused){
            return this.parent(dt);
        }
        if (me.input.isKeyPressed('fly')) {
            me.audio.play('wing');
            this.gravityForce = 0.02;

            var currentPos = this.pos.y;
            // stop the previous one
            this.flyTween.stop();
            this.flyTween.to({y: currentPos - 72}, 100);
            this.flyTween.start();

            this.renderable.angle = -this.maxAngleRotation;
        } else {
            this.gravityForce += 0.2;
            this.pos.y += me.timer.tick * this.gravityForce;
            this.renderable.angle += Number.prototype.degToRad(3) * me.timer.tick;
            if (this.renderable.angle > this.maxAngleRotationDown)
                this.renderable.angle = this.maxAngleRotationDown;
        }

        var res = me.game.world.collide(this);
        var collided = false;

        if (res) {
            if (res.obj.type === 'pipe' || res.obj.type === 'ground') {
                me.device.vibrate(500);
                collided = true;
            }
            // remove the hit box
            if (res.obj.type === 'hit') {
                me.game.world.removeChildNow(res.obj);
                // the give dt parameter to the update function
                // give the time in ms since last frame
                // use it instead ?
                game.data.steps++;
                me.audio.play('hit');
            }

        }
        // var hitGround = me.game.viewport.height - (96 + 60);
        var hitSky = -80; // bird height + 20px
        if (this.pos.y <= hitSky || collided) {
            game.data.start = false;
            me.audio.play("lose");
            this.endAnimation();
            return false;
        }
        return this.parent(dt);
    },

    endAnimation: function() {
        me.game.viewport.fadeOut("#fff", 100);
        var that = this;
        var currentPos = this.pos.y;
        this.flyTween.stop();
        this.renderable.angle = this.maxAngleRotationDown;
        this.endTween
            .to({y: currentPos - 72}, 1500)
            .to({y: me.video.getHeight() - 96 - that.renderable.width}, 500)
            .onComplete(function() {
                me.state.change(me.state.GAME_OVER);
            });
        this.endTween.start();
        return false;
    }

});


var PipeEntity = me.ObjectEntity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = me.loader.getImage('pipe');
        settings.width = 148;
        settings.height= 1664;
        settings.spritewidth = 148;
        settings.spriteheight= 1664;


        this.parent(x, y, settings);
        this.alwaysUpdate = true;
        this.gravity = 5;
        this.updateTime = false;
        this.type = 'pipe';
        this.tempY;
        this.downDirectionFlag;
        if(this.pos.y < 0){
            this.tempY = this.pos.y + 1840; 
        } else{
            this.tempY = this.pos.y;
        }
        console.log(this.tempY);
        if(this.tempY < 325){
            this.downDirectionFlag = true;
        }
        else{
            this.downDirectionFlag = false;
        }
    },

    update: function(dt) {
        // mechanics
    
        if (!game.data.start) {
            return this.parent(dt);
        }
        if (game.data.paused){
            return this.parent(dt);
        }
        if(this.downDirectionFlag){
             this.pos.add(new me.Vector2d(-this.gravity * me.timer.tick, 0.5)); 
        } else{
            this.pos.add(new me.Vector2d(-this.gravity * me.timer.tick, -0.5)); 
        }
        
        
        if (this.pos.x < -148) {
            me.game.world.removeChild(this);
        }
        return this.parent(dt);
    },

});

var PipeGenerator = me.Renderable.extend({
    init: function() {
        this.parent(new me.Vector2d(), me.game.viewport.width, me.game.viewport.height);
        this.alwaysUpdate = true;
        this.generate = 0;
        this.pipeFrequency = 92;
        this.pipeHoleSize = 1240;
        this.posX = me.game.viewport.width;
        this.posY;
    },

    update: function(dt) {
        if (game.data.paused){
            return this.parent(dt);
        }
        if (this.generate++ % this.pipeFrequency == 0) {
            var posY = Number.prototype.random(
                    me.video.getHeight() - 100,
                    200
            );
            var posY2 = posY - me.video.getHeight() - this.pipeHoleSize;
            this.posY = posY2;
            var pipe1 = new me.pool.pull("pipe", this.posX, posY);
            var pipe2 = new me.pool.pull("pipe", this.posX, posY2);
            if(posY < 325){
                var hitPos = posY - 100;
            } else {
                var hitPos = posY - 150;
            }
            var hit = new me.pool.pull("hit", this.posX, hitPos);
            pipe1.renderable.flipY();
            me.game.world.addChild(pipe1, 10);
            me.game.world.addChild(pipe2, 10);
            me.game.world.addChild(hit, 11);
        }
        return true;
    },

});

var HitEntity = me.ObjectEntity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = me.loader.getImage('hit');
        settings.width = 148;
        settings.height= 60;
        settings.spritewidth = 148;
        settings.spriteheight= 60;

        this.parent(x, y, settings);
        this.alwaysUpdate = true;
        this.gravity = 5;
        this.updateTime = false;
        this.type = 'hit';
        this.renderable.alpha = 0;
        this.ac = new me.Vector2d(-this.gravity, 0);
    },

    update: function() {
        if (game.data.paused){
            return;
        }
        // mechanics
        this.pos.add(this.ac);
        if (this.pos.x < -148) {
            me.game.world.removeChild(this);
        }
        return true;
    },

});

var Ground = me.ObjectEntity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = me.loader.getImage('ground');
        settings.width = 900;
        settings.height= 96;

        this.parent(x, y, settings);
        this.alwaysUpdate = true;
        this.gravity = 0;
        this.updateTime = false;
        this.accel = new me.Vector2d(-4, 0);
        this.type = 'ground';
    },

    update: function(dt) {
        // mechanics
        if (!game.data.start) {
            return this.parent(dt);
        }
        if (game.data.paused){
            return this.parent(dt);
        }
        this.pos.add(this.accel);
        if (this.pos.x < -this.renderable.width) {
            this.pos.x = me.video.getWidth() - 10;
        }
        return this.parent(dt);
    },

});
game.HUD = game.HUD || {};

game.HUD.Container = me.ObjectContainer.extend({
    init: function() {
        // call the constructor
        this.parent();

        // persistent across level change
        this.isPersistent = true;

        // non collidable
        this.collidable = false;

        // make sure our object is always draw first
        this.z = Infinity;

        // give a name
        this.name = "HUD";

        // add our child score object at the top left corner
        this.addChild(new game.HUD.ScoreItem(5, 5));
    }
});


/**
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {

        // call the parent constructor
        // (size does not matter here)
        this.parent(new me.Vector2d(x, y), 10, 10);

        // local copy of the global score
        this.stepsFont = new me.Font('gamefont', 80, '#000', 'center');

        // make sure we use screen coordinates
        this.floating = true;
    },

    update: function() {
        return true;
    },

    draw: function (context) {
        if (game.data.start && me.state.isCurrent(me.state.PLAY))
            this.stepsFont.draw(context, game.data.steps, me.video.getWidth()/2, 10);
    }

});

var BackgroundLayer = me.ImageLayer.extend({
    init: function(image, z, speed) {
        name = image;
        width = 900;
        height = 600;
        ratio = 1;
        // call parent constructor
        this.parent(name, width, height, image, z, ratio);
    },

    update: function() {
        if (me.input.isKeyPressed('mute')) {
            game.data.muted = !game.data.muted;
            if (game.data.muted){
                me.audio.disable();
            }else{
                me.audio.enable();
            }
        }
        return true;
    }
});

var Share = me.GUI_Object.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = "share";
        settings.spritewidth = 150;
        settings.spriteheight = 75;
        this.parent(x, y, settings);
    },

    onClick: function(event) {
        var shareText = 'Just made ' + game.data.steps + ' steps on Derpy Duck! Can you beat me? Try online here!';
        var url = 'http://ahdavies.github.io/Derpy-Duck/';
        FB.ui(
            {
             method: 'feed',
             name: 'My Derpy Duck Score!',
             caption: "Share to your friends",
             description: (
                    shareText
             ),
             link: url,
             picture: 'http://ahdavies.github.io/Derpy-Duck/data/img/clumsy.png'
            }
        );
        return false;
    }

});

var Tweet = me.GUI_Object.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = "tweet";
        settings.spritewidth = 152;
        settings.spriteheight = 75;
        this.parent(x, y, settings);
    },

    onClick: function(event) {
        var shareText = 'Just made ' + game.data.steps + ' steps on Derpy Duck! Can you beat me? Try online here!';
        var url = 'http://ahdavies.github.io/Derpy-Duck/';
        var hashtags = 'DerpyDuck,melonjs'
        window.open('https://twitter.com/intent/tweet?text=' + shareText + '&hashtags=' + hashtags + '&count=' + url + '&url=' + url, 'Tweet!', 'height=300,width=400')
        return false;
    }

});

game.TitleScreen = me.ScreenObject.extend({
    init: function(){
        this.font = null;
        this.logo = null;
    },

    onResetEvent: function() {
        me.audio.stop("theme");
        game.data.newHiScore = false;
        me.game.world.addChild(new BackgroundLayer('bg', 1));

        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.SPACE, "enter", true);
        me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "enter") {
                me.state.change(me.state.PLAY);
            }
        });

        //logo
        var logoImg = me.loader.getImage('logo');
        this.logo = new me.SpriteObject (
            me.game.viewport.width/2 - 170,
            -logoImg,
            logoImg
        );
        me.game.world.addChild(this.logo, 10);

        var logoTween = new me.Tween(this.logo.pos)
            .to({y: me.game.viewport.height/2 - 100}, 1000)
            .easing(me.Tween.Easing.Exponential.InOut).start();

        this.ground1 = new Ground(0, me.video.getHeight() - 96);
        this.ground2 = new Ground(me.video.getWidth(), me.video.getHeight() - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        me.game.world.addChild(new (me.Renderable.extend ({
            // constructor
            init: function() {
                    // size does not matter, it's just to avoid having a zero size
                    // renderable
                    this.parent(new me.Vector2d(), 100, 100);
                    //this.font = new me.Font('Arial Black', 20, 'black', 'left');
                    this.text = me.device.touch ? 'Tap to start' : 'PRESS SPACE OR CLICK LEFT MOUSE BUTTON TO START \nPRESS "M" TO MUTE SOUND AND "P" TO PAUSE GAME';
                    this.font = new me.Font('gamefont', 20, '#000');
            },
            update: function () {
                    return true;
            },
            draw: function (context) {
                    var measure = this.font.measureText(context, this.text);
                    this.font.draw(context, this.text, me.game.viewport.width/2 - measure.width/2, me.game.viewport.height/2 + 50);
            }
        })), 12);
    },

    onDestroyEvent: function() {
        // unregister the event
        me.event.unsubscribe(this.handler);
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.mouse.LEFT);
        this.ground1 = null;
        this.ground2 = null;
        this.logo = null;
    }
});

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

game.GameOverScreen = me.ScreenObject.extend({
    init: function() {
        this.savedData = null;
        this.handler = null;
    },

    onResetEvent: function() {
        //save section
        this.savedData = {
            score: game.data.score,
            steps: game.data.steps
        };
        me.save.add(this.savedData);

        if (!me.save.topSteps) me.save.add({topSteps: game.data.steps});
        if (game.data.steps > me.save.topSteps) {
            me.save.topSteps = game.data.steps;
            game.data.newHiScore = true;
        }
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.SPACE, "enter", false)
        me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN,
            function (action, keyCode, edge) {
                if (action === "enter") {
                        me.state.change(me.state.MENU);
                }
            });

        var gImage = me.loader.getImage('gameover');
        me.game.world.addChild(new me.SpriteObject(
                me.video.getWidth()/2 - gImage.width/2,
                me.video.getHeight()/2 - gImage.height/2 - 100,
                gImage
        ), 12);

        var gImageBoard = me.loader.getImage('gameoverbg');
        me.game.world.addChild(new me.SpriteObject(
            me.video.getWidth()/2 - gImageBoard.width/2,
            me.video.getHeight()/2 - gImageBoard.height/2,
            gImageBoard
        ), 10);

        me.game.world.addChild(new BackgroundLayer('bg', 1));

        // ground
        this.ground1 = new Ground(0, me.video.getHeight() - 96);
        this.ground2 = new Ground(me.video.getWidth(), me.video.getHeight() - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        // share button
        var buttonsHeight = me.video.getHeight() / 2 + 200;
        this.share = new Share(me.video.getWidth()/2 - 180, buttonsHeight);
        me.game.world.addChild(this.share, 12);

        //tweet button
        this.tweet = new Tweet(this.share.pos.x + 170, buttonsHeight);
        me.game.world.addChild(this.tweet, 12);

        // add the dialog witht he game information
        if (game.data.newHiScore) {
            var newRect = new me.SpriteObject(
                    235,
                    355,
                    me.loader.getImage('new')
            );
            me.game.world.addChild(newRect, 12);
        }

        this.dialog = new (me.Renderable.extend({
            // constructor
            init: function() {
                // size does not matter, it's just to avoid having a
                // zero size
                // renderable
                this.parent(new me.Vector2d(), 100, 100);
                this.font = new me.Font('gamefont', 40, 'black', 'left');
                this.steps = 'Steps: ' + game.data.steps.toString();
                this.topSteps= 'Higher Step: ' + me.save.topSteps.toString();
            },

            update: function (dt) {
                return this.parent(dt);
            },

            draw: function (context) {
                var stepsText = this.font.measureText(context, this.steps);
                var topStepsText = this.font.measureText(context, this.topSteps);

                var scoreText = this.font.measureText(context, this.score);
                //steps
                this.font.draw(
                    context,
                    this.steps,
                    me.game.viewport.width/2 - stepsText.width/2 - 60,
                    me.game.viewport.height/2
                );
                //top score
                this.font.draw(
                    context,
                    this.topSteps,
                    me.game.viewport.width/2 - stepsText.width/2 - 60,
                    me.game.viewport.height/2 + 50
                );

            }
        }));
        me.game.world.addChild(this.dialog, 12);
    },

    onDestroyEvent: function() {
        // unregister the event
        me.event.unsubscribe(this.handler);
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.mouse.LEFT);
        me.game.world.removeChild(this.ground1);
        me.game.world.removeChild(this.ground2);
        this.font = null;
        me.audio.stop("theme");
    }
});
