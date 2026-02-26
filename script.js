// ============================================
// Animated Background with Particles
// ============================================
function initAnimatedBackground() {
    const bg = document.getElementById('animated-bg');
    if (!bg) return;

    // Create floating particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const randomX = Math.random() * window.innerWidth;
        const randomDelay = Math.random() * 20;
        const randomDuration = 20 + Math.random() * 15;
        
        particle.style.left = randomX + 'px';
        particle.style.top = window.innerHeight + 'px';
        particle.style.animationDelay = randomDelay + 's';
        particle.style.animationDuration = randomDuration + 's';
        
        bg.appendChild(particle);
    }

    // Recreate particles when they leave the viewport
    setInterval(() => {
        const particles = document.querySelectorAll('.particle');
        if (particles.length < particleCount) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const randomX = Math.random() * window.innerWidth;
            const randomDelay = 0;
            const randomDuration = 20 + Math.random() * 15;
            
            particle.style.left = randomX + 'px';
            particle.style.top = window.innerHeight + 'px';
            particle.style.animationDelay = randomDelay + 's';
            particle.style.animationDuration = randomDuration + 's';
            
            bg.appendChild(particle);
        }
    }, 5000);

    // Handle window resize
    window.addEventListener('resize', () => {
        // Particles will be repositioned automatically
    });
}

// ============================================
// Skill Tracking System
// ============================================
class SkillTracker {
    constructor() {
        this.selectedSkills = JSON.parse(localStorage.getItem('selectedSkills')) || [];
        this.skillClicks = JSON.parse(localStorage.getItem('skillClicks')) || {};
        this.init();
    }

    init() {
        const skillBoxes = document.querySelectorAll('.skill-box');
        skillBoxes.forEach(box => {
            const skillName = box.textContent.trim();
            
            // Restore active state
            if (this.selectedSkills.includes(skillName)) {
                box.classList.add('active');
            }

            // Add click handler
            box.addEventListener('click', () => this.toggleSkill(skillName, box));
        });
    }

    toggleSkill(skillName, element) {
        const index = this.selectedSkills.indexOf(skillName);
        
        if (index > -1) {
            this.selectedSkills.splice(index, 1);
            element.classList.remove('active');
        } else {
            this.selectedSkills.push(skillName);
            element.classList.add('active');
            this.showNotification(`✓ ${skillName} добавлен`);
        }

        // Track clicks
        this.skillClicks[skillName] = (this.skillClicks[skillName] || 0) + 1;

        // Save to localStorage
        this.save();
    }

    save() {
        localStorage.setItem('selectedSkills', JSON.stringify(this.selectedSkills));
        localStorage.setItem('skillClicks', JSON.stringify(this.skillClicks));
    }

    getSelectedSkills() {
        return this.selectedSkills;
    }

    getStats() {
        return {
            totalSkillsSelected: this.selectedSkills.length,
            totalClicks: Object.values(this.skillClicks).reduce((a, b) => a + b, 0),
            skillClicks: this.skillClicks
        };
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('hidden');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// ============================================
// Smooth Scroll Navigation
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ============================================
// Page Analytics
// ============================================
class Analytics {
    constructor() {
        this.sessionStart = new Date();
        this.sectionViews = JSON.parse(sessionStorage.getItem('sectionViews')) || {};
        this.initSectionObserver();
    }

    initSectionObserver() {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.sectionViews[sectionId] = (this.sectionViews[sectionId] || 0) + 1;
                    sessionStorage.setItem('sectionViews', JSON.stringify(this.sectionViews));
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    getSessionDuration() {
        return Math.floor((new Date() - this.sessionStart) / 1000);
    }

    getSectionViews() {
        return this.sectionViews;
    }

    logEvent(eventName, eventData = {}) {
        const event = {
            timestamp: new Date().toISOString(),
            eventName,
            eventData,
            sessionDuration: this.getSessionDuration()
        };
        console.log('[Analytics]', event);
    }
}

// ============================================
// Keyboard Shortcuts
// ============================================
function initKeyboardShortcuts(skillTracker) {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + S to show selected skills
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            const skills = skillTracker.getSelectedSkills();
            const stats = skillTracker.getStats();
            console.log('Selected Skills:', skills);
            console.log('Stats:', stats);
            alert(`Selected Skills: ${skills.join(', ') || 'None'}\n\nTotal Clicks: ${stats.totalClicks}`);
        }
    });
}

// ============================================
// Initialize everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animated background
    initAnimatedBackground();

    // Initialize skill tracking
    const skillTracker = new SkillTracker();

    // Initialize analytics
    const analytics = new Analytics();
    analytics.logEvent('page_load', { url: window.location.href });

    // Initialize smooth scrolling
    initSmoothScroll();

    // Initialize keyboard shortcuts
    initKeyboardShortcuts(skillTracker);

    // Log page unload
    window.addEventListener('beforeunload', () => {
        analytics.logEvent('page_unload', {
            duration: analytics.getSessionDuration(),
            selectedSkills: skillTracker.getSelectedSkills(),
            stats: skillTracker.getStats()
        });
    });

    // Log when user returns to page after 5 minutes
    let focusTimer;
    window.addEventListener('blur', () => {
        focusTimer = Date.now();
    });

    window.addEventListener('focus', () => {
        if (focusTimer && (Date.now() - focusTimer) > 5 * 60 * 1000) {
            analytics.logEvent('user_returned', {
                awayDuration: Math.floor((Date.now() - focusTimer) / 1000)
            });
        }
    });
});
