ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.entities.player'
)
.defines(function(){


Background = ig.Entity.extend
({
	animSheet: new ig.AnimationSheet('media/grass.png', 1000, 1000),
	init:function(x,y,settings)
	{
		this.parent(x,y,settings);
		this.addAnim('default',1,[0],true);
	}
})
CameraGame = ig.Game.extend({
	SCREEN_WIDTH: 600,
	SCREEN_HEIGHT: 400,
	LEVEL_WIDTH: 1000,
	LEVEL_HEIGHT:1000,
	player: null,
	font: new ig.Font( 'media/04b03.font.png' ),
	
	init: function() 
	{
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');

		this.spawnEntity(Background, 0, 0);
		this.player = this.spawnEntity(EntityPlayer, 0, 0);
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		this.updateCamera();
		// Add your own, additional update code here
	},
	
	draw: function() 
	{
		this.parent();
	},
	updateCamera: function()
	{
		var center = this.player.getCenter();
		this.screen.x = center.x - this.SCREEN_WIDTH/2;
		this.screen.y = center.y - this.SCREEN_HEIGHT/2;
		if(this.screen.x < 0)
		{
			this.screen.x = 0;
		}
		if(this.screen.y < 0)
		{
			this.screen.y = 0;
		}
		if(this.screen.x + this.SCREEN_WIDTH > this.LEVEL_WIDTH)
		{
			this.screen.x = this.LEVEL_WIDTH - this.SCREEN_WIDTH
		}
		if(this.screen.y + this.SCREEN_HEIGHT > this.LEVEL_HEIGHT)
		{
			this.screen.y = this.LEVEL_HEIGHT - this.SCREEN_HEIGHT
		}
	}
	
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', CameraGame, 60, 600, 400, 2 );

});