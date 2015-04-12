ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function()
{
EntityPlayer = ig.Entity.extend({
    fuel: 0,
    firing: false,
    animSheet: new ig.AnimationSheet('media/lander.png', 31, 26),
    size: {x: 31, y: 26},
    gravityFactor: 1,
    thrust: 80,
    grav: 40,
    collided: false,
    
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0], true);
        fuel: 1000;
    },
    
    update: function() {
        this.checkKeys(); 
        this.parent();
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
            this.accel.y += this.grav;
        }
        else
        {
            this.vel.x = 0;
            this.vel.y = 0;
        }
    },
    
    checkKeys: function() {
        velocity = 100;
        if(!this.collided)
        {
            if( ig.input.state('left'))
            {
            this.currentAnim.angle -= Math.PI/1.4 * ig.system.tick;
            }
            else if( ig.input.state('right'))
            {
                this.currentAnim.angle += Math.PI/1.4 * ig.system.tick;
            }   
        }

        if(ig.input.state('up') && !ig.input.state('down'))
        {
            this.unCollide();
            this.firing = true;
        }
        else
        {
            this.firing = false;
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

        var leftStart = this.rotate(this.pos.x + this.size.x/3 - xOff, this.pos.y + this.size.y + 3);
        var leftEnd = this.rotate(this.pos.x + (this.size.x/2) - xOff , this.pos.y + this.size.y + endPoint);
        var rightStart = this.rotate(this.pos.x + this.size.x - this.size.x/3 - xOff, this.pos.y + this.size.y + 3);
        var rightEnd = this.rotate(this.pos.x + this.size.x - (this.size.x/2) - xOff, this.pos.y + this.size.y + endPoint);

        context.beginPath();
        context.moveTo(leftStart.x, leftStart.y);
        context.lineTo(leftEnd.x,leftEnd.y);
        context.strokeStyle = "#FFFFFF";
        context.stroke(); 

        context.beginPath();
        context.moveTo(rightStart.x, rightStart.y);
        context.lineTo(rightEnd.x, rightEnd.y);
        context.strokeStyle = "#FFFFFF";
        context.stroke();
    },
    fireThruster: function()
    {
        this.fuel--;
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
    });
    
});