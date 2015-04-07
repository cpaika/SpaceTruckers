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
	starChance: 15, //the higher it is the more stars
	SCREEN_WIDTH: 1000,
	SCREEN_HEIGHT: 1000,
	LEVEL_WIDTH: 10000,
	LEVEL_HEIGHT:1000,
	player: null,
	color: "#FF0000",
	clearColor: "#000000",
	gravity: 0,
	terrain: null,
	stars: null,
	stepSize: 2,
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
		this.stars = this.generateStars(this.terrain);
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
		var numSteps = this.LEVEL_WIDTH/this.stepSize;
		canvas = ig.system.canvas;
		context = canvas.getContext("2d");
		context.fillStyle = this.clearColor;
		//context.fillRect(0,0, this.SCREEN_WIDTH,this.SCREEN_HEIGHT);
		context.fillStyle = this.color;
		var offset = Math.floor(this.screen.x/this.stepSize)
		var step = 0;
		while(step < numSteps)
		{
			
			context.beginPath();
			context.moveTo(step*this.stepSize,this.terrain[step + offset]);
			context.lineTo((step*this.stepSize)+this.stepSize,this.terrain[step+1 + offset]);
      		context.strokeStyle = "#FFFFFF";
			context.stroke(); 
			this.drawStars(step,offset);
			step++;
		}
	},
	/**
	TODO: Remove this hack
	*/
	drawStars: function(step,offset)
	{
		canvas = ig.system.canvas;
		context = canvas.getContext("2d");
		context.fillStyle = "#FFFFFF";//white
		context.fillRect(step*this.stepSize, this.stars[step + offset], 2, 2);
	},
	generateStars: function(terrain)
	{
		var numberOfSteps = this.LEVEL_WIDTH/this.stepSize;
		var stars = new Array(numberOfSteps);
		for(var i = 0; i < numberOfSteps; i++)
		{ 
			var chance =  1+ Math.floor(Math.random()*100);
			if(chance < this.starChance)
			{
				stars[i] = Math.floor(Math.random()* terrain[i]) + 1;
			}
		}
		return stars;
	},
	generateSampleTerrain: function()
	{
		var numberOfSteps = this.LEVEL_WIDTH/this.stepSize;
		var sampleTerrain = new Array(numberOfSteps);
		for(var i = 0; i < numberOfSteps; i++)
		{ 
			var size = .01;
			sampleTerrain[i] = (PerlinNoise.noise(size*i,size*.8,0)*this.LEVEL_HEIGHT) + 200;
		}
		return sampleTerrain;
	},
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', CameraGame, 60, 1000, 1000, 1 );

});