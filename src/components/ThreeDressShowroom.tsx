import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCw, Sparkles, ChevronDown, ChevronUp, Eye, Scissors, X } from 'lucide-react';

interface ThreeDressShowroomProps {
  initialColor?: string;
  garmentName?: string;
  onClose?: () => void;
}

// Pre-allocated math helpers to ensure zero GC in animation loop
const _targetRotation = new THREE.Vector2(0, 0);
const _currentRotation = new THREE.Vector2(0, 0);

export const ThreeDressShowroom: React.FC<ThreeDressShowroomProps> = ({
  initialColor = '#4A0E17',
  garmentName = 'Royal Zardozi Couture Gown',
  onClose
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedFabric, setSelectedFabric] = useState<'velvet' | 'silk' | 'brocade'>('velvet');
  const [selectedFit, setSelectedFit] = useState<'S' | 'M' | 'L'>('M');
  const [autoRotate, setAutoRotate] = useState(true);

  // References to dynamic 3D materials and meshes
  const dressMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const dressSkirtMeshRef = useRef<THREE.Mesh | null>(null);
  const mannequinTorsoRef = useRef<THREE.Mesh | null>(null);
  const dressGroupRef = useRef<THREE.Group | null>(null);

  const colors = [
    { name: 'Royal Burgundy', hex: '#4A0E17' },
    { name: 'Champagne Gold', hex: '#D4AF37' },
    { name: 'Emerald Velvet', hex: '#0B4734' },
    { name: 'Sapphire Silk', hex: '#0F2D59' },
    { name: 'Rose Blush', hex: '#C26379' },
    { name: 'Midnight Noir', hex: '#1C1618' },
  ];

  // Helper to generate a procedural gold brocade canvas texture
  const createProceduralBrocadeTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4A0E17';
      ctx.fillRect(0, 0, 512, 512);

      // Procedural golden zari floral filigree pattern
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 512; i += 64) {
        for (let j = 0; j < 512; j += 64) {
          ctx.beginPath();
          ctx.arc(i + 32, j + 32, 16, 0, Math.PI * 2);
          ctx.stroke();

          // Petals
          ctx.beginPath();
          ctx.moveTo(i + 32, j + 16);
          ctx.lineTo(i + 32, j + 48);
          ctx.moveTo(i + 16, j + 32);
          ctx.lineTo(i + 48, j + 32);
          ctx.stroke();

          // Gold foil flecks
          ctx.fillStyle = '#F3E5AB';
          ctx.fillRect(i + 30, j + 30, 4, 4);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to adapt rendering pipeline safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7F2EA');
    scene.fog = new THREE.Fog('#F7F2EA', 7, 14);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.8, 4.4);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection via PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight('#FFF7EB', 2.4);
    keyLight.position.set(2.5, 4.5, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool Hemisphere Fill Light
    const hemiLight = new THREE.HemisphereLight('#FFF5E6', '#380B12', 1.1);
    scene.add(hemiLight);

    // Warm Rim/Back Light
    const rimLight = new THREE.DirectionalLight('#E6C364', 1.6);
    rimLight.position.set(-2.8, 3.0, -2.5);
    scene.add(rimLight);

    // 5. Materials
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: '#D4AF37',
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.3
    });

    const darkVelvetBodiceMat = new THREE.MeshStandardMaterial({
      color: '#2A1C1E',
      roughness: 0.85,
      metalness: 0.1
    });

    const dressFabricMat = new THREE.MeshPhysicalMaterial({
      color: selectedColor,
      roughness: 0.75,
      metalness: 0.12,
      clearcoat: 0.2
    });
    dressMaterialRef.current = dressFabricMat;

    // 6. Assemble Composite 3-12 Part Mannequin & Gown (THREE.Group)
    const ensembleGroup = new THREE.Group();
    ensembleGroup.position.set(0, 0, 0);

    // Part 1: Pedestal Base (Beveled Champagne Gold stand)
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.06, 32);
    const baseMesh = new THREE.Mesh(baseGeo, goldMaterial);
    baseMesh.position.y = 0.03;
    baseMesh.receiveShadow = !isSoftwareGl;
    ensembleGroup.add(baseMesh);

    // Part 2: Pedestal Step Ring
    const baseStepGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.04, 32);
    const baseStepMesh = new THREE.Mesh(baseStepGeo, goldMaterial);
    baseStepMesh.position.y = 0.08;
    ensembleGroup.add(baseStepMesh);

    // Part 3: Center Mounting Rod
    const rodGeo = new THREE.CylinderGeometry(0.022, 0.022, 2.0, 16);
    const rodMesh = new THREE.Mesh(rodGeo, goldMaterial);
    rodMesh.position.y = 1.05;
    rodMesh.castShadow = !isSoftwareGl;
    ensembleGroup.add(rodMesh);

    // Part 4: Tailored Mannequin Torso
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.58, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, darkVelvetBodiceMat);
    torsoMesh.position.y = 1.48;
    torsoMesh.castShadow = !isSoftwareGl;
    ensembleGroup.add(torsoMesh);
    mannequinTorsoRef.current = torsoMesh;

    // Part 5: Mannequin Neck & Top Finial (Champagne Gold)
    const finialGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const finialMesh = new THREE.Mesh(finialGeo, goldMaterial);
    finialMesh.position.y = 1.84;
    ensembleGroup.add(finialMesh);

    // Part 6: Royal Flared Skirt (Tailored bell silhouette with flared pleats)
    // Lathe geometry creates elegant couture flared contours
    const skirtPoints: THREE.Vector2[] = [];
    const skirtSteps = 16;
    for (let i = 0; i <= skirtSteps; i++) {
      const t = i / skirtSteps;
      const y = 1.25 - t * 0.95; // from waist (y=1.25) down to floor (y=0.3)
      // Natural flared bell curve
      const radius = 0.16 + Math.pow(t, 1.8) * 0.58;
      skirtPoints.push(new THREE.Vector2(radius, y));
    }
    const skirtGeo = new THREE.LatheGeometry(skirtPoints, 32);
    const skirtMesh = new THREE.Mesh(skirtGeo, dressFabricMat);
    skirtMesh.castShadow = !isSoftwareGl;
    skirtMesh.receiveShadow = !isSoftwareGl;
    ensembleGroup.add(skirtMesh);
    dressSkirtMeshRef.current = skirtMesh;

    // Part 7: Embroidered Zari Waistband Sash (Champagne Gold Brocade)
    const waistSashGeo = new THREE.CylinderGeometry(0.175, 0.185, 0.08, 32);
    const waistSashMesh = new THREE.Mesh(waistSashGeo, goldMaterial);
    waistSashMesh.position.y = 1.24;
    ensembleGroup.add(waistSashMesh);

    // Part 8: Royal Choker Collar with Teardrop Gemstone
    const chokerGeo = new THREE.TorusGeometry(0.08, 0.015, 12, 32);
    chokerGeo.rotateX(Math.PI / 2);
    const chokerMesh = new THREE.Mesh(chokerGeo, goldMaterial);
    chokerMesh.position.y = 1.76;
    ensembleGroup.add(chokerMesh);

    const gemGeo = new THREE.ConeGeometry(0.025, 0.05, 8);
    gemGeo.rotateX(Math.PI);
    const gemMesh = new THREE.Mesh(gemGeo, goldMaterial);
    gemMesh.position.set(0, 1.73, 0.085);
    ensembleGroup.add(gemMesh);

    // Part 9: Hemline Golden Lace Border
    const hemGeo = new THREE.TorusGeometry(0.74, 0.012, 12, 36);
    hemGeo.rotateX(Math.PI / 2);
    const hemMesh = new THREE.Mesh(hemGeo, goldMaterial);
    hemMesh.position.y = 0.30;
    ensembleGroup.add(hemMesh);

    // Part 10: Grounded Radial Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
      grad.addColorStop(0, 'rgba(56, 11, 18, 0.45)');
      grad.addColorStop(0.5, 'rgba(56, 11, 18, 0.18)');
      grad.addColorStop(1, 'rgba(56, 11, 18, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlaneGeo = new THREE.PlaneGeometry(1.6, 1.6);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    scene.add(ensembleGroup);
    dressGroupRef.current = ensembleGroup;

    // Pointer Drag & Orbit Interaction with Damping
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;

      _targetRotation.y += deltaX * 0.009;
      _targetRotation.x = Math.max(-0.25, Math.min(0.35, _targetRotation.x + deltaY * 0.006));

      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop with Silky Exponential Damping
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Auto-rotation when idle
      if (autoRotate && !isDragging) {
        _targetRotation.y += 0.45 * dt;
      }

      // Smooth exponential damping: 1 - Math.exp(-k * dt)
      const dampFactor = 1 - Math.exp(-8 * dt);
      _currentRotation.y += (_targetRotation.y - _currentRotation.y) * dampFactor;
      _currentRotation.x += (_targetRotation.x - _currentRotation.x) * dampFactor;

      if (ensembleGroup) {
        ensembleGroup.rotation.y = _currentRotation.y;
        ensembleGroup.rotation.x = _currentRotation.x;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Clean up WebGL resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
      baseGeo.dispose();
      baseStepGeo.dispose();
      rodGeo.dispose();
      torsoGeo.dispose();
      finialGeo.dispose();
      skirtGeo.dispose();
      waistSashGeo.dispose();
      chokerGeo.dispose();
      gemGeo.dispose();
      hemGeo.dispose();
      shadowPlaneGeo.dispose();
      goldMaterial.dispose();
      darkVelvetBodiceMat.dispose();
      dressFabricMat.dispose();
      shadowPlaneMat.dispose();
    };
  }, []);

  // Update dress color dynamically
  useEffect(() => {
    if (dressMaterialRef.current) {
      dressMaterialRef.current.color.set(selectedColor);
    }
  }, [selectedColor]);

  // Update dress fabric properties
  useEffect(() => {
    if (!dressMaterialRef.current) return;
    if (selectedFabric === 'velvet') {
      dressMaterialRef.current.roughness = 0.85;
      dressMaterialRef.current.metalness = 0.05;
      dressMaterialRef.current.clearcoat = 0.1;
      dressMaterialRef.current.map = null;
      dressMaterialRef.current.needsUpdate = true;
    } else if (selectedFabric === 'silk') {
      dressMaterialRef.current.roughness = 0.35;
      dressMaterialRef.current.metalness = 0.35;
      dressMaterialRef.current.clearcoat = 0.5;
      dressMaterialRef.current.map = null;
      dressMaterialRef.current.needsUpdate = true;
    } else if (selectedFabric === 'brocade') {
      dressMaterialRef.current.roughness = 0.45;
      dressMaterialRef.current.metalness = 0.55;
      dressMaterialRef.current.clearcoat = 0.3;
      dressMaterialRef.current.map = createProceduralBrocadeTexture();
      dressMaterialRef.current.needsUpdate = true;
    }
  }, [selectedFabric]);

  // Adjust silhouette fitting (S, M, L)
  useEffect(() => {
    if (dressSkirtMeshRef.current && mannequinTorsoRef.current) {
      const scaleXZ = selectedFit === 'S' ? 0.92 : selectedFit === 'L' ? 1.08 : 1.0;
      dressSkirtMeshRef.current.scale.set(scaleXZ, 1, scaleXZ);
      mannequinTorsoRef.current.scale.set(scaleXZ, 1, scaleXZ);
    }
  }, [selectedFit]);

  return (
    <div className="relative w-full h-[480px] bg-gradient-to-b from-[#FDFBF7] to-[#F2EADB] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay: Minimal Title / Spec Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-[#4A0E17]/90 text-[#FDFBF7] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto border border-[#D4AF37]/40 backdrop-blur-none">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-semibold tracking-wider font-brand uppercase">{garmentName}</span>
          <span className="text-[10px] bg-[#D4AF37] text-[#4A0E17] font-bold px-1.5 py-0.5 rounded">3D VIP</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-[#FDFBF7] text-[#4A0E17] hover:bg-[#4A0E17] hover:text-[#FDFBF7] rounded-full shadow-lg transition-colors border border-[#D4AF37]/30 pointer-events-auto"
            title="Close 3D View"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating 360 Hint */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#4A0E17]/80 text-[#FDFBF7] text-[11px] px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 shadow">
        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Drag to rotate 360° • Pinch / Zoom</span>
      </div>

      {/* Collapsible Floating Bottom Control Dock */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-20">
        {/* Toggle Button */}
        <div className="flex justify-center -mb-2 relative z-30">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-[#4A0E17] text-[#D4AF37] text-[11px] font-semibold px-3 py-0.5 rounded-full border border-[#D4AF37]/40 shadow-md flex items-center gap-1 hover:bg-[#380B12] transition-colors"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? 'Show Couture Controls' : 'Hide Controls'}</span>
          </button>
        </div>

        {/* Control Box */}
        {!isCollapsed && (
          <div className="bg-[#4A0E17]/95 border border-[#D4AF37]/50 rounded-2xl p-3 shadow-2xl text-[#FDFBF7] space-y-2.5">
            {/* Row 1: Color Swatches */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold mb-1.5 flex items-center justify-between">
                <span>Fabric Shade</span>
                <span className="text-[10px] text-[#FDFBF7]/80">
                  {colors.find(c => c.hex === selectedColor)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-transform border-2 ${
                      selectedColor === c.hex ? 'border-[#D4AF37] scale-110 shadow-lg ring-2 ring-[#D4AF37]/50' : 'border-[#FDFBF7]/30'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Row 2: Texture Finish & Size Proportions */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D4AF37]/20">
              {/* Texture selection */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold block mb-1">
                  Weave Finish
                </span>
                <div className="grid grid-cols-3 gap-1 bg-[#380B12] p-0.5 rounded-lg border border-[#D4AF37]/30">
                  {(['velvet', 'silk', 'brocade'] as const).map(fabric => (
                    <button
                      key={fabric}
                      onClick={() => setSelectedFabric(fabric)}
                      className={`text-[10px] py-1 font-semibold rounded capitalize transition-colors ${
                        selectedFabric === fabric
                          ? 'bg-[#D4AF37] text-[#4A0E17] shadow'
                          : 'text-[#FDFBF7]/80 hover:text-[#FDFBF7]'
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mannequin Size Fitting */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold block mb-1 flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-[#D4AF37]" />
                  <span>Drape Fit</span>
                </span>
                <div className="grid grid-cols-3 gap-1 bg-[#380B12] p-0.5 rounded-lg border border-[#D4AF37]/30">
                  {(['S', 'M', 'L'] as const).map(fit => (
                    <button
                      key={fit}
                      onClick={() => setSelectedFit(fit)}
                      className={`text-[10px] py-1 font-semibold rounded transition-colors ${
                        selectedFit === fit
                          ? 'bg-[#D4AF37] text-[#4A0E17] shadow'
                          : 'text-[#FDFBF7]/80 hover:text-[#FDFBF7]'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Auto-Rotate Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-[#D4AF37]/20 text-[11px]">
              <span className="text-[#FDFBF7]/80 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                Continuous 360° Orbit
              </span>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors ${
                  autoRotate ? 'bg-[#D4AF37] text-[#4A0E17]' : 'bg-[#380B12] text-[#FDFBF7]/60'
                }`}
              >
                {autoRotate ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
