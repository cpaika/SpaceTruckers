ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function()
{
EntityPlayer = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/player.png', 50, 50),
    size: {x: 50, y: 50},
    gravityFactor: 1,
    
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0], true);
    },
    
    update: function() {
        this.checkKeys(); 
        this.parent();
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
            this.vel.y = -100;
        else if(ig.input.state('down') && !ig.input.state('up'))
            this.vel.y = velocity;
    },
    
    getCenter: function() {
        return {x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2};
    }
    });
    
});