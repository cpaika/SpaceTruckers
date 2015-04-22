ig.module(
    'game.entities.enemy'
)
.requires(
    'impact.entity',
    'game.entities.laser'
)
.defines(function()
{
EntityEnemy = ig.Entity.extend
({
    firing: false,
    //animSheet: new ig.AnimationSheet('media/enemy2.png', 31, 26),
    animSheet: new ig.AnimationSheet('media/enemy2.png', 14, 18),
    size: {x: 14, y: 18},
    gravityFactor: 1,
    thrust: 100,
    grav: 20,
    collided: false,
    shotTimer: 60,
    shotTimeDiff: 20,
    
    init: function(x, y, settings) 
    {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0], true);
        this.maxVel.x = 3000;
        this.maxVel.y = 300;
        this.rotateToTarget();
    },
    
    update: function() {
        this.thinkAndMove();
        this.parent();
        this.shotTimer--;
    },

    draw:function()
    {
        this.accel.y = 0;
        this.accel.x = 0;
        this.parent();
        if(this.firing)
        {
            //console.log("Firing thruster");
            this.drawThruster();
            this.fireThruster();
        }
        if(!this.collided)
        {
            //TODO uncomment this
            //this.accel.y += this.grav;
        }
        else
        {
            this.vel.x = 0;
            this.vel.y = 0;
        }
    },

    getCenter: function() {
        return {x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2};
    },

    drawThruster: function()
    {
        var xOff = ig.game.screen.x;
        var endPoint = Math.floor(Math.random()*7) + 14;
        canvas = ig.system.canvas;
        context = canvas.getContext("2d");

        var leftStart = this.rotate(this.pos.x + this.size.x/3, this.pos.y + this.size.y + 3);
        var leftEnd = this.rotate(this.pos.x + (this.size.x/2) , this.pos.y + this.size.y + endPoint);
        var rightStart = this.rotate(this.pos.x + this.size.x - this.size.x/3, this.pos.y + this.size.y + 3);
        var rightEnd = this.rotate(this.pos.x + this.size.x - (this.size.x/2), this.pos.y + this.size.y + endPoint);

        context.beginPath();
        context.moveTo(leftStart.x - xOff, leftStart.y);
        context.lineTo(leftEnd.x - xOff,leftEnd.y);
        context.strokeStyle = "#FFFFFF";
        context.stroke(); 

        context.beginPath();
        context.moveTo(rightStart.x - xOff, rightStart.y);
        context.lineTo(rightEnd.x - xOff, rightEnd.y);
        context.strokeStyle = "#FFFFFF";
        context.stroke();
    },
    fireThruster: function()
    {
        this.fuel--;
        if(this.fuel < 0)
        {
            this.fuel = 0;
            this.firing = false;
        }
        this.accel.y = this.thrust*Math.sin(this.currentAnim.angle - Math.PI/2);
        this.accel.x = this.thrust*Math.cos(this.currentAnim.angle- Math.PI/2);
    },
    getFuel: function()
    {
        return this.fuel;
    },
    rotate: function(pointX, pointY)
    {
        //var newX = x + (x-this.getCenter().x)*Math.cos(this.currentAnim.angle) - (y-this.getCenter().y)*Math.sin(this.currentAnim.angle);
        //var newY = y + (x-this.getCenter().x)*Math.sin(this.currentAnim.angle) - (y-this.getCenter().y)*Math.cos(this.currentAnim.angle);
        var angle = this.currentAnim.angle - Math.PI*2;
        var newX = Math.cos(angle) * (pointX - this.getCenter().x) - Math.sin(angle) * (pointY-this.getCenter().y) + this.getCenter().x;
        var newY = Math.sin(angle) * (pointX - this.getCenter().x) + Math.cos(angle) * (pointY - this.getCenter().y) + this.getCenter().y;
        //newX += this.getCenter().x;
        //newY += this.getCenter().y;
        return {x: newX, y: newY};
    },
    
    fireMissle: function()
    {
        var spawn = this.rotate(this.getCenter().x, this.pos.y);
        var laser = ig.game.spawnEntity(EntityLaser, spawn.x, spawn.y);
        laser.setVel((2000*Math.sin(this.currentAnim.angle - Math.PI/2)), (2000*Math.cos(this.currentAnim.angle - Math.PI/2)));
        laser.currentAnim.angle = this.currentAnim.angle;
    },

    thinkAndMove: function()
    {
        this.rotateToTarget();
        this.firing = true;
    },
    
    //rotates the enemy to face the player
    rotateToTarget: function()
    {
        var diffX = this.pos.x - ig.game.player.getCenter().x;
        var diffY = this.pos.y - ig.game.player.getCenter().y;

        var angle = Math.atan(diffX/diffY)

        var totalAngle = Math.atan2(diffX, diffY)

        
        this.currentAnim.angle = 2*Math.PI - totalAngle ;
    },

    rotateRight: function()
    {
        this.currentAnim.angle -= Math.PI/1.4 * ig.system.tick;
    },
    rotateLeft: function()
    {
        this.currentAnim.angle += Math.PI/1.4 * ig.system.tick;
    }
    });

});