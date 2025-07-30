// Main JavaScript for Cristiane Justino Photography Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initPortfolio();
    initCalendar();
    initFormValidation();
    initSmoothScrolling();
    initAnimations();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.add('mobile-menu-enter');
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// Portfolio Functionality
function initPortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Portfolio data with categories
    const portfolioData = [
        { id: 1, image: 'assets/image/foto_01.jpg', category: 'ensaio', title: 'Ensaio Feminino' },
        { id: 2, image: 'assets/image/foto_02.jpg', category: 'evento', title: 'Casamento' },
        { id: 3, image: 'assets/image/foto_03.jpg', category: 'retrato', title: 'Retrato Profissional' },
        { id: 4, image: 'assets/image/foto_04.jpg', category: 'ensaio', title: 'Ensaio Gestante' },
        { id: 5, image: 'assets/image/foto_05.jpg', category: 'evento', title: 'Debutante' },
        { id: 6, image: 'assets/image/foto_06.jpg', category: 'retrato', title: 'Retrato Familiar' },
        { id: 7, image: 'assets/image/foto_07.jpg', category: 'ensaio', title: 'Ensaio Masculino' },
        { id: 8, image: 'assets/image/foto_08.jpg', category: 'evento', title: 'Aniversário' },
        { id: 9, image: 'assets/image/foto_09.jpg', category: 'retrato', title: 'Retrato Infantil' },
        { id: 10, image: 'assets/image/foto_10.jpg', category: 'ensaio', title: 'Ensaio Casal' },
        { id: 11, image: 'assets/image/foto_11.jpg', category: 'evento', title: 'Corporativo' },
        { id: 12, image: 'assets/image/foto_12.jpg', category: 'retrato', title: 'Retrato Artístico' },
        { id: 13, image: 'assets/image/foto_13.jpg', category: 'ensaio', title: 'Ensaio Boudoir' },
        { id: 14, image: 'assets/image/foto_14.jpg', category: 'evento', title: 'Formatura' },
        { id: 15, image: 'assets/image/foto_15.jpg', category: 'retrato', title: 'Retrato Empresarial' },
        { id: 16, image: 'assets/image/foto_16.jpg', category: 'ensaio', title: 'Ensaio Newborn' },
        { id: 17, image: 'assets/image/foto_17.jpg', category: 'evento', title: 'Batizado' },
        { id: 18, image: 'assets/image/foto_18.jpg', category: 'retrato', title: 'Retrato Criativo' },
        { id: 19, image: 'assets/image/foto_19.jpg', category: 'ensaio', title: 'Ensaio Teen' },
        { id: 20, image: 'assets/image/foto_20.jpg', category: 'evento', title: 'Conferência' },
        { id: 21, image: 'assets/image/foto_21.jpg', category: 'retrato', title: 'Retrato Editorial' },
        { id: 22, image: 'assets/image/foto_22.jpg', category: 'ensaio', title: 'Ensaio Maternidade' },
        { id: 23, image: 'assets/image/foto_23.jpg', category: 'evento', title: 'Workshop' },
        { id: 24, image: 'assets/image/foto_24.jpg', category: 'retrato', title: 'Retrato Documental' },
        { id: 25, image: 'assets/image/foto_25.jpg', category: 'ensaio', title: 'Ensaio Senhor' },
        { id: 26, image: 'assets/image/foto_26.jpg', category: 'evento', title: 'Seminário' },
        { id: 27, image: 'assets/image/foto_27.jpg', category: 'retrato', title: 'Retrato Conceitual' },
        { id: 28, image: 'assets/image/foto_28.jpg', category: 'ensaio', title: 'Ensaio Família' },
        { id: 29, image: 'assets/image/foto_29.jpg', category: 'evento', title: 'Convenção' },
        { id: 30, image: 'assets/image/foto_30.jpg', category: 'retrato', title: 'Retrato Ambiental' },
        { id: 31, image: 'assets/image/foto_31.jpg', category: 'ensaio', title: 'Ensaio Pet' },
        { id: 32, image: 'assets/image/foto_32.jpg', category: 'evento', title: 'Lançamento' },
        { id: 33, image: 'assets/image/foto_33.jpg', category: 'retrato', title: 'Retrato Urbano' },
        { id: 34, image: 'assets/image/foto_34.jpg', category: 'ensaio', title: 'Ensaio Vintage' },
        { id: 35, image: 'assets/image/foto_35.jpg', category: 'evento', title: 'Exposição' },
        { id: 36, image: 'assets/image/foto_36.jpg', category: 'retrato', title: 'Retrato Minimalista' },
        { id: 37, image: 'assets/image/foto_37.jpg', category: 'ensaio', title: 'Ensaio Glamour' },
        { id: 38, image: 'assets/image/foto_38.jpg', category: 'evento', title: 'Premiação' },
        { id: 39, image: 'assets/image/foto_39.jpg', category: 'retrato', title: 'Retrato Dramático' },
        { id: 40, image: 'assets/image/foto_40.jpg', category: 'ensaio', title: 'Ensaio Natureza' },
        { id: 41, image: 'assets/image/foto_41.jpg', category: 'evento', title: 'Conferência' },
        { id: 42, image: 'assets/image/foto_42.jpg', category: 'retrato', title: 'Retrato Clássico' },
        { id: 43, image: 'assets/image/foto_43.jpg', category: 'ensaio', title: 'Ensaio Contemporâneo' }
    ];
    
    // Render portfolio items
    function renderPortfolio(items) {
        if (!portfolioGrid) return;
        
        portfolioGrid.innerHTML = '';
        
        items.forEach((item, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item portfolio-grid-item';
            portfolioItem.style.animationDelay = `${index * 0.1}s`;
            
            portfolioItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="portfolio-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            `;
            
            // Add click event for modal
            portfolioItem.addEventListener('click', function() {
                openPortfolioModal(item);
            });
            
            portfolioGrid.appendChild(portfolioItem);
        });
    }
    
    // Filter functionality
    function filterPortfolio(category) {
        const filteredItems = category === 'all' 
            ? portfolioData 
            : portfolioData.filter(item => item.category === category);
        
        renderPortfolio(filteredItems);
    }
    
    // Add filter button events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterPortfolio(filter);
        });
    });
    
    // Initialize with all items
    renderPortfolio(portfolioData);
}

// Portfolio Modal
function openPortfolioModal(item) {
    const modal = document.getElementById('portfolio-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('close-modal');
    
    if (modal && modalImage && modalTitle) {
        modalImage.src = item.image;
        modalImage.alt = item.title;
        modalTitle.textContent = item.title;
        modal.classList.remove('hidden');
        
        // Close modal functionality
        closeModal.addEventListener('click', function() {
            modal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }
}

// Calendar Functionality
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    const dataInput = document.getElementById('data');
    
    if (!calendarEl) return;
    
    // Sample booked dates (in real app, this would come from backend)
    const bookedDates = [
        '2024-12-25',
        '2024-12-26',
        '2024-12-31',
        '2025-01-01',
        '2025-01-15',
        '2025-01-20',
        '2025-02-14',
        '2025-02-15'
    ];
    
    // Create events for booked dates
    const events = bookedDates.map(date => ({
        title: 'Ocupado',
        start: date,
        backgroundColor: '#FF0000',
        borderColor: '#FF0000',
        textColor: '#FFFFFF',
        display: 'background'
    }));
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        events: events,
        selectable: true,
        selectConstraint: {
            start: new Date(),
            end: '2025-12-31'
        },
        select: function(info) {
            const selectedDate = info.startStr;
            
            // Check if date is booked
            if (bookedDates.includes(selectedDate)) {
                alert('Esta data já está ocupada. Por favor, escolha outra data.');
                return;
            }
            
            // Format date for display
            const date = new Date(selectedDate);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (dataInput) {
                dataInput.value = formattedDate;
            }
        },
        dayCellDidMount: function(arg) {
            const date = arg.date;
            const dateStr = date.toISOString().split('T')[0];
            
            // Disable past dates
            if (date < new Date()) {
                arg.el.style.backgroundColor = '#f8f9fa';
                arg.el.style.cursor = 'not-allowed';
            }
            
            // Mark booked dates
            if (bookedDates.includes(dateStr)) {
                arg.el.style.backgroundColor = '#FF0000';
                arg.el.style.color = '#FFFFFF';
                arg.el.style.cursor = 'not-allowed';
            }
        },
        height: 'auto',
        aspectRatio: 1.35
    });
    
    calendar.render();
}

// Form Validation and Submission
function initFormValidation() {
    const form = document.getElementById('agendamento-form');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModal = document.getElementById('close-success-modal');
    
    if (!form) return;
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Show success modal
                if (successModal) {
                    successModal.classList.remove('hidden');
                }
                
                // Reset form
                form.reset();
                
                // Clear selected date
                const dataInput = document.getElementById('data');
                if (dataInput) {
                    dataInput.value = '';
                }
            }, 2000);
        }
    });
    
    // Close success modal
    if (closeSuccessModal && successModal) {
        closeSuccessModal.addEventListener('click', function() {
            successModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.classList.add('hidden');
            }
        });
    }
}

// Field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error', 'success');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Validation rules
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, insira um e-mail válido.';
            }
            break;
            
        case 'tel':
            const phoneRegex = /^[\d\s\-\(\)\+]+$/;
            if (value.length < 10 || !phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, insira um telefone válido.';
            }
            break;
            
        case 'text':
            if (field.id === 'nome' && value.length < 3) {
                isValid = false;
                errorMessage = 'O nome deve ter pelo menos 3 caracteres.';
            }
            break;
            
        default:
            if (field.required && !value) {
                isValid = false;
                errorMessage = 'Este campo é obrigatório.';
            }
    }
    
    // Apply styling
    if (isValid && value) {
        field.classList.add('success');
    } else if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// Form validation
function validateForm() {
    const form = document.getElementById('agendamento-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animations and effects
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button, .hover-lift');
    buttons.forEach(button => {
        button.classList.add('hover-lift');
    });
}

// Utility functions
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = value;
}

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('telefone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 