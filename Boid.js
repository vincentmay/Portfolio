export class Boid {
  constructor(position, velocity, size) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }

  update = function() {    
    // Update the position based on the velocity
    this.position.add(this.velocity);

    this.moveTowards();
  }

  moveTowards = function() {
    this.position.x += this.velocity.direction().x;
    this.position.y += this.velocity.direction().y;
  }

  draw = function(context) {
    // Save the current transformation state
    context.save();

    // Translate the canvas to the boid's position
    context.translate(this.position.x, this.position.y);

    // Rotate the canvas to match the boid's direction
    const angle = Math.atan2(this.velocity.y, this.velocity.x);
    context.rotate(angle);

    // Draw the boid as a triangle
    context.beginPath();
    context.moveTo(0, -this.size / 2);
    context.lineTo(this.size, this.size);
    context.lineTo(-this.size, this.size);
    context.closePath();

    // Set the fill color
    context.fillStyle = 'rgba(255, 255, 255, .5)';
    context.fill();

    // Restore the transformation state
    context.restore();
  }
}
