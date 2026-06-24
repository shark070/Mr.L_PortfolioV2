document.addEventListener("DOMContentLoaded", () => {
    // --- THREE.JS BACKGROUND ---
    const initThreeJS = () => {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Accent Color & Color Channels
        const accentColor = 0xc7ff4d;
        const baseR = 199 / 255;
        const baseG = 255 / 255;
        const baseB = 77 / 255;

        // Network space limits
        const boundsX = 35;
        const boundsY = 20;
        const boundsZ = 12;

        // Particle nodes
        const particleCount = 75;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        // Initialize positions & movement vectors
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * boundsX * 1.8;
            positions[i * 3 + 1] = (Math.random() - 0.5) * boundsY * 1.8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * boundsZ * 1.8;

            // Slow drift velocity
            velocities[i * 3] = (Math.random() - 0.5) * 0.015;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.18,
            color: accentColor,
            transparent: true,
            opacity: 0.6
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Hub nodes (Premium Octahedron / Icosahedron crystal structures)
        const hubs = [];
        const hubGeometries = [
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.IcosahedronGeometry(0.4, 0)
        ];

        for (let i = 0; i < 6; i++) {
            const geo = hubGeometries[i % hubGeometries.length];
            const mat = new THREE.MeshBasicMaterial({
                color: accentColor,
                wireframe: true,
                transparent: true,
                opacity: 0.25
            });
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);
            hubs.push(mesh);
        }

        // Interconnected Lines (Constellation System)
        const threshold = 8.5;
        const maxConnections = 250;
        const linePositions = new Float32Array(maxConnections * 2 * 3);
        const lineColors = new Float32Array(maxConnections * 2 * 3);

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lineSegments);

        // Dust Particles (Atmospheric Ambient Background)
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 800;
        const dustPosArray = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount * 3; i++) {
            dustPosArray[i] = (Math.random() - 0.5) * 60; // Wider spread
        }

        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPosArray, 3));
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: accentColor,
            transparent: true,
            opacity: 0.25
        });
        const dustMesh = new THREE.Points(dustGeometry, dustMaterial);
        scene.add(dustMesh);

        camera.position.z = 22;
        camera.lookAt(scene.position);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Update particle drift
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i * 3];
                positions[i * 3 + 1] += velocities[i * 3 + 1];
                positions[i * 3 + 2] += velocities[i * 3 + 2];

                const limX = boundsX * 0.9;
                const limY = boundsY * 0.9;
                const limZ = boundsZ * 0.9;

                // Bounce at bounds
                if (positions[i * 3] < -limX || positions[i * 3] > limX) velocities[i * 3] *= -1;
                if (positions[i * 3 + 1] < -limY || positions[i * 3 + 1] > limY) velocities[i * 3 + 1] *= -1;
                if (positions[i * 3 + 2] < -limZ || positions[i * 3 + 2] > limZ) velocities[i * 3 + 2] *= -1;
            }

            particlesGeometry.attributes.position.needsUpdate = true;

            // Rotate and position crystal hubs
            for (let i = 0; i < hubs.length; i++) {
                hubs[i].position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                hubs[i].rotation.x += 0.003;
                hubs[i].rotation.y += 0.005;
            }

            // Compute connection lines dynamic vertices and gradients
            let vertexIndex = 0;
            let numConnections = 0;

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < threshold) {
                        const alpha = (1.0 - (dist / threshold)) * 0.22; // Limit opacity for professional feel

                        // Add lines points
                        linePositions[vertexIndex] = positions[i * 3];
                        linePositions[vertexIndex + 1] = positions[i * 3 + 1];
                        linePositions[vertexIndex + 2] = positions[i * 3 + 2];

                        linePositions[vertexIndex + 3] = positions[j * 3];
                        linePositions[vertexIndex + 4] = positions[j * 3 + 1];
                        linePositions[vertexIndex + 5] = positions[j * 3 + 2];

                        // Add colors
                        lineColors[vertexIndex] = baseR * alpha;
                        lineColors[vertexIndex + 1] = baseG * alpha;
                        lineColors[vertexIndex + 2] = baseB * alpha;

                        lineColors[vertexIndex + 3] = baseR * alpha;
                        lineColors[vertexIndex + 4] = baseG * alpha;
                        lineColors[vertexIndex + 5] = baseB * alpha;

                        vertexIndex += 6;
                        numConnections++;

                        if (numConnections >= maxConnections) break;
                    }
                }
                if (numConnections >= maxConnections) break;
            }

            lineGeometry.setDrawRange(0, numConnections * 2);
            lineGeometry.attributes.position.needsUpdate = true;
            lineGeometry.attributes.color.needsUpdate = true;

            // Slow floating movement of dust particles
            dustMesh.rotation.y -= 0.0003;
            dustMesh.rotation.x -= 0.0001;

            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initThreeJS();

    // Initialize Icons
    lucide.createIcons();

    // V1 Button Navigation Logic (Theme toggle functionality removed)
    const v1Button = document.getElementById("theme-toggle");
    if (v1Button) {
        v1Button.addEventListener("click", () => {
            window.location.href = "./v1/index.html";
        });
    }

    // Simple entrance animation for hero elements


    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal");
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hide-on-scroll');
    hiddenElements.forEach((el) => observer.observe(el));

    // Navbar Scroll Effect
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Active Navigation Link Highlighting
    const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
    const sections = document.querySelectorAll("section[id]");

    const sectionObserverOptions = {
        threshold: 0.25,
        rootMargin: "-20% 0px -40% 0px"
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });
            }
        });
    }, sectionObserverOptions);

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });

    // Project Image Lightbox + Navigation
    const galleryImages = document.querySelectorAll('.gallery-img');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;

    function showImage(index){
        if(index < 0) currentIndex = galleryImages.length - 1;
        else if(index >= galleryImages.length) currentIndex = 0;
        else currentIndex = index;
        modalImg.src = galleryImages[currentIndex].src;
    }

    if (galleryImages.length && modal && modalImg && closeBtn) {
        const openModal = () => {
            modal.style.display = 'flex';
            modal.offsetHeight; // Force reflow
            modal.classList.add('show');
        };

        const closeModal = () => {
            modal.classList.remove('show');
            if (window.innerWidth <= 768) {
                modal.style.display = 'none';
            } else {
                setTimeout(() => {
                    if (!modal.classList.contains('show')) {
                        modal.style.display = 'none';
                    }
                }, 300); // match transition duration
            }
        };

        galleryImages.forEach((img,index) => {
            img.addEventListener('click', () => {
                currentIndex = index;
                showImage(currentIndex);
                openModal();
            });
        });

        closeBtn.addEventListener('click', closeModal);

        if(prevBtn) prevBtn.addEventListener('click',(e)=>{e.stopPropagation();showImage(currentIndex-1);});
        if(nextBtn) nextBtn.addEventListener('click',(e)=>{e.stopPropagation();showImage(currentIndex+1);});

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if(modal.style.display==='flex'){
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft') showImage(currentIndex-1);
                if (e.key === 'ArrowRight') showImage(currentIndex+1);
            }
        });
    }

    // --- MOBILE NAVIGATION TOGGLE ---
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinksContainer = document.querySelector(".nav-links");

    if (menuToggle && navLinksContainer) {
        const toggleMenu = () => {
            const isOpen = menuToggle.classList.toggle("open");
            navLinksContainer.classList.toggle("open");
            if (isOpen) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        };

        const closeMenu = () => {
            menuToggle.classList.remove("open");
            navLinksContainer.classList.remove("open");
            document.body.style.overflow = "";
        };

        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking on a link
        const links = navLinksContainer.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", () => {
                closeMenu();
            });
        });

        // Close menu when clicking outside of it
        document.addEventListener("click", (e) => {
            if (navLinksContainer.classList.contains("open")) {
                if (!navLinksContainer.contains(e.target) && !menuToggle.contains(e.target)) {
                    closeMenu();
                }
            }
        });
    }

    // Disable pinch-to-zoom on iOS Safari
    document.addEventListener("gesturestart", (e) => {
        e.preventDefault();
    });

});

