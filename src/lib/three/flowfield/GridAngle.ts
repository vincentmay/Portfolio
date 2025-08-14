import * as THREE from "three";

export class GridAngle {
  position: THREE.Vector3;

  constructor(public x: number, public y: number, public r: number, public angle: number) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.angle = angle;

    this.position = new THREE.Vector3(x + r * Math.cos(angle), y + r * Math.sin(angle), 0);
  }
}