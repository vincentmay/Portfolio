import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
// GLTFExporter uses the browser FileReader API for its final binary buffer.
globalThis.FileReader=class { async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.();} };
const vite=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'error'});
try {
  const {createPendant}=await vite.ssrLoadModule('/src/brand/pendant-model.ts');
  const material=new THREE.MeshStandardMaterial({color:0xe9e6e4,metalness:1,roughness:.26});
  const model=createPendant(material);
  model.name='Stellar - cast frame and orbital band';
  const bytes=await new GLTFExporter().parseAsync(model,{binary:true});
  await mkdir('public/models',{recursive:true});
  await writeFile('public/models/stellar.glb',new Uint8Array(bytes));
  console.log('Exported stellar.glb:',bytes.byteLength,'bytes');
  model.traverse(o=>{if(o.isMesh)o.geometry.dispose();});material.dispose();
}finally{await vite.close();}
