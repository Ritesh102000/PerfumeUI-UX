import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export function fitModelBounds(camera,bounds,target,direction,padding=1.12){
  const back=direction.clone().normalize();
  const right=new THREE.Vector3().crossVectors(camera.up,back).normalize();
  const up=new THREE.Vector3().crossVectors(back,right).normalize();
  const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
  const tanH=tanV*Math.max(.001,camera.aspect);
  const corners=[];let distance=0;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const corner=new THREE.Vector3(x,y,z);corners.push(corner);
    const offset=corner.clone().sub(target),depthOffset=offset.dot(back);
    distance=Math.max(distance,depthOffset+Math.abs(offset.dot(right))*padding/tanH,
      depthOffset+Math.abs(offset.dot(up))*padding/tanV,depthOffset+camera.near+1);
  }
  camera.zoom=1;camera.position.copy(target).addScaledVector(back,distance);
  camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  const ndc=corners.map(corner=>corner.project(camera));
  return {distance,aspect:camera.aspect,maxAbsX:Math.max(...ndc.map(p=>Math.abs(p.x))),maxAbsY:Math.max(...ndc.map(p=>Math.abs(p.y)))};
}

export async function createTour({canvas, manifest, onProgress = () => {}}) {
  const started=performance.now();
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  const nativeQuality=new URLSearchParams(location.search).get('quality')==='native';
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.AgXToneMapping;
  renderer.toneMappingExposure=1.1;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#c9d6dc');
  const camera=new THREE.PerspectiveCamera(61,1.6,.035,80);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const assets=new URL('.',location.href);
  const assetUrl=value=>new URL(value,assets).href;
  const textures=[];const targets=[];
  let disposed=false,currentTime=0,renders=0;
  let modelMode=false,orbit=null,modelCamera=null,modelTarget=null;
  let modelAutoFit=true,modelFitTop=false,modelFit=null,fittingModel=false;
  let originalTouchAction='',modelChange=()=>{};
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  onProgress({fraction:.05,message:'Opening your home…'});
  const [gltf,baked,sky]=await Promise.all([
    loader.loadAsync(assetUrl(manifest.assets.model),p=>onProgress({fraction:.05+.45*(p.total?p.loaded/p.total:0.3),message:'Opening the furnished home…'})),
    Promise.all(manifest.lighting.map(async spec=>{
      const texture=await (spec.encoding?new THREE.TextureLoader():new HDRLoader()).loadAsync(assetUrl(spec.url));
      texture.flipY=false;texture.colorSpace=spec.encoding==='RGBM32'?THREE.NoColorSpace:spec.encoding==='SRGB_SCALE'?THREE.SRGBColorSpace:THREE.LinearSRGBColorSpace;
      texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
      texture.generateMipmaps=true;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      textures.push(texture);
      const [normal,roughness]=await Promise.all(['normal_url','roughness_url'].map(async key=>{
        if(!spec[key])return null;
        const data=await new THREE.TextureLoader().loadAsync(assetUrl(spec[key]));
        data.flipY=false;data.colorSpace=THREE.NoColorSpace;
        data.minFilter=THREE.LinearMipmapLinearFilter;data.magFilter=THREE.LinearFilter;
        data.generateMipmaps=true;data.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
        textures.push(data);return data;
      }));
      return [spec.id,{radiance:texture,normal,roughness}];
    })),
    manifest.assets.sky?new HDRLoader().loadAsync(assetUrl(manifest.assets.sky)):null
  ]);
  if(sky){sky.mapping=THREE.EquirectangularReflectionMapping;scene.background=sky;scene.backgroundIntensity=.8;textures.push(sky);}
  scene.add(gltf.scene);
  const lightmaps=Object.fromEntries(baked);
  const meshes=[];let triangles=0;
  gltf.scene.traverse(object=>{
    if(!object.isMesh)return;
    meshes.push(object);
    triangles+=(object.geometry.index?object.geometry.index.count:object.geometry.attributes.position.count)/3;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const mat of materials){
      const group=mat.userData.baked_group||mat.name.match(/^BAKED_(architecture|furniture|fitted)_/)?.[1];
      if(group){
        mat.color.setRGB(0,0,0);
        const maps=lightmaps[group];
        if(!maps)throw Error('The room lighting is missing: '+group);
        mat.emissive.setRGB(1,1,1);mat.emissiveMap=maps.radiance;mat.emissiveIntensity=1;
        if(maps.normal){mat.normalMap=maps.normal;mat.normalMapType=THREE.TangentSpaceNormalMap;mat.normalScale.set(1,1);}
        if(maps.roughness){mat.roughnessMap=maps.roughness;mat.roughness=1;}
        mat.envMapIntensity=.75;
        const lightingSpec=manifest.lighting.find(v=>v.id===group);
        if(lightingSpec?.encoding==='SRGB_SCALE')mat.emissiveIntensity=lightingSpec.range;
        if(manifest.lighting.find(v=>v.id===group)?.encoding==='RGBM32'){
          mat.onBeforeCompile=shader=>{
            shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#ifdef USE_EMISSIVEMAP
              vec4 bakedRadiance = texture2D(emissiveMap, vEmissiveMapUv);
              totalEmissiveRadiance *= bakedRadiance.rgb * bakedRadiance.a * 32.0;
              #endif`);
          };
          mat.customProgramCacheKey=()=> 'residence-rgbm32-v1';
        }
      }else if(/ClearGlass|clear_low|clear low/i.test(mat.name)){
        mat.transparent=true;mat.opacity=.12;mat.depthWrite=false;mat.side=THREE.DoubleSide;
      }
      mat.needsUpdate=true;
    }
  });
  // The diffuse bake already contains direct light, bounced light and contact
  // shadows. Capturing that furnished scene supplies room-specific reflections
  // without adding a second diffuse illumination pass.
  onProgress({fraction:.65,message:'Preparing light and reflections…'});
  const probes=manifest.reflection_probes||[{id:'living',position:[6,1.45,-5.5]}];
  const probeMaps=[];
  for(let index=0;index<probes.length;index++){
    const p=probes[index];
    const target=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
    const cube=new THREE.CubeCamera(.08,60,target);cube.position.fromArray(p.position);
    cube.update(renderer,scene);
    const filtered=pmrem.fromCubemap(target.texture);
    targets.push(filtered);target.dispose();
    probeMaps.push({id:p.id,position:new THREE.Vector3().fromArray(p.position),texture:filtered.texture});
    onProgress({fraction:.65+.25*(index+1)/probes.length,message:'Preparing the rooms…'});
    await new Promise(resolve=>requestAnimationFrame(resolve));
  }
  const center=new THREE.Vector3();
  for(const mesh of meshes){
    mesh.geometry.computeBoundingBox();mesh.geometry.boundingBox.getCenter(center);mesh.localToWorld(center);
    const probe=probeMaps.find(p=>p.id===mesh.userData.room_id)||probeMaps.reduce((best,p)=>!best||p.position.distanceToSquared(center)<best.position.distanceToSquared(center)?p:best,null);
    // Clone per mesh so an environment assigned in a bathroom cannot overwrite
    // the same material in a different room.
    const assign=original=>{const mat=original.clone();mat.onBeforeCompile=original.onBeforeCompile;mat.customProgramCacheKey=original.customProgramCacheKey;mat.envMap=probe.texture;mat.needsUpdate=true;return mat;};
    mesh.material=Array.isArray(mesh.material)?mesh.material.map(assign):assign(mesh.material);
  }
  const frames=manifest.camera_frames;
  if(!Array.isArray(frames)||frames.length<2)throw Error('The full camera path is unavailable.');
  const pA=new THREE.Vector3(),pB=new THREE.Vector3(),qA=new THREE.Quaternion(),qB=new THREE.Quaternion();
  const modelBounds=new THREE.Box3().setFromObject(gltf.scene);
  const modelSize=modelBounds.getSize(new THREE.Vector3());
  const modelCenter=modelBounds.getCenter(new THREE.Vector3());
  const modelSpan=Math.max(modelSize.x,modelSize.z);
  // The published mesh retains separate roof primitives. Inspect referenced
  // vertices in world space, since accessor bounds may include unused vertices.
  const roofMeshes=meshes.filter(mesh=>{
    const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    if(!mats.every(mat=>(mat.userData.baked_group||mat.name.match(/^BAKED_(architecture)_/)?.[1])==='architecture'))return false;
    const position=mesh.geometry.attributes.position,index=mesh.geometry.index;
    const matrix=mesh.matrixWorld.elements,count=index?index.count:position.count;
    if(!count)return false;
    for(let i=0;i<count;i++){
      const v=index?index.getX(i):i;
      const y=matrix[1]*position.getX(v)+matrix[5]*position.getY(v)+matrix[9]*position.getZ(v)+matrix[13];
      if(y<=2.89)return false;
    }
    return true;
  });
  const roofVisibility=new Map(roofMeshes.map(mesh=>[mesh,mesh.visible]));
  function draw(){if(!disposed){renderer.render(scene,modelMode?modelCamera:camera);renders++;}}
  function fitModel(){
    if(!orbit)return;
    orbit.target.copy(modelCenter);orbit.target.y=.65;
    const direction=modelFitTop?new THREE.Vector3(0,1,.001):new THREE.Vector3(.72,1,.85);
    modelFit=fitModelBounds(modelCamera,modelBounds,orbit.target,direction);
    orbit.maxDistance=Math.max(modelSpan*5,modelFit.distance*4);
    modelCamera.far=Math.max(180,orbit.maxDistance+modelSize.length()*2);
    modelCamera.updateProjectionMatrix();fittingModel=true;
    try{orbit.update();}finally{fittingModel=false;}
  }
  function resetModel(top=false){
    modelAutoFit=true;modelFitTop=top;resize();draw();modelChange();
  }
  function setModelMode(enabled,onChange=()=>{}){
    if(enabled===modelMode)return;
    if(enabled&&!roofMeshes.length)throw Error('The roof-off model is unavailable for this asset.');
    modelMode=enabled;modelChange=onChange;
    if(enabled){
      modelCamera ||= new THREE.PerspectiveCamera(42,1,.08,180);
      originalTouchAction=canvas.style.touchAction;
      orbit=new OrbitControls(modelCamera,canvas);
      orbit.enableDamping=false;orbit.screenSpacePanning=true;
      orbit.minDistance=2;orbit.maxDistance=modelSpan*5;
      orbit.minPolarAngle=.001;orbit.maxPolarAngle=Math.PI*.47;
      orbit.cursor.copy(modelCenter);orbit.maxTargetRadius=modelSpan*.75;
      orbit.listenToKeyEvents(canvas);
      orbit.addEventListener('start',()=>{modelAutoFit=false;});
      orbit.addEventListener('change',()=>{if(!fittingModel)modelAutoFit=false;draw();modelChange();});
      roofMeshes.forEach(mesh=>{mesh.visible=false;});
      scene.background=new THREE.Color('#e3ded4');
      resetModel();
    }else{
      modelTarget=orbit.target.clone();orbit.dispose();orbit=null;
      canvas.style.touchAction=originalTouchAction;
      roofMeshes.forEach(mesh=>{mesh.visible=roofVisibility.get(mesh);});
      scene.background=sky||new THREE.Color('#c9d6dc');
      resize();draw();
    }
  }
  function modelAction(action){
    if(!modelMode||!orbit)return;
    if(action==='reset'||action==='top'){resetModel(action==='top');return;}
    modelAutoFit=false;
    const offset=modelCamera.position.clone().sub(orbit.target);
    if(action==='zoom-in'||action==='zoom-out'){
      const distance=THREE.MathUtils.clamp(offset.length()*(action==='zoom-in'?.8:1.25),orbit.minDistance,orbit.maxDistance);
      offset.setLength(distance);
    }else if(action==='left'||action==='right')offset.applyAxisAngle(new THREE.Vector3(0,1,0),action==='left'?.25:-.25);
    else return;
    modelCamera.position.copy(orbit.target).add(offset);orbit.update();
  }
  function setTime(seconds){
    currentTime=THREE.MathUtils.clamp(seconds,0,manifest.duration_seconds);
    const sample=currentTime*manifest.fps;
    const index=Math.min(frames.length-1,Math.floor(sample));
    const a=frames[index],b=frames[Math.min(index+1,frames.length-1)],f=Math.min(1,sample-index);
    pA.fromArray(a,1);pB.fromArray(b,1);qA.fromArray(a,4);qB.fromArray(b,4);
    camera.position.copy(pA.lerp(pB,f));camera.quaternion.copy(qA.slerp(qB,f));
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
    // Native quality is opt-in for large-screen review. It respects the device
    // density and caps the actual framebuffer at 3840 x 2160 without upscaling phones.
    const deviceRatio=window.devicePixelRatio||1;
    const pixelRatio=nativeQuality?Math.min(deviceRatio,3840/w,2160/h):Math.min(deviceRatio,1.5);
    renderer.setPixelRatio(pixelRatio);renderer.setSize(w,h,false);camera.aspect=w/h;
    if(modelCamera){modelCamera.aspect=w/h;modelCamera.updateProjectionMatrix();}
    // Preserve the full 19mm/36mm camera horizontally; portrait UI provides a
    // landscape frame rather than cropping away the room to fill the phone.
    const hFov=2*Math.atan(manifest.sensor_width_mm/(2*manifest.lens_mm));
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(hFov/2)/camera.aspect));
    camera.updateProjectionMatrix();
    if(modelMode&&orbit&&modelAutoFit)fitModel();
  }
  resize();setTime(0);
  await renderer.compileAsync(scene,camera);
  const loadMilliseconds=Math.round(performance.now()-started);
  const drawingBuffer=new THREE.Vector2();
  onProgress({fraction:1,message:'Your home is ready.'});
  return {
    setTime,resize,setModelMode,modelAction,
    render:draw,
    stats(){renderer.getDrawingBufferSize(drawingBuffer);return {backend:'WebGL2',quality:nativeQuality?'native':'balanced',drawingBufferWidth:drawingBuffer.x,drawingBufferHeight:drawingBuffer.y,detailMaps:baked.reduce((count,[,maps])=>count+Number(Boolean(maps.normal))+Number(Boolean(maps.roughness)),0),sourceMeshes:manifest.source_objects||1375,meshes:meshes.length,triangles,drawCalls:renderer.info.render.calls,visibleTriangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,pixelRatio:renderer.getPixelRatio(),loadMilliseconds,renders,time:currentTime,cameraPosition:camera.position.toArray(),cameraQuaternion:camera.quaternion.toArray(),fullRouteSamples:frames.length,viewMode:modelMode?'model':'walkthrough',modelAutoFit,modelFit,modelAspect:modelCamera?.aspect||null,modelFov:modelCamera?.fov||null,modelCameraPosition:modelCamera?.position.toArray()||null,modelTarget:orbit?.target.toArray()||modelTarget?.toArray()||null,roofPieces:roofMeshes.length,hiddenRoofPieces:roofMeshes.filter(mesh=>!mesh.visible).length,modelBounds:{min:modelBounds.min.toArray(),max:modelBounds.max.toArray()}};},
    dispose(){disposed=true;orbit?.dispose();for(const mesh of meshes){mesh.geometry.dispose();for(const mat of (Array.isArray(mesh.material)?mesh.material:[mesh.material]))mat.dispose();}textures.forEach(t=>t.dispose());targets.forEach(t=>t.dispose());pmrem.dispose();renderer.dispose();}
  };
}
