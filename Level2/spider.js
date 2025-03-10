const canvas = document.getElementById('canvas2')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const collisionCanvas = document.getElementById('collisionCanvas')
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth
collisionCanvas.height = window.innerHeight

let score = 10
let gameOver = false
let advanceNextLevel = false 

let timeToNextSpider = 0
let spiderInterval = 800
let lastTime = 0

let spiders = []
class Spider {
    constructor(){
        this.spriteWidth = 654;
        this.spriteHeight = 534;
        this.sizeModifier = Math.random() * 0.3 + 0.2;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = -this.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 1;
        this.directionY = Math.random() * 5 - 20;
        this.markedForDeletion = false
        this.image = new Image();
        this.image.src = 'images/spiderLTR.png';
        this.frame = 0
        this.maxFrame = 4
        this.timeSinceMove = 0;
        this.moveInterval = Math.random() * 100 + 100
        this.randomColors = [Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255)]
        this.color = `rgb(${this.randomColors[0]},${this.randomColors[1]}, ${this.randomColors[2]}`
        

    }
    update(deltaTime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1; 
        }
        this.x += this.directionX;
        this.y += this.directionY
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceMove += deltaTime
        if(this.timeSinceMove > this.moveInterval){
            if(this.frame > this.maxFrame) this.frame = 0
            else this.frame++
            this.timeSinceMove = 0
        }
        if(this.x > canvas.width -2) gameOver = true
        
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'images/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y; 
        this.frame = 0; 
        this.sound = new Audio();
        this.sound.src = 'sounds/boom.wav'
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false


    }

    update(deltaTime){
        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if( this.timeSinceLastFrame > this.frameInterval){
            this.frame++
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true
        }
    }

    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size)
    }
}

function drawScore(){
    ctx.font = '2rem Impact';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 20, 115)
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 22, 117)
}

function drawLevel(){
    ctx.font = '2rem Impact';
    ctx.fillStyle = 'black';
    ctx.fillText('Level: 2', 20, 65)
    ctx.fillStyle = 'white';
    ctx.fillText('Level: 2', 22, 67)
}


function drawGameOver(){
    ctx.font = '5rem Nosifer';
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black';
    ctx.fillText(`GAME OVER!`, canvas.width/2, canvas.height/2)
    ctx.fillStyle = 'orange';
    ctx.fillText(`GAME OVER!`, canvas.width/2 +2, canvas.height/2+2)

}

function drawFinalScore(){
    const audio = new Audio('sounds/gameOver.mp3')
    audio.play()
    ctx.font = '3rem Impact';
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 60)
    ctx.fillStyle = 'white';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2 + 2, canvas.height/2 + 62)

}

function drawRestart(){
    
}

function drawNextLevel(){
    ctx.font = '5rem Nosifer';
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black';
    ctx.fillText(`Level 2 Passed`, canvas.width/2, canvas.height/2 + 70)
    ctx.fillStyle = 'orange';
    ctx.fillText(`Level 2 Passed`, canvas.width/2 + 2, canvas.height/2 + 72)
    alert('Level Passed!  Click to start next level')
    location.href = '../Level3/bat.html' 
}

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    console.log(detectPixelColor)
    const pc = detectPixelColor.data;
    spiders.forEach(obj => {
        if(obj.randomColors[0] === pc[0] && obj.randomColors[1] === pc[1] && obj.randomColors[2] === pc[2]){
            obj.markedForDeletion = true
            score++
            explosions.push(new Explosion(obj.x, obj.y, obj.width))
            if(score >= 20) advanceNextLevel = true 
        }
        
       
    })
})

const spider = new Spider();

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width, canvas.height)
    collisionCtx.clearRect(0,0,canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime
    lastTime = timestamp
    timeToNextSpider += deltaTime
    if(timeToNextSpider > spiderInterval){
        spiders.push(new Spider())
        timeToNextSpider = 0
        spiders.sort((a, b) => a.width - b.width)
       
    }
    drawScore(), drawLevel();
    [...spiders, ...explosions].forEach(obj => obj.update(deltaTime));
    [...spiders, ...explosions].forEach(obj => obj.draw());
    spiders = spiders.filter(obj => !obj.markedForDeletion)
    explosions = explosions.filter(obj => !obj.markedForDeletion)
    
    if(advanceNextLevel) drawNextLevel()
    else if(!gameOver)requestAnimationFrame(animate)
    else drawGameOver(), drawFinalScore()

}

animate(0)
