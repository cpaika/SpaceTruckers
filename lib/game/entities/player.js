ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity',
    'game.entities.laser',
    'impact.sound',
    'game.entities.explosion'
)
.defines(function()
{
EntityPlayer = ig.Entity.extend({
    fuel: 3000,
    firing: false,
    animSheet: new ig.AnimationSheet('media/lander.png', 31, 26),
    size: {x: 31, y: 26},
    gravityFactor: 1,
    thrust: 100,
    //thrustForce: 1000,
    thrustForce: 1000,
    grav: 20,
    collided: false,
    shotTimer: 30,
    shotTimeDiff: 20,
    mass: 10,
    baseMass: 10,
    deliveryState: false,
    //thrusterSound: new ig.Sound('media/win.*'),

    
    init: function(x, y, settings) 
    {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0], true);
        this.maxVel.x = 3000;
        this.maxVel.y = 300;
        this.collides = ig.Entity.COLLIDES.FIXED;
    },
    
    update: function() {
        this.checkKeys(); 
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
        if((!this.collided) && (!ig.game.beforeStart))
        {
            this.accel.y += this.grav;
        }
        else if(this.collided)
        {
            this.vel.x = 0;
            this.vel.y = 0;
        }
    },
    
    checkKeys: function() 
    {
        velocity = 100;
        if(!this.collided)
        {
            if( ig.input.state('left'))
            {
                this.currentAnim.angle -= Math.PI/1.4 * ig.system.tick;
                if(ig.game.beforeStart == true)
                {
                    ig.game.beforeStart = false;
                }
            }
            else if( ig.input.state('right'))
            {
                this.currentAnim.angle += Math.PI/1.4 * ig.system.tick;
                if(ig.game.beforeStart == true)
                {
                    ig.game.beforeStart = false;
                }
            }   
        }

        if(ig.input.state('up') && !ig.input.state('down'))
        {
            if(this.fuel > 0)
            {
                this.unCollide();
                this.firing = true;
            }
            if(ig.game.beforeStart == true)
            {
                ig.game.beforeStart = false;
            }
        }
        else
        {
            this.firing = false;
        }
        if(ig.input.state('space'))
        {
            if(this.shotTimer < 0)
            {
                this.fireMissle();
                this.shotTimer = this.shotTimeDiff;
            }
            if(ig.game.beforeStart == true)
            {
                ig.game.beforeStart = false;
            }
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
            if(this.collided)
            {
                ig.game.gameOver = true;
            }
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
    getBoundingBox: function(x,y)
    {
        //start from the bottom left, go counterclockwise in labelling points
        //{x: , y: };
        var tightness = 6;
        var center = this.getCenter();
        var bottomY = this.pos.y+this.size.y;
        var box = new Array(7);

        box[0] = this.rotate(this.pos.x, bottomY);
        box[1] = this.rotate(center.x, bottomY);
        box[2] = this.rotate(this.pos.x + this.size.x, bottomY);

        box[3] = this.rotate(this.pos.x + this.size.x - tightness, this.getCenter().y);
        box[4] = this.rotate(this.pos.x + this.size.x - tightness, this.pos.y);
        box[5] = this.rotate(this.pos.x + tightness, this.pos.y);
        box[6] = this.rotate(this.pos.x + tightness, this.getCenter().y);
        return box;
    },
    collide: function()
    {
        this.collided = true;
    },

    unCollide: function()
    {      
        this.collided = false;
    },
    
    fireMissle: function()
    {
        var totalVel = 2000;
        var spawn = this.rotate(this.getCenter().x, this.pos.y - 10);
        var laser = ig.game.spawnEntity(EntityLaser, spawn.x, spawn.y);
        var velX = totalVel*Math.cos(this.currentAnim.angle - .5*Math.PI)
        var velY = totalVel*Math.sin(this.currentAnim.angle - .5*Math.PI)
        laser.setVel(velX, velY);
        laser.currentAnim.angle = this.currentAnim.angle;
    },
    /**
        Adds cargo to the player, incrementing its mass
    */
    addCargo: function(moreMass)
    {
        if(this.deliveryState == false)
        {
            this.mass += moreMass;
            this.thrust = this.thrustForce/this.mass;
            this.deliveryState = true;
            return true;
        }
        else
        {
            return false;
        }
    },

    removeCargo: function()
    {
        this.mass = this.baseMass;
        this.thrust = this.thrustForce/this.mass;
        this.deliveryState = false;
    },

    kill: function()
    {
        ig.game.spawnEntity(EntityExplosion, this.pos.x, this.pos.y);
        this.parent();
    },

    collideWith: function(other, axis)
    {
        if(other instanceof EntityEnemy)
        {
            ig.game.endGame();
        }
    }
    });
    
});