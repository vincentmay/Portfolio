/**
 * A bird-like object, simulating flock behaviour
 */
class Boid {
  constructor(position, velocity, size) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }

  // Udpating the boids Position
  update(width, height) {
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

  // Drawing the Boid onto the display as an Square
  draw(context) {
    const x = this.position.x - (this.size / 2);
    const y = this.position.y - (this.size / 2);

    context.beginPath();
    context.fillStyle = "rgba(255, 255, 255, .4)";
    context.rect(x, y, this.size, this.size);
    context.fill();
  }
}
