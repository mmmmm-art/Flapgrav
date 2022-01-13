// @ts-ignore
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 800;

/**
 * @param {number} pt
 */
 function parabollicEasing(pt) {
	let x = pt * 4 - 2;
	let y = x * x * -1 + 4;
	return y / 4;
}

const BackMusic = new Audio("/sounds/BackMusic.mp3");
BackMusic.play();
BackMusic.loop = true;

class KeyboardState {
	constructor() {
		this.isAccelerating = false;
		this.isAcceleratingBack = false;
        this.jump = false;
        this.rate = 10;
        this.damage = true
        this.speed = 1000;
		this.registerEventHandlers();
	}

	registerEventHandlers() {
		window.addEventListener("keydown", (e) => {
			switch (e.key) {
				case "a":
				case "ArrowLeft":
					this.isAcceleratingBack = true;
					break;
				case "d":
				case "ArrowRight":
					this.isAccelerating = true;
					break;
                case "ArrowUp":
                    this.jump = true;
                    break;
                case " ":
                    this.rate = 1;
                    break
                case "q":
                    this.damage = false;
                    break
                case "w":
                    this.speed = 100;
                    break
			}
		});

		window.addEventListener("keyup", (e) => {
			switch (e.key) {
				case "a":
				case "ArrowLeft":
					this.isAcceleratingBack = false;
					break;
				case "d":
				case "ArrowRight":
					this.isAccelerating = false;
					break;
                case "ArrowUp":
                    this.jump = false;
                    break;
                case " ":
                    this.rate = 10;
                    break
                case "q":
                    this.damage = true;
                    break
                case "w":
                    this.speed = 1000;
                    break
			}
		});
	}
}

class Tracer {
	/**
	 * @param {Player} p
	 */
	constructor(p) {
		this.p = p;
        this.color = 0;

		this.x = p.x;
		this.y = p.y;

		this.isVisible = true;
		this.opacity = 1;

		this.fadeRate = 0.1;
		this.fadeInterval = 100;
		this.timeSinceFade = 0;
	}

	/**
	 * @param {number} timeElapsed
	 */
	update(timeElapsed) {
		this.timeSinceFade += timeElapsed;
        this.color += 6;

		if (this.timeSinceFade >= this.fadeInterval) {
			this.opacity -= this.fadeRate;
			this.timeSinceFade = 0;
		}

		this.isVisible = this.opacity > 0;
	}

	render() {
		ctx.save();

		ctx.fillStyle = `hsla(${this.color}, 100%, 50%, ${this.opacity})`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.p.radius / 2, 0, Math.PI * 2, true);
		ctx.fill();

		ctx.restore();
	}
}

class Player {
	/**
     * @param {KeyboardState} [key]
     * @param {Array<enemy>} [enemies]
     * @param {Array<ball>} [balls]
     */
	constructor(key, enemies, balls) {
        this.key = key;
        this.ball = balls;
        this.enemies = enemies;
		this.maxBounceHeight = canvas.height / 5;
		this.yOfLastBounce = 0;
		this.x = 400;
		this.y = 400;
		this.bounceTime = 700;
		this.timeSinceLastBounce = 0;
		this.radius = 10;
        this.color = 1;
        this.speed = 5;
        this.gameOver = false;
        this.fillColor = 0;
        this.strokeColor = 200;
        this.health = 750
        this.healthX = 25;


	}

	/**
	 * @param {number} elapsedTime
	 */
	update(elapsedTime) {
		this.timeSinceLastBounce += elapsedTime;
		const isMovingDown = this.timeSinceLastBounce > this.bounceTime / 2;
        this.color += 6;
        let ef = parabollicEasing(this.timeSinceLastBounce / this.bounceTime);
		this.y = this.yOfLastBounce - ef * this.maxBounceHeight;
        if (this.key.jump && isMovingDown && this.y)
        {
            this.timeSinceLastBounce = 0;
			this.yOfLastBounce = this.y;
        }
        if ( this.key.isAccelerating)
        {
            this.x += this.speed;
        }
        if ( this.key.isAcceleratingBack)
        {
            this.x -= this.speed;
        }
        if (this.gameOver)
        {
            // @ts-ignore
            trace.opacity = 0;
        }
        this.health += 0.04
        this.healthX -= 0.02

        enemies.forEach((e) => {
            let insideX = this.x - this.radius > e.x && this.x - this.radius < e.x + e.width
            let insideY = this.y > e.y && this.y < e.y + e.height

            if (insideX && insideY && kb.damage)
            {
                this.health -= 20
                this.healthX += 10;
            }

            if (e.x > this.x - this.radius)
            {
                e.leftRight = false
            }
            else if (e.x < this.x - this.radius)
            {
                e.leftRight = true
            }
            if (e.y > this.y)
            {
                e.downUp = false
            }
            else if (e.y < this.y)
            {
                e.downUp = true
            }
            if (!e.leftRight)
            {
                e.x -= e.speed
            }
            else if (e.leftRight)
            {
                e.x += e.speed
            }
            if (!e.downUp)
            {
                e.y -= e.speed
            }
            else if (e.downUp)
            {
                e.y += e.speed
            }
        });

        balls.forEach((b) => {
            let insideX = this.x - this.radius > b.x && this.x - this.radius < b.x + b.radius
            let insideY = this.y > b.y && this.y < b.y + b.radius

            if (insideX && insideY && kb.damage)
            {
                this.health -= 20
                this.healthX += 10;
            }
        });
        if (this.health <= 0)
        {
            this.gameOver = true
        }
        if (this.x > canvas.width)
        {
            this.gameOver = true
        }
        if (this.x < 0)
        {
            this.gameOver = true
        }
        if (this.y > canvas.height)
        {
            this.gameOver = true
        }
        if (this.y < -160)
        {
            this.gameOver = true;
        }
        
	}

	render() {
        ctx.save();
        ctx.fillStyle = 'hsla(0, 100%, 50%, 1)';
        ctx.fillRect(25, 10, 750, 20);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'hsla(100, 100%, 50%, 1)';
        ctx.fillRect(this.healthX, 10, this.health, 20);
        ctx.restore();

		ctx.save();
        ctx.fillStyle = `hsla(${this.color}, 100%, 50%, 1)`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		ctx.fill();
		ctx.restore();

	}
}

class enemy {
    constructor() {
        this.enemyImage = new Image();
        this.enemyImage.src = "/images/enemy.png";
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 700 + 50;
        this.width = 25;
        this.height = 25;
        this.color = Math.random() * 360;
        this.leftRight = true;
        this.downUp = true;
        this.speed = Math.random() * 3 + 1;
    }

    update() {

    }

    render() {
        ctx.save();
        ctx.fillStyle = `hsla(${this.color}, 100%, 50%, 1)`
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

class ball {
    constructor() {
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 700 + 50;
        this.radius = 10;
        this.speedX = Math.random() * 5;
        this.speedY = Math.random() * 5;
        this.isMovingDown = false;
        this.isMovingRight = false;
    }

    update() {
        if(this.y <= 0)
        {
            this.isMovingDown = true
        }
        if (this.y >= canvas.height)
        {
            this.isMovingDown = false
        }
        if (this.isMovingDown)
        {
            this.y += this.speedY;
        }
        if(!this.isMovingDown)
        {
            this.y -= this.speedY;
        }
        if(this.x <= 0)
        {
            this.isMovingRight = true
        }
        if (this.x >= canvas.width)
        {
            this.isMovingRight = false
        }
        if (this.isMovingRight)
        {
            this.x += this.speedX;
        }
        if(!this.isMovingRight)
        {
            this.x -= this.speedX;
        }

    }

    render() {
        ctx.save();
        ctx.fillStyle = `hsla(0, 100%, 50%, 1)`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		ctx.fill();
		ctx.restore();
    }
}

class Man {
    /**
     * @param {Array<enemy>} [enemies]
     */
    constructor(enemies){    
       this.enemies = enemies;
       this.backImage = new Image();
       this.backImage.src = "/images/back.png";
       this.score = 0;
       this.scoreX = 0;
       this.scoreY = 790;
       this.lastScore = 0;
       this.lastScoreB = 0;
       this.fillColor = 0;
       this.strokeColor = 0;
    }

    update() {
    }

    render() {
        ctx.save();
        ctx.drawImage(this.backImage, 0, 0);
        ctx.restore();
        ctx.save();
		ctx.fillStyle = `hsla(${this.fillColor}, 100%, 50%, 1)`;
		ctx.strokeStyle = `hsla(${this.strokeColor}, 100%, 50%, 1)`;
		ctx.font = "90px karma";
		ctx.fillText(`Score:${this.score}`, this.scoreX, this.scoreY);
		ctx.strokeText(`Score:${this.score}`, this.scoreX, this.scoreY);
		ctx.restore();

    }
}



let kb = new KeyboardState();
let player = new Player(kb);
let enemies = [new enemy()];
let balls = [new ball()];
let tracers = [new Tracer(player)];
let man = new Man();
let currentTime = 0;

/**
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
	let timeElapsed = timestamp - currentTime;
	currentTime = timestamp;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    tracers.push(new Tracer(player));
    let gameObjects = [man, player, ...enemies, ...balls, ...tracers];
    gameObjects.forEach((o) => {
        o.update(timeElapsed);
        o.render();
    });
    man.score = Math.round(currentTime / kb.speed);
    tracers = tracers.filter((t) => t.isVisible);
    console.log(player.y);

    if (man.score >= man.lastScore + 20)
    {
        man.lastScore = man.score;
        let e = new enemy();
        enemies.push(e);
    }
    if (man.score >= man.lastScoreB + 10)
    {
        let b = new ball();
        man.lastScoreB = man.score;
        balls.push(b);
    }

	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);




