ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.entities.player',
	'game.entities.enemy'
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
	missionChance: 2,
	enemyChance: 2, //out of 1000
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
	platformPoints:  null,
	platformMass: null,
	radius: 10,
	stepSize: 2,
	collidingPoints: new Array(2),
	font: new ig.Font( 'media/font.png' ),
	
	init: function() 
	{
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.SPACE, 'space');

		this.spawnEntity(Background, 0, 0);
		this.player = this.spawnEntity(EntityPlayer, 0, 0);
		this.terrain = this.generateSampleTerrain();
		this.stars = this.generateStars(this.terrain);
		this.platformPoints = this.generatePlatforms();
		this.collidingPoints[0] = -1;
		this.collidingPoints[1] = -1;
		this.sendScore(this.guid(), 100);
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		this.updateCamera();
		this.checkPlayerCollision();
		var chance =  1+ Math.floor(Math.random()*100);
		if(chance < this.enemyChance)
		{
			var whichSide = Math.floor(Math.random()*2)*this.SCREEN_WIDTH;
			var spawnHeight = 20;
			this.spawnEntity(EntityEnemy, whichSide, spawnHeight);
		}
		// Add your own, additional update code here
	},
	
	draw: function() 
	{
		this.parent();
		this.drawTerrain();
		this.drawPlatformValues();
		//this.drawBoundingBox();
		this.drawHUD();
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
	Draws the point values above the platforms
	*/
	drawPlatformValues: function()
	{
		for(var j = 0; j < this.platformPoints.length; j++)//loops through the platform points 
		{
			if(this.platformPoints[j] > 0)
			{	
				var height = this.terrain[Math.floor(this.platformPoints[j]/this.stepSize)] - 50;
				this.font.draw(this.massToPoints(this.platformMass[j]), this.platformPoints[j] - this.screen.x, height, ig.Font.ALIGN.CENTER );
			}
		}
	},
	/**
	Has to be called after drawTerrain()
	*/
	generatePlatforms: function()
	{
		var numberOfSteps = this.LEVEL_WIDTH/this.stepSize;
		var numPlatforms = 0;
		var platforms = [];
		this.platformMass = [];
		for(var i = 0; i < numberOfSteps; i++)
		{ 
			var chance =  1+ Math.floor(Math.random()*100);
			if(chance < this.missionChance)
			{
				numPlatforms++;
				platforms.push(i*this.stepSize);
				this.platformMass.push(1+ Math.floor(Math.random()*20));
				var height = this.terrain[i];
				var end = i + this.radius;
				i -= this.radius;
				while( i < end)
				{
					this.terrain[i] = height;
					i++;
				}
			}
		}
		return platforms;
	},

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
	drawHUD: function()
	{
		this.font.draw( 'Fuel: ' + this.player.fuel, this.SCREEN_WIDTH - 50 , 40, ig.Font.ALIGN.RIGHT );
	},

	checkPlayerCollision: function()
	{
		//will not work when screen starts to move?
		var step = Math.round(this.player.pos.x/this.stepSize);
		if((this.player.pos.y + this.player.size.y + 100) > this.terrain[step])
		{
			var box = this.player.getBoundingBox();
			for(var i = 0; i < box.length - 1;i++)
			{
				//line below definetly has to be checked when the screen moves
				var collisionResult = this.checkLineIntersect(box[i].x, box[i].y, box[i+1].x, box[i+1].y, this.player.pos.x, this.terrain[step], this.player.pos.x + this.player.size.x, this.terrain[Math.round((this.player.pos.x + this.player.size.x)/this.stepSize)]);
				if( collisionResult== 1)
				{
					this.player.collide();
					this.collidingPoints[0] = i;
					this.collidingPoints[1] = i+1;
					this.handleLanding(this.player.getCenter().x);
				}
				else
				{
					//this.collidingPoints[0] = -1;
					//this.collidingPoints[1] = -1;
				}
			}
		}
	},

	//used from https://gist.github.com/Joncom/e8e8d18ebe7fe55c3894
	// Adapted from: http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
	checkLineIntersect: function(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) 
	{
	    var s1_x, s1_y, s2_x, s2_y;
	    s1_x = p1_x - p0_x;
	    s1_y = p1_y - p0_y;
	    s2_x = p3_x - p2_x;
	    s2_y = p3_y - p2_y;
	 
	    var s, t;
	    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
	 
	    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
	    {
	        // Collision detected
	        return 1;
	    }
	 
	    return 0; // No collision
	},
	drawBoundingBox: function()
	{
		canvas = ig.system.canvas;
		context = canvas.getContext("2d");
		var box = this.player.getBoundingBox();
		for(var i = 0; i < box.length; i++)
		{
			context.fillStyle = "#00FF00";//green
			if((i == this.collidingPoints[0]) || (i == this.collidingPoints[1]))
			{
				console.log("SPECIAL POINTS");
				context.fillStyle = "FF0000"//red
			}
			context.fillRect(box[i].x - this.screen.x, box[i].y, 3, 3);
		}
	},
	
	sendScore: function(userName, theScore)
	{
		var myFirebaseRef = new Firebase("https://space-truckers.firebaseio.com/Users/" + userName);
		myFirebaseRef.set(
		{
  			score: theScore
		});
	},

	guid: function() {
  		function s4() 
  		{
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    	s4() + '-' + s4() + s4() + s4();
	},

	massToPoints: function(mass)
	{
		return mass *5;
	},
	/**
	Handles the ladning logic, incrementing players mass, awarding points, etc.
	*/
	handleLanding: function(playPos)
	{
		for(var i = 0; i < this.platformPoints.length; i++)
		{
			var test = this.platformPoints[i];
			if((test - this.radius) <= playPos)
			{
				if(playPos <= (test + this.radius))//if player landed on a platform
				{
					console.log("MADE IT");
					this.player.addCargo(this.platformMass[i]);
					this.platformMass[i] = -1;
					this.platformPoints[i] = -1;
					console.log(this.platformMass);
				}
			}
		}
	}

});
	
// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', CameraGame, 60, 1000, 1000, 1 );

});