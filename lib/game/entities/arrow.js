ig.module( 
    'game.entities.arrow' 
)
.requires(
    'impact.entity'
)
.defines(function(){

EntityArrow = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/arrow.png', 65, 41),
    size: {x:129, y:82},
    gravityFactor: 0,

    init: function(x, y, settings)
    {
        this.parent(x, y, settings);
        this.addAnim('idle', 1,[0],true);
    },
});

});