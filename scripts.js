// ===== 3D Background with Three.js =====

let scene, camera, renderer, particles, geometryGroup;
let scrollY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

function init3DBackground() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Create Floating Geometric Shapes
    createGeometryGroup();

    // Create Particle Field
    createParticles();

    // Add ambient glow
    createAmbientGlow();

    // Start Animation Loop
    animate();
}

function createGeometryGroup() {
    geometryGroup = new THREE.Group();

    // Materials - Monochrome
    const materials = [
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        }),
        new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        }),
        new THREE.MeshBasicMaterial({
            color: 0x888888,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        }),
        new THREE.MeshBasicMaterial({
            color: 0x666666,
            wireframe: true,
            transparent: true,
            opacity: 0.18
        })
    ];

    // Create various geometric shapes
    const shapes = [
        // Large icosahedron (center)
        {
            geometry: new THREE.IcosahedronGeometry(8, 1),
            material: materials[0],
            position: { x: 0, y: 0, z: -10 },
            rotation: { speed: 0.001, axis: 'y' }
        },
        // Octahedron (left)
        {
            geometry: new THREE.OctahedronGeometry(4, 0),
            material: materials[1],
            position: { x: -15, y: 8, z: -5 },
            rotation: { speed: 0.002, axis: 'x' }
        },
        // Torus (right)
        {
            geometry: new THREE.TorusGeometry(3, 0.8, 16, 32),
            material: materials[2],
            position: { x: 18, y: -5, z: -8 },
            rotation: { speed: 0.003, axis: 'z' }
        },
        // Dodecahedron (top right)
        {
            geometry: new THREE.DodecahedronGeometry(3, 0),
            material: materials[3],
            position: { x: 12, y: 12, z: -15 },
            rotation: { speed: 0.0015, axis: 'y' }
        },
        // Small tetrahedron (bottom left)
        {
            geometry: new THREE.TetrahedronGeometry(2, 0),
            material: materials[0],
            position: { x: -12, y: -10, z: -12 },
            rotation: { speed: 0.002, axis: 'x' }
        },
        // Torus knot (background)
        {
            geometry: new THREE.TorusKnotGeometry(5, 0.5, 64, 8),
            material: materials[1],
            position: { x: -20, y: -15, z: -25 },
            rotation: { speed: 0.001, axis: 'y' }
        }
    ];

    shapes.forEach((shapeData, index) => {
        const mesh = new THREE.Mesh(shapeData.geometry, shapeData.material);
        mesh.position.set(
            shapeData.position.x,
            shapeData.position.y,
            shapeData.position.z
        );
        mesh.userData = {
            rotationSpeed: shapeData.rotation.speed,
            rotationAxis: shapeData.rotation.axis,
            originalY: shapeData.position.y,
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: 0.5 + Math.random() * 0.5
        };
        geometryGroup.add(mesh);
    });

    scene.add(geometryGroup);
}

function createParticles() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Monochrome color palette
    const colorPalette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xcccccc),
        new THREE.Color(0x888888),
        new THREE.Color(0x555555)
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createAmbientGlow() {
    // Add subtle ambient light spheres
    const glowGeometry = new THREE.SphereGeometry(15, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.02
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.position.set(10, 5, -30);
    scene.add(glowSphere);

    const glowSphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(20, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.015
        })
    );
    glowSphere2.position.set(-15, -10, -40);
    scene.add(glowSphere2);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Smooth rotation interpolation
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;

    // Animate geometric shapes
    if (geometryGroup) {
        geometryGroup.children.forEach((mesh, index) => {
            // Base rotation
            const axis = mesh.userData.rotationAxis;
            const speed = mesh.userData.rotationSpeed;

            mesh.rotation[axis] += speed;

            // Floating animation
            const floatY = Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.5;
            mesh.position.y = mesh.userData.originalY + floatY;

            // Scroll-based parallax
            mesh.position.y += scrollY * 0.01 * (index + 1) * 0.1;
        });

        // Apply scroll-based rotation to the entire group
        geometryGroup.rotation.x = currentRotationX;
        geometryGroup.rotation.y = currentRotationY;
    }

    // Animate particles
    if (particles) {
        particles.rotation.y += 0.0002;
        particles.rotation.x += 0.0001;

        // Parallax effect on particles
        particles.position.y = scrollY * -0.02;
    }

    renderer.render(scene, camera);
}

// ===== Scroll Handling =====
function handleScroll() {
    scrollY = window.scrollY;

    // Calculate scroll-based rotation
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / maxScroll;

    targetRotationX = scrollProgress * Math.PI * 0.3;
    targetRotationY = scrollProgress * Math.PI * 0.5;

    // Reveal animations for sections
    revealOnScroll();
}

// ===== Reveal on Scroll =====
function setupRevealAnimations() {
    const revealElements = document.querySelectorAll('.project-card, .section-header');
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });
}

function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;

    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('visible');
        }
    });
}

// ===== Mouse Parallax =====
function handleMouseMove(e) {
    if (!geometryGroup) return;

    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = (e.clientY / window.innerHeight) * 2 - 1;

    targetRotationY += mouseX * 0.01;
    targetRotationX += mouseY * 0.01;
}

// ===== Resize Handler =====
function handleResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== Smooth Scroll for Anchor Links =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        init3DBackground();
    }

    // Setup animations and interactions
    setupRevealAnimations();
    setupSmoothScroll();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial reveal check
    setTimeout(revealOnScroll, 100);
});

// ===== Typed Text Animation =====
const typedTexts = [
    'stuff',
    'more stuff',
    'even more stuff',
    'and even more stuff'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typedElement = null;

function typeText() {
    if (!typedElement) {
        typedElement = document.querySelector('.typed-text');
        if (!typedElement) return;
    }

    const currentText = typedTexts[textIndex];

    if (isDeleting) {
        typedElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typedTexts.length;
        typeSpeed = 500; // Pause before new word
    }

    setTimeout(typeText, typeSpeed);
}

// Start typing animation after page load
window.addEventListener('load', () => {
    setTimeout(typeText, 1500);
});
