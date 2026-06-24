document.addEventListener("DOMContentLoaded", () => {
    // --- THREE.JS BACKGROUND ---
    const initThreeJS = () => {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Accent Color
        const accentColor = 0x17cf82;

        // Create multiple floating shapes
        const shapes = [];
        const geometryTypes = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16)
        ];

        for (let i = 0; i < 6; i++) { // Create 6 floating shapes
            const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
            const material = new THREE.MeshBasicMaterial({
                color: accentColor,
                wireframe: true,
                transparent: true,
                opacity: 0.03 // Very subtle like the reference
            });
            const mesh = new THREE.Mesh(geometry, material);

            // Randomize Position
            mesh.position.x = (Math.random() - 0.5) * 35;
            mesh.position.y = (Math.random() - 0.5) * 20;
            mesh.position.z = (Math.random() - 0.5) * 10;

            // Randomize Scale
            const scale = Math.random() * 3 + 2; // Large shapes
            mesh.scale.set(scale, scale, scale);

            // Randomize Rotation Speed
            mesh.userData = {
                rotX: (Math.random() - 0.5) * 0.002,
                rotY: (Math.random() - 0.5) * 0.002
            };

            scene.add(mesh);
            shapes.push(mesh);
        }

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 800;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 60; // Wider spread
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: accentColor,
            transparent: true,
            opacity: 0.3
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 20;

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Animate Shapes
            shapes.forEach(shape => {
                shape.rotation.x += shape.userData.rotX;
                shape.rotation.y += shape.userData.rotY;

                // Gentle floating
                shape.position.y += Math.sin(Date.now() * 0.001 + shape.position.x) * 0.005;
            });

            // Animate Particles
            particlesMesh.rotation.y -= 0.0005;
            particlesMesh.rotation.x -= 0.0002;

            renderer.render(scene, camera);
        };
        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initThreeJS();

    // Initialize Icons
    lucide.createIcons();

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

    // --- PROJECT IMAGE LIGHTBOX ---
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

    // Disable pinch-to-zoom on iOS Safari
    document.addEventListener("gesturestart", (e) => {
        e.preventDefault();
    });

});
