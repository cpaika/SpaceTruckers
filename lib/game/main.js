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
	init:function(x,y,settings)
	{
		this.parent(x,y,settings);
	}
})
CameraGame = ig.Game.extend({
	seed: 1,
	starChance: 5, //the higher it is the more stars
	SCREEN_WIDTH: 1000,
	SCREEN_HEIGHT: 1000,
	LEVEL_WIDTH: 1000,
	LEVEL_HEIGHT:1000,
	player: null,
	color: "#FF0000",
	clearColor: "#000000",
	gravity: 1000,
	terrain: null,
	font: new ig.Font( 'media/04b03.font.png' ),
	
	init: function() 
	{
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');

		this.spawnEntity(Background, 0, 0);
		this.player = this.spawnEntity(EntityPlayer, 0, 0);
		this.terrain = this.generateSampleTerrain();
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
		this.drawTerrain();
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
	},
	drawTerrain: function()
	{
		canvas = ig.system.canvas;
		context = canvas.getContext("2d");
		context.fillStyle = this.clearColor;
		//context.fillRect(0,0, this.SCREEN_WIDTH,this.SCREEN_HEIGHT);
		context.fillStyle = this.color;
		var step = 0;
		while(step < this.SCREEN_WIDTH)
		{
			context.beginPath();
			context.moveTo(step,this.terrain[step]);
			context.lineTo(step+1,this.terrain[step+1]);
      		context.strokeStyle = "#FFFFFF";
			context.stroke(); 
			step++;

			this.drawStars(step, this.terrain[step]);
		}
		this.resetRandom();
	},
	drawStars: function(step,height)
	{

		var chance =  1+ Math.floor(this.random()*100);//generates a random number between 1 and 100
		if(chance < this.starChance)
		{
			canvas = ig.system.canvas;
			context = canvas.getContext("2d");
			context.fillStyle = "#FFFFFF";//white
			var yLocation = Math.floor(this.random()*height) + 1;
			context.fillRect(step, yLocation, 2, 2);
		}
	},
	random: function() 
	{
    	var x = Math.sin(this.seed++) * 10000;
    	return x - Math.floor(x);
	},
	resetRandom: function()
	{
		this.seed = 1;
	},
	generateSampleTerrain: function()
	{
		var sampleTerrain = new Array(this.LEVEL_WIDTH);
		for(var i = 0; i <this.LEVEL_WIDTH; i++)
		{
			sampleTerrain[i] = 3*this.LEVEL_HEIGHT/4 - Math.sin(i/100)*(this.LEVEL_HEIGHT/5);
		}
		return sampleTerrain;
	},
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', CameraGame, 60, 1000, 1000, 1 );

});