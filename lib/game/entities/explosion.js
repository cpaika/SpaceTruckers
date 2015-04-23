ig.module( 
    'game.entities.explosion' 
)
.requires(
    'impact.entity'
)
.defines(function(){

EntityExplosion = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/explosion.png', 36, 36),
    size: {x:40, y:40},
    gravityFactor: 0,

    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.addAnim('idle',.05,[0,1,2,3,4,5,6,7,8,9,10,11,12,13],true);
    },

    update: function(){
        if(this.currentAnim.loopCount === 1)
        {
            this.kill();
        }     
        this.parent();
    },

    reset: function(x, y, settings){
        this.currentAnim.rewind();
        this.parent(x, y, settings);
    },

    kill: function()
    {
        this.parent();
    }
});

});