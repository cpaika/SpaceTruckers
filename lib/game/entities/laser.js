ig.module(
    'game.entities.laser'
)
.requires(
    'impact.entity'
)
.defines(function()
{
EntityLaser = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/laser.png', 3, 5),
    size: {x: 3, y: 5},
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0], true);
    },
    setVel: function(x,y)
    {
        this.vel.x = x;
        this.vel.y = y;
    },
    update: function() 
    {
        this.parent();
    },

    draw:function()
    {
        this.parent();
    },
    
    });

});