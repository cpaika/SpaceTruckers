ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.entities.player',
	'game.entities.enemy',
	'impact.entity-pool',
	'game.entities.explosion',
	'game.entities.arrow'
)
.defines(function(){


Background = ig.Entity.extend
({
	init:function(x,y,settings)
	{
		this.parent(x,y,settings);
	}
});

CameraGame = ig.Game.extend({
	seed: 1,
	starChance: 15, //the higher it is the more stars
	missionChance: 2,
	enemyChance: 2, //out of 1000
	SCREEN_WIDTH: 1400,
	SCREEN_HEIGHT: 800,
	LEVEL_WIDTH: 20000,
	LEVEL_HEIGHT:800,
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
	enemyArray: null,
	deliveryState: false,
	arrow: null,
	destPlatform: null,	
	gameOver: false,
	gameTimer: null,
	beforeStart: true,

	init: function() 
	{
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.SPACE, 'space');

		this.spawnEntity(Background, 0, 0);
		this.player = this.spawnEntity(EntityPlayer, 50, 50);
		this.player.vel.x = 100;
		this.player.currentAnim.angle = -Math.PI/2;
		this.terrain = this.generateSampleTerrain();
		this.stars = this.generateStars(this.terrain);
		this.platformPoints = this.generatePlatforms();
		this.collidingPoints[0] = -1;
		this.collidingPoints[1] = -1;
		this.enemyArray = new Array();
		ig.EntityPool.enableFor(EntityExplosion);
		this.gameOver = false;
		this.gameTimer = new ig.Timer();
		this.gameTimer.tick();
		//ig.EntityPool.enableFor(EntityEnemy);

	},
	
	update: function() 
	{
		// Update all entities and backgroundMaps
		this.parent();
		this.updateCamera();
		this.checkPlayerCollision();
		this.checkEnemyCollisions();
		var chance =  1+ Math.floor(Math.random()*100);
		if((chance < this.enemyChance) && !this.beforeStart)//spawns the enemies
		{
			var spawnOffset = this.SCREEN_WIDTH;
			if(Math.random() < .5)
			{
				spawnOffset = spawnOffset*-1;
			}
			var spawnHeight = 20;
			this.enemyArray.push(this.spawnEntity(EntityEnemy, spawnOffset + this.player.getCenter().x, spawnHeight));
		}
		/**
		if(this.player.pos.x > (this.LEVEL_WIDTH*(9/10)))
		{
			this.LEVEL_WIDTH = this.LEVEL_WIDTH*2;
			//this.terrain = this.generateSampleTerrain();
			//this.stars = this.generateStars(this.terrain);
			//this.platformPoints = this.generatePlatforms();
			this.terrain = this.terrain.concat(this.generateSampleTerrain());
			this.stars = this.stars.concat(this.generateStars())
			//this.platformPoints = this.plat
		}
		*/
		// Add your own, additional update code here
	},
	
	draw: function() 
	{
		this.parent();
		this.drawTerrain();
		this.drawHUD();
		if(!this.deliveryState)
		{
			this.drawPlatformValues();
		}
		else
		{
			this.updateArrow();
		}
		if(this.gameOver)//when the player has exploded
		{
			this.beforeStart = false;
			if(this.player.fuel < 0)
			{
				this.font.draw("OUT OF FUEL", this.SCREEN_WIDTH/2, 80, ig.FONT.ALIGN.CENTER);
			}
			this.font.draw("GAME OVER!", this.SCREEN_WIDTH/2, 100, ig.Font.ALIGN.CENTER );
			this.font.draw("RELOAD PAGE TO RESTART", this.SCREEN_WIDTH/2, 120, ig.Font.ALIGN.CENTER );
          
		}
		if(this.beforeStart)//before the player presses a key
		{
			this.font.draw("WELCOME TO SPACE TRUCKERS", this.SCREEN_WIDTH/2, 100, ig.Font.ALIGN.CENTER );
			this.font.draw("USE LEFT AND RIGHT ARROW KEYS TO ROTATE", this.SCREEN_WIDTH/2, 120, ig.Font.ALIGN.CENTER );
			this.font.draw("FIRE THRUSTER WITH UP ARROW", this.SCREEN_WIDTH/2, 140, ig.Font.ALIGN.CENTER );
			this.font.draw("LAND ON PLATFORMS TO PICKUP AND DELIVER CARGO", this.SCREEN_WIDTH/2, 160, ig.Font.ALIGN.CENTER );
			this.font.draw("WACH YOUR FUEL LEVELS!", this.SCREEN_WIDTH/2, 190, ig.Font.ALIGN.CENTER );
		}

		//Uncomment line below if you want to enter debug mode and see the collision boxes around player and enemies:
		//this.drawBoundingBoxes();
	},
	updateCamera: function()//moves the camera on the x axis
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
	drawTerrain: function()//draws the white terrain lines and highlights the delivery platform
	{
		var numSteps = this.LEVEL_WIDTH/this.stepSize;
		canvas = ig.system.canvas;
		context = canvas.getContext("2d");
		context.fillStyle = this.clearColor;
		//context.fillRect(0,0, this.SCREEN_WIDTH,this.SCREEN_HEIGHT);
		context.fillStyle = this.color;
		var offset = Math.floor(this.screen.x/this.stepSize)
		var step = 0;
		var bottom = this.platformPoints[this.destPlatform] - this.radius - 5;
      	var top = this.platformPoints[this.destPlatform] + this.radius + 5;
      	context.lineWidth = 1;
		while(step < numSteps)
		{
			
			context.beginPath();
			context.moveTo(step*this.stepSize,this.terrain[step + offset]);
			context.lineTo((step*this.stepSize)+this.stepSize,this.terrain[step+1 + offset]);
      		context.strokeStyle = "#FFFFFF";
      		if(this.deliveryState && (((step+offset)*this.stepSize) > bottom) && (((step+offset)*this.stepSize) < top))//if this is the delivery platform
      		{
      			context.lineWidth = 12;
      			context.strokeStyle = "#7CFC00";
      		}
			context.stroke(); 
			context.lineWidth = 1;
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

	drawStars: function(step,offset)//draws the stars
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
	generateSampleTerrain: function()//generates perline noise terrain
	{
		var seed = Math.random()*100;
		var numberOfSteps = this.LEVEL_WIDTH/this.stepSize;
		var sampleTerrain = new Array(numberOfSteps);
		for(var i = 0; i < numberOfSteps; i++)
		{ 
			var size = .01;
			sampleTerrain[i] = (PerlinNoise.noise(size*i,size*.8,seed)*this.LEVEL_HEIGHT) + 200;
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
					if(this.player.vel.x > 40 || this.player.vel.y < -40)
					{
						this.endGame();
					}
				}
				else
				{
					//this.collidingPoints[0] = -1;
					//this.collidingPoints[1] = -1;
				}
			}
		}
	},
	endGame: function()
	{
		this.player.kill();
		this.gameOver = true;
		this.sendScore(this.guid(),this.gameTimer.tick());
	},
	checkEnemyCollisions: function()
	{
		for(e = 0; e < this.enemyArray.length; e++)
		{
			var step = Math.round(this.enemyArray[e].pos.x/this.stepSize);
			if((this.enemyArray[e].pos.y + this.enemyArray[e].size.y + 100) > this.terrain[step])
			{
				var box = this.enemyArray[e].getBoundingBox();
				for(var i = 0; i < box.length - 1;i++)
				{
					//line below definetly has to be checked when the screen moves
					var collisionResult = this.checkLineIntersect(box[i].x, box[i].y, box[i+1].x, box[i+1].y, this.enemyArray[e].pos.x, this.terrain[step], this.enemyArray[e].pos.x + this.enemyArray[e].size.x, this.terrain[Math.round((this.enemyArray[e].pos.x + this.enemyArray[e].size.x)/this.stepSize)]);
					if(this.enemyArray[e].pos.y > this.terrain[step])
					{
						collisionResult++;
					}
					if( collisionResult >= 1)
					{
						this.enemyArray[e].collide();
						this.collidingPoints[0] = i;
						this.collidingPoints[1] = i+1;
					}
					else
					{
						//this.collidingPoints[0] = -1;
						//this.collidingPoints[1] = -1;
					}
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
	drawBoundingBoxes: function()
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
		for(e = 0; e < this.enemyArray.length; e++)
		{
			box = this.enemyArray[e].getBoundingBox();
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
			if((test - this.radius - 5) <= playPos)
			{
				if(playPos <= (test + this.radius + 5))//if player landed on a platform
				{
					if(this.player.addCargo(this.platformMass[i]))//if player is picking up cargo (aka he already isnt making a delivery)
					{
						this.deliveryState = true;
						var dest = this.calculateDestination(i);
						this.destPlatform = dest;
						this.arrow = this.spawnEntity(EntityArrow, -100, 250);
						this.updateArrow();
						//remove the point value of pickup and destination

						this.platformMass[i] = -1;
						this.platformPoints[i] = -1;
					}
					else if(i == this.destPlatform)//if the player landed on the delivery platform
					{
						this.player.fuel += this.platformMass[i];
						this.platformMass[i] = -1;
						this.platformPoints[i] = -1;
						this.player.removeCargo();
						this.arrow.kill();
						this.arrow = null;
						this.deliveryState = false;
						this.destPlatform = -1;
					}
				}
			}
		}
	},

	//Randomly generates the destination when a player picks up a delivery.  Platform is max 10 platforms away, and minimum one away
	calculateDestination: function(platformNum)
	{
		platform = 1 + Math.floor(Math.random()*10);
		if((platformNum >= 11) && (Math.random() > .5))
		{
			platform = -1*platform;
		}
		console.log(platform);
		console.log(platformNum + platform);
		return platformNum + platform;
	},

	updateArrow: function()
	{
		if(this.player.getCenter().x < this.platformPoints[this.destPlatform])
		{
			this.arrow.pos.x = this.player.pos.x + 450;
			this.arrow.currentAnim.flip.x = false;
		}
		else if(this.player.getCenter().x > this.platformPoints[this.destPlatform])
		{
			this.arrow.pos.x = this.player.pos.x - 450;
			this.arrow.currentAnim.flip.x = true;
		}
	}

});
// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', CameraGame, 60, 1400, 800, 1 );

});