class Particle {
  constructor(position, velocity, acceleration, linePositions, index, positionsMaxLength) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = 1;

    this.maxLength = positionsMaxLength;
    this.positions = [];

    this.linePositions = linePositions;
    this.index = index;
  }

  update(width, height, deltaTime) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.multiplyScalar(0);

    this.wrap(width, height);

    this.positions.push(this.position.clone());
    if (this.positions.length > this.maxLength) {
      this.positions.shift();
    }
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

  wrap(width, height) {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  updateLinePositions() {
    const startIndex = this.index * (this.maxLength * 3);

    for (let i = 0; i < this.positions.length; i++) {
      const currentPos = this.positions[i];
      const posIndex = startIndex + i * 3;

      this.linePositions[posIndex + 0] = currentPos.x;
      this.linePositions[posIndex + 1] = currentPos.y;
      this.linePositions[posIndex + 2] = 0;
    }

    if (this.positions.length !== this.maxLength) {
      for (let i = this.positions.length; i < this.maxLength; i++) {
        const posIndex = startIndex + i * 3;

        this.linePositions[posIndex + 0] = this.position.x;
        this.linePositions[posIndex + 1] = this.position.y;
        this.linePositions[posIndex + 2] = 0;
      }
    }
  }
}
