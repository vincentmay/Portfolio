export class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Add another vector to the current vector
  add = function(vector) {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  // Subtract another vector from the current vector
  subtract = function(vector) {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  // Scale the vector by a scalar value
  scale = function(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  // Calculate the dot product with another vector
  dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  // Calculate the cross product with another vector
  cross = function(vector) {
    return this.x * vector.y - this.y * vector.x;
  }

  // Calculate the distance between two vectors
  distance = function(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate the magnitude (length) of the vector
  magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Calculate the direction (unit vector) of the vector
  direction = function() {
    const magnitude = this.magnitude();
    if (magnitude !== 0) {
      return new Vector2D(this.x / magnitude, this.y / magnitude);
    }
    return new Vector2D(0, 0);
  }

  // Rotationg an Vector
  rotate = function(angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const rotatedX = this.x * cosAngle - this.y * sinAngle;
    const rotatedY = this.x * sinAngle + this.y * cosAngle;
    this.x = rotatedX;
    this.y = rotatedY;
    return this;
  }

  angle = function() {
    return Math.atan2(this.y, this.x);
  }

  normalize = function() {
    const magnitude = this.magnitude();
    if (magnitude !== 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  }
  
}
