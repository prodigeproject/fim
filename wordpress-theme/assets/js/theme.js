/**
 * FIM Theme - Interactive JavaScript
 * Forum Indonesia Muda WordPress Theme
 *
 * @package FIM_Theme
 * @version 2.0.0
 */

(function() {
    'use strict';

    // ==========================================================================
    // DOM Ready
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initScrollProgress();
        initBackToTop();
        initMobileMenu();
        initSmoothScroll();
        initNavbarScroll();
        initFAQAccordion();
        initCopyToClipboard();
        initVideoModal();
        initFilterButtons();
        initSearchToggle();
        initCounterAnimation();
        initLazyLoading();
    });

    // ==========================================================================
    // Scroll Progress Bar
    // ==========================================================================
    function initScrollProgress() {
        const progressBar = document.querySelector('.fim-scroll-progress');
        if (!progressBar) {
            // Create progress bar if not exists
            const bar = document.createElement('div');
            bar.className = 'fim-scroll-progress';
            document.body.prepend(bar);
        }

        function updateProgress() {
            const scrollProgress = document.querySelector('.fim-scroll-progress');
            if (!scrollProgress) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            
            scrollProgress.style.width = progress + '%';
        }

        window.addEventListener('scroll', throttle(updateProgress, 10));
        updateProgress();
    }

    // ==========================================================================
    // Back to Top Button
    // ==========================================================================
    function initBackToTop() {
        let backToTop = document.querySelector('.fim-back-to-top');
        
        // Create button if not exists
        if (!backToTop) {
            backToTop = document.createElement('button');
            backToTop.className = 'fim-back-to-top';
            backToTop.setAttribute('aria-label', 'Kembali ke atas');
            backToTop.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                </svg>
            `;
            document.body.appendChild(backToTop);
        }

        function toggleVisibility() {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', throttle(toggleVisibility, 100));
        toggleVisibility();

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================================================
    // Mobile Menu Toggle
    // ==========================================================================
    function initMobileMenu() {
        const toggle = document.querySelector('.fim-nav-toggle');
        const mobileNav = document.querySelector('.fim-nav-mobile');
        const body = document.body;

        if (!toggle || !mobileNav) return;

        // Create overlay
        let overlay = document.querySelector('.fim-nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'fim-nav-overlay';
            document.body.appendChild(overlay);
        }

        function openMenu() {
            mobileNav.classList.add('open');
            overlay.classList.add('visible');
            body.style.overflow = 'hidden';
            toggle.setAttribute('aria-expanded', 'true');
            
            // Animate hamburger to X
            toggle.classList.add('active');
        }

        function closeMenu() {
            mobileNav.classList.remove('open');
            overlay.classList.remove('visible');
            body.style.overflow = '';
            toggle.setAttribute('aria-expanded', 'false');
            
            // Animate X to hamburger
            toggle.classList.remove('active');
        }

        toggle.addEventListener('click', function() {
            if (mobileNav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        overlay.addEventListener('click', closeMenu);

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                closeMenu();
            }
        });

        // Close on link click
        mobileNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });

        // Handle dropdown menus in mobile
        const dropdowns = mobileNav.querySelectorAll('.fim-dropdown');
        dropdowns.forEach(function(dropdown) {
            const trigger = dropdown.querySelector('.fim-dropdown-trigger');
            const menu = dropdown.querySelector('.fim-dropdown-menu');
            
            if (trigger && menu) {
                trigger.addEventListener('click', function(e) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                });
            }
        });
    }

    // ==========================================================================
    // Navbar Scroll Effect
    // ==========================================================================
    function initNavbarScroll() {
        const navbar = document.querySelector('.fim-navbar');
        if (!navbar) return;

        function handleScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', throttle(handleScroll, 50));
        handleScroll();
    }

    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    
                    const navbarHeight = document.querySelector('.fim-navbar')?.offsetHeight || 80;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // ==========================================================================
    // FAQ Accordion
    // ==========================================================================
    function initFAQAccordion() {
        const faqItems = document.querySelectorAll('.fim-faq-item');
        
        faqItems.forEach(function(item) {
            const question = item.querySelector('.fim-faq-question');
            const answer = item.querySelector('.fim-faq-answer');
            
            if (!question || !answer) return;

            question.addEventListener('click', function() {
                const isOpen = item.classList.contains('open');
                
                // Close all other items (optional - remove for multi-open)
                faqItems.forEach(function(otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                    }
                });

                // Toggle current item
                item.classList.toggle('open');

                // Update aria attributes
                question.setAttribute('aria-expanded', !isOpen);
            });
        });
    }

    // ==========================================================================
    // Copy to Clipboard
    // ==========================================================================
    function initCopyToClipboard() {
        const copyButtons = document.querySelectorAll('.fim-copy-btn, [data-copy]');
        
        copyButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const textToCopy = this.dataset.copy || 
                                   this.closest('.fim-bank-account')?.querySelector('.fim-bank-number')?.textContent ||
                                   this.previousElementSibling?.textContent;
                
                if (!textToCopy) return;

                navigator.clipboard.writeText(textToCopy.trim()).then(function() {
                    // Show success feedback
                    const originalText = button.innerHTML;
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Tersalin!
                    `;
                    button.classList.add('copied');
                    
                    setTimeout(function() {
                        button.innerHTML = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                }).catch(function(err) {
                    console.error('Failed to copy:', err);
                    
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy.trim();
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                });
            });
        });
    }

    // ==========================================================================
    // Video Modal
    // ==========================================================================
    function initVideoModal() {
        const videoTriggers = document.querySelectorAll('[data-video]');
        let modal = document.querySelector('.fim-video-modal');

        if (videoTriggers.length === 0) return;

        // Create modal if not exists
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'fim-video-modal';
            modal.innerHTML = `
                <div class="fim-video-modal-content">
                    <button class="fim-video-close" aria-label="Tutup video">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <div class="fim-video-wrapper">
                        <iframe src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const iframe = modal.querySelector('iframe');
        const closeBtn = modal.querySelector('.fim-video-close');

        function openModal(videoUrl) {
            // Convert YouTube URL to embed URL
            let embedUrl = videoUrl;
            if (videoUrl.includes('youtube.com/watch')) {
                const videoId = new URL(videoUrl).searchParams.get('v');
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            } else if (videoUrl.includes('youtu.be')) {
                const videoId = videoUrl.split('/').pop();
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }

            iframe.src = embedUrl;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            iframe.src = '';
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }

        videoTriggers.forEach(function(trigger) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const videoUrl = this.dataset.video || this.href;
                if (videoUrl) {
                    openModal(videoUrl);
                }
            });
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // ==========================================================================
    // Filter Buttons (Regional, FIM Club, Categories)
    // ==========================================================================
    function initFilterButtons() {
        const filterSections = document.querySelectorAll('.fim-filter-section');
        
        filterSections.forEach(function(section) {
            const buttons = section.querySelectorAll('.fim-filter-btn');
            const targetSelector = section.dataset.target || '.fim-card';
            const filterKey = section.dataset.filter || 'category';
            
            buttons.forEach(function(button) {
                button.addEventListener('click', function() {
                    const filterValue = this.dataset.value || this.dataset[filterKey] || 'all';
                    
                    // Update active state
                    buttons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter items
                    const items = document.querySelectorAll(targetSelector);
                    items.forEach(function(item) {
                        const itemValue = item.dataset[filterKey] || item.dataset.category || '';
                        
                        if (filterValue === 'all' || itemValue.toLowerCase().includes(filterValue.toLowerCase())) {
                            item.style.display = '';
                            item.classList.add('animate-fadeIn');
                        } else {
                            item.style.display = 'none';
                            item.classList.remove('animate-fadeIn');
                        }
                    });

                    // Update results count
                    const visibleItems = document.querySelectorAll(targetSelector + ':not([style*="display: none"])');
                    const resultsCount = document.querySelector('.fim-results-count');
                    if (resultsCount) {
                        resultsCount.textContent = `Menampilkan ${visibleItems.length} hasil`;
                    }
                });
            });
        });
    }

    // ==========================================================================
    // Search Toggle
    // ==========================================================================
    function initSearchToggle() {
        const searchToggle = document.querySelector('.fim-search-toggle');
        const searchForm = document.querySelector('.fim-search-form');
        const searchInput = document.querySelector('.fim-search-input');
        
        if (!searchToggle || !searchForm) return;

        searchToggle.addEventListener('click', function() {
            searchForm.classList.toggle('open');
            if (searchForm.classList.contains('open') && searchInput) {
                searchInput.focus();
            }
        });

        // Close on click outside
        document.addEventListener('click', function(e) {
            if (!searchForm.contains(e.target) && !searchToggle.contains(e.target)) {
                searchForm.classList.remove('open');
            }
        });

        // Live search (if enabled)
        if (searchInput && searchInput.dataset.live === 'true') {
            searchInput.addEventListener('input', debounce(function() {
                const query = this.value.toLowerCase();
                const targetSelector = searchForm.dataset.target || '.fim-card';
                const items = document.querySelectorAll(targetSelector);
                
                items.forEach(function(item) {
                    const text = item.textContent.toLowerCase();
                    if (query === '' || text.includes(query)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }, 300));
        }
    }

    // ==========================================================================
    // Counter Animation (for statistics)
    // ==========================================================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.fim-stat-number[data-count]');
        if (counters.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.count, 10);
                    const duration = parseInt(counter.dataset.duration, 10) || 2000;
                    const suffix = counter.dataset.suffix || '';
                    const prefix = counter.dataset.prefix || '';
                    
                    animateCounter(counter, target, duration, prefix, suffix);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function animateCounter(element, target, duration, prefix, suffix) {
        const start = 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-quad)
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            
            const current = Math.floor(easeProgress * target);
            element.textContent = prefix + current.toLocaleString('id-ID') + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = prefix + target.toLocaleString('id-ID') + suffix;
            }
        }
        
        requestAnimationFrame(update);
    }

    // ==========================================================================
    // Lazy Loading for Images
    // ==========================================================================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        if (lazyImages.length === 0) return;

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        img.removeAttribute('data-srcset');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px'
            });

            lazyImages.forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            lazyImages.forEach(function(img) {
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
            });
        }
    }

    // ==========================================================================
    // Utility Functions
    // ==========================================================================
    
    /**
     * Throttle function - limits how often a function can be called
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * Debounce function - delays function execution until after wait period
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // ==========================================================================
    // Global Functions (for inline onclick handlers)
    // ==========================================================================
    
    // Toggle FAQ (for backwards compatibility)
    window.toggleFaq = function(element) {
        const faqItem = element.closest('.fim-faq-item');
        if (faqItem) {
            faqItem.classList.toggle('open');
        }
    };

    // Copy to clipboard (for backwards compatibility)
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Berhasil disalin!');
        }).catch(function() {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Berhasil disalin!');
        });
    };

    // Filter regionals (for backwards compatibility)
    window.filterRegionals = function(query) {
        const cards = document.querySelectorAll('.fim-regional-card');
        const lowerQuery = query.toLowerCase();
        
        cards.forEach(function(card) {
            const text = card.textContent.toLowerCase();
            if (lowerQuery === '' || text.includes(lowerQuery)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Filter by island (for backwards compatibility)
    window.filterByIsland = function(island) {
        const buttons = document.querySelectorAll('.fim-filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        const cards = document.querySelectorAll('.fim-regional-card');
        cards.forEach(function(card) {
            if (island === 'Semua' || card.dataset.island === island) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Filter by category (for backwards compatibility)
    window.filterByCategory = function(category) {
        const buttons = document.querySelectorAll('.fim-filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        const cards = document.querySelectorAll('.fim-club-card, .fim-card');
        cards.forEach(function(card) {
            if (category === 'Semua' || card.dataset.category === category) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Copy link (for backwards compatibility)
    window.copyLink = function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            alert('Link berhasil disalin!');
        });
    };

})();
