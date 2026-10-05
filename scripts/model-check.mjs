import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createServer } from 'vite';
const vite=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'error'});
try {
  const {createPendantBody,createPendantOrbit}=await vite.ssrLoadModule('/src/brand/pendant-model.ts');
  for(const [name,geometry] of [['body',createPendantBody()],['orbit',createPendantOrbit()]]) {
    const p=geometry.attributes.position, index=geometry.index.array, edges=new Map();
    for(const value of p.array) assert.ok(Number.isFinite(value),name+': finite coordinates');
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    for(let i=0;i<index.length;i+=3){
      a.fromBufferAttribute(p,index[i]);b.fromBufferAttribute(p,index[i+1]);c.fromBufferAttribute(p,index[i+2]);
      assert.ok(b.sub(a).cross(c.sub(a)).lengthSq()>1e-14,name+': nondegenerate triangles');
      for(const [u,v] of [[index[i],index[i+1]],[index[i+1],index[i+2]],[index[i+2],index[i]]]){
        const key=u<v?u+':'+v:v+':'+u;edges.set(key,(edges.get(key)||0)+1);
      }
    }
    for(const count of edges.values())assert.equal(count,2,name+': closed manifold');
    assert.equal(p.count-edges.size+index.length/3,0,name+': one continuous opening');
    const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();
    if(name==='body'){
      const hit=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,3),new THREE.Vector3(0,0,-1)).intersectObject(mesh).length;
      assert.equal(hit(0,0),0,'open center');assert.equal(hit(0,1.3),0,'open north arm');assert.ok(hit(0,1.9)>0,'solid north tip');assert.ok(hit(1.9,0)>0,'solid east tip');
      const front=new THREE.Raycaster(new THREE.Vector3(0,1.9,3),new THREE.Vector3(0,0,-1)).intersectObject(mesh)[0];
      assert.ok(front.point.z>0,'outward-facing front surface');
    }
    console.log('PASS',name,p.count+' vertices',index.length/3+' triangles, closed surface');geometry.dispose();mesh.material.dispose();
  }
}finally{await vite.close();}
