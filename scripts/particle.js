class Particle {
    constructor(position, velocity, acceleration) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.maxSpeed = 0.3;
        this.color = 0;
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.multiplyScalar(0);
    }

    follow(vectors, scl, cols) {
        let x = Math.floor(this.position.x / scl);
        let y = Math.floor(this.position.y / scl);
        let index = x + y * cols;
      
        if (index >= 0 && index < vectors.length) {
          let force = vectors[index];
          this.applyForce(force);
        }
      }

    applyForce(force) {
        this.acceleration.add(force);
    }

    show(context) {
        context.beginPath();
        context.fillStyle = `rgba(128, 0, 128, 0.02)`;
        this.color += 0.1;
        context.rect(this.position.x, this.position.y, 2, 2);
        context.fill();
    }

    wrap(width, height) {
        if (this.position.x > width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }
}