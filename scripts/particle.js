class Particle {
  constructor(position, velocity, acceleration) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = 5;
    this.color = { r: 0, g: 0, b: 0 }

    this.maxLength = 100;
    this.positions = [];
    this.positions.push(this.position.clone());

    /* this.prevPos = this.position.clone(); */
  }

  update(width, height, deltaTime) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.multiplyScalar(0);

    this.color = this.calculateColor(width, height);

    this.wrap(width, height);

    this.positions.push(this.position.clone());
    if (this.positions.length > this.maxLength) {
      this.positions.shift();
    }
  }

  calculateColor(width, height) {
    const normalizedX = this.position.x / width;
    const normalizedY = this.position.y / height;

    const r = Math.floor(normalizedX * 30) + 25; // Darker red towards the right
    const g = Math.floor((1 - normalizedY) * 150) + 100; // Brighter green towards the top
    const b = 255;

    return { r, g, b };
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
    context.globalAlpha = 0.5;
    context.lineWidth = 25;

    context.beginPath();

    for (let i = 1; i < this.positions.length; i++) {
      const prevPosition = this.positions[i - 1];
      const currentPosition = this.positions[i];
      const distance = prevPosition.distanceTo(currentPosition);

      if (distance < context.lineWidth * 2) {
        context.lineTo(currentPosition.x, currentPosition.y);
      } else {
        context.beginPath();
        context.moveTo(currentPosition.x, currentPosition.y);
      }
    }

    context.stroke();

    /* context.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    context.globalAlpha = 0.1;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(this.prevPos.x, this.prevPos.y);
    context.lineTo(this.position.x, this.position.y);
    context.stroke(); */
    /* context.fillRect(this.position.x, this.position.y, 1, 1); */

    /* this.prevPos = this.position.clone(); */
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
