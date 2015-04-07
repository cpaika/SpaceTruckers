ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function()
{
EntityPlayer = ig.Entity.extend({
    firing: false,
    animSheet: new ig.AnimationSheet('media/lander.png', 31, 26),
    size: {x: 31, y: 26},
    gravityFactor: 1,
    
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0], true);
    },
    
    update: function() {
        this.checkKeys(); 
        this.parent();
    },

    draw:function()
    {
        this.parent();
        if(this.firing)
        {
            console.log("Firing thruster");
            this.drawThruster()
        }
    },
    
    checkKeys: function() {
        velocity = 100;
        
        if(ig.input.state('left') && !ig.input.state('right'))
            this.vel.x = -velocity;
        else if(ig.input.state('right') && !ig.input.state('left'))
            this.vel.x = velocity;
        else
            this.vel.x = 0;
        
        if(ig.input.state('up') && !ig.input.state('down'))
        {
            this.accel.y = -30;
            this.fireThruster();
        }
        else if(ig.input.state('down') && !ig.input.state('up')){}
            //this.vel.y = velocity;
        else
        {
            this.accel.y = 60;
            this.firing = false;
        }
    },
    
    getCenter: function() {
        return {x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2};
    },

    fireThruster: function()
    {
        this.firing = true;
    },

    drawThruster: function()
    {
        var endPoint = Math.floor(Math.random()*7) + 14;
        canvas = ig.system.canvas;
        context = canvas.getContext("2d");

        context.beginPath();
        context.moveTo(this.pos.x + this.size.x/3, this.pos.y + this.size.y + 3);
        context.lineTo(this.pos.x + (this.size.x/2) , this.pos.y + this.size.y + endPoint);
        context.strokeStyle = "#FFFFFF";
        context.stroke(); 

        context.beginPath();
        context.moveTo(this.pos.x + this.size.x - this.size.x/3, this.pos.y + this.size.y + 3);
        context.lineTo(this.pos.x + this.size.x - (this.size.x/2) , this.pos.y + this.size.y + endPoint);
        context.strokeStyle = "#FFFFFF";
        context.stroke();
    },

    });
    
});