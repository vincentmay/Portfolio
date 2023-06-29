export class Boid {
  constructor(position, velocity, size) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }

  update = function(width, height) {
    let nextPos = this.position.add(this.velocity);

    if (nextPos.x < 0) {
      nextPos.x = width;
    } else if (nextPos.x > width) {
      nextPos.x = 0;
    }
    if (nextPos.y < 0) {  
      nextPos.y = height;
    } else if (nextPos.y > height) {
      nextPos.y = 0;
    }
    
    this.position = nextPos;
  }

  draw(context) {
    const x = this.position.x - (this.size / 2);
    const y = this.position.y - (this.size / 2);

    context.beginPath();
    context.fillStyle = "rgba(255, 255, 255, .1)";
    context.rect(x, y, this.size, this.size);
    context.fill();
  }
}
