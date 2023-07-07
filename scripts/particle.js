class Particle {
  constructor(position, velocity, acceleration) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = 2;
    this.color = { r: 0, g: Math.random() * (255 - 100) + 100, b: Math.random() * (255 - 175) + 175 }

/*     this.maxLength = 100;
    this.positions = [];
    this.positions.push(this.position.clone()); */

    this.prevPos = this.position.clone();
  }

  update(deltaTime) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.multiplyScalar(0);

/*     this.positions.push(this.position.clone());
    if (this.positions.length > this.maxLength) {
      this.positions.shift();
    } */
  }

  follow(vectors, scl, cols) {
    const x = Math.floor(this.position.x / scl);
    const y = Math.floor(this.position.y / scl);
    const index = x + y * cols;

    if (index >= 0 && index < vectors.length) {
      this.applyForce(vectors[index]);
    }
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  show(context) {
    context.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    context.globalAlpha = 1;
    context.lineWidth = 2;

/*     context.beginPath();

    for (let i = 1; i < this.positions.length; i++) {
      const prevPosition = this.positions[i - 1];
      const currentPosition = this.positions[i];
      const distance = prevPosition.distanceTo(currentPosition);

      if (distance < context.lineWidth * 2) {
        context.lineTo(currentPosition.x, currentPosition.y);
      } else {
        context.stroke();
        context.beginPath();
        context.moveTo(currentPosition.x, currentPosition.y);
      }
    }


    context.stroke(); */


    context.beginPath();
    context.moveTo(this.prevPos.x, this.prevPos.y);
    context.lineTo(this.position.x, this.position.y);
    context.stroke();

    this.prevPos = this.position.clone();
  }

  wrap(width, height) {
    if (this.position.x > width) {
      this.position.x = 0;
      this.prevPos = this.position.clone();
    } else if (this.position.x < 0) {
      this.position.x = width;
      this.prevPos = this.position.clone();
    }
    if (this.position.y > height) {
      this.position.y = 0;
      this.prevPos = this.position.clone();
    } else if (this.position.y < 0) {
      this.position.y = height;
      this.prevPos = this.position.clone();
    }
  }
}
