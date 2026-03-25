// Initialize Lucide Icons
lucide.createIcons();

// Lenis Smooth Scroll Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Prevent scroll during loading
lenis.stop();
document.body.style.overflow = 'hidden';

// Preloader Logic
const counterObj = { val: 0 };
const counterEl = document.querySelector('.preloader-counter');

const preloaderTl = gsap.timeline();

// 3D Letters entrance
const chars = document.querySelectorAll('.preloader-logo .char, .preloader-logo .dot');
preloaderTl.from(chars, {
    y: 80,
    rotationX: -90,
    z: -200,
    opacity: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: "back.out(1.5)"
}, 0);

preloaderTl.to(counterObj, {
    val: 100,
    duration: 1.8,
    ease: "power3.inOut",
    onUpdate: () => {
        if(counterEl) counterEl.innerHTML = Math.round(counterObj.val) + "%";
    }
}, 0.2)
.to(".preloader-content", {
    y: -50,
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
})
.to(".preloader", {
    yPercent: -100,
    duration: 1,
    ease: "expo.inOut",
    onComplete: () => {
        lenis.start();
        document.body.style.overflow = '';
    }
}, "-=0.2");

// Hero Animations
const heroTl = gsap.timeline({ delay: 2.8 });
heroTl.from(".stagger-text", {
    y: 100,
    opacity: 0,
    clipPath: "inset(100% 0 0 0)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power4.out",
    delay: 0.2
});

// Animate Sections On Scroll
const sections = gsap.utils.toArray('section.services, section.work, section.about, section.contact');

sections.forEach((sec) => {
    // Advanced Mask Reveal on sections
    gsap.from(sec, {
        y: 80,
        opacity: 0,
        clipPath: "inset(20% 0 0 0)",
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
            trigger: sec,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

// Parallax Project Cards Logic
const projectImages = gsap.utils.toArray('.project-img-wrapper img');
projectImages.forEach((img) => {
    gsap.fromTo(img, 
        { "--parallax-y": "-15%" }, 
        { 
            "--parallax-y": "15%",
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );
});

// Three.js Background Elements Setup
const canvas = document.getElementById('voxel-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Voxel Particles Setup
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a wide area
    posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create custom material for voxels (particles as small cubes)
const material = new THREE.PointsMaterial({
    size: 0.4,
    color: 0x00D4FF,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

// Center Rotating Voxel Cube (made of outlines)
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const edges = new THREE.EdgesGeometry(cubeGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.3 });
const cube = new THREE.LineSegments(edges, lineMaterial);
scene.add(cube);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Smooth mouse follow
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
    
    // Constant slow float
    particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 2;
    
    // Voxel rotation
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    
    // Parallax cube slightly mapped to mouse
    cube.position.x += 0.05 * (mouseX * 0.01 - cube.position.x);
    cube.position.y += 0.05 * (-mouseY * 0.01 - cube.position.y);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Modal Logic
const overlay = document.getElementById('modal-overlay');
const closeBtns = document.querySelectorAll('.close-modal');
const triggerBtns = document.querySelectorAll('.view-case-study');

triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetBtn = e.target.closest('.view-case-study');
        if (!targetBtn) return;
        
        const targetId = targetBtn.getAttribute('data-modal');
        const modal = document.getElementById(targetId);
        
        if (modal) {
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    });
});

function closeModal() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => modal.classList.remove('active'));
    overlay.classList.remove('active');
}

closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
overlay.addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
