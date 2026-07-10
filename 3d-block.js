// Anchor Grain Customs — interactive 3D nameplate preview (hero section)
// Static by default; rotates only while the visitor drags it (mouse or touch).

document.addEventListener('DOMContentLoaded', () => {

  const container = document.getElementById('hero-3d-block');
  if (!container || typeof THREE === 'undefined') return;

  const WOOD_DARK = '#5c3517';
  const WOOD_MID = '#7a4a24';
  const WOOD_LIGHT = '#8a5a34';
  const ENGRAVE_COLOR = '#2a1808';

  function makeFaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Wood-grain background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, WOOD_LIGHT);
    grad.addColorStop(0.5, WOOD_MID);
    grad.addColorStop(1, WOOD_DARK);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const y = (i / 14) * canvas.height + (Math.sin(i) * 6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(canvas.width * 0.3, y + 10, canvas.width * 0.7, y - 10, canvas.width, y);
      ctx.stroke();
    }

    // Engraved-looking border
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Etched text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = ENGRAVE_COLOR;
    ctx.shadowColor = 'rgba(255,255,255,0.15)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 2;

    ctx.font = '700 120px Arial, sans-serif';
    ctx.fillText('ANCHOR GRAIN', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '600 62px Arial, sans-serif';
    ctx.letterSpacing = '10px';
    ctx.fillText('C U S T O M S', canvas.width / 2, canvas.height / 2 + 70);

    return new THREE.CanvasTexture(canvas);
  }

  function makeSideMaterial() {
    return new THREE.MeshStandardMaterial({ color: 0x6b4021, roughness: 0.75, metalness: 0.05 });
  }

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff2df, 0.9);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xd9822b, 0.3);
  fillLight.position.set(-4, -2, 2);
  scene.add(fillLight);

  const geometry = new THREE.BoxGeometry(3.2, 1.6, 0.22);
  const materials = [
    makeSideMaterial(), // +x
    makeSideMaterial(), // -x
    makeSideMaterial(), // +y
    makeSideMaterial(), // -y
    new THREE.MeshStandardMaterial({ map: makeFaceTexture(), roughness: 0.55, metalness: 0.05 }), // +z (front)
    makeSideMaterial(), // -z
  ];

  const block = new THREE.Mesh(geometry, materials);
  scene.add(block);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  resize();
  window.addEventListener('resize', resize);

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  // ---------- Drag-to-rotate (mouse + touch via Pointer Events) ----------
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  const ROTATE_SPEED = 0.008;
  const MAX_X_ROTATION = 1.1;

  function startDrag(x, y, pointerId) {
    isDragging = true;
    lastX = x;
    lastY = y;
    container.classList.add('is-dragging');
    if (pointerId !== undefined) container.setPointerCapture(pointerId);
  }

  function moveDrag(x, y) {
    if (!isDragging) return;
    const deltaX = x - lastX;
    const deltaY = y - lastY;
    lastX = x;
    lastY = y;

    block.rotation.y += deltaX * ROTATE_SPEED;
    block.rotation.x += deltaY * ROTATE_SPEED;
    block.rotation.x = Math.max(-MAX_X_ROTATION, Math.min(MAX_X_ROTATION, block.rotation.x));
  }

  function endDrag() {
    isDragging = false;
    container.classList.remove('is-dragging');
  }

  container.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY, e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    moveDrag(e.clientX, e.clientY);
  });

  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);
  container.addEventListener('pointerleave', endDrag);

});
