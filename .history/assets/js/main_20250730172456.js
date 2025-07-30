// ===== CRISTIANE JUSTINO FOTOGRAFIA - JAVASCRIPT ELEGANTE =====

// Variáveis globais
let selectedDate = null;
let portfolioItems = [];
let currentFilter = 'todos';

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Esconder loading após carregamento
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }, 1000);

    // Inicializar todas as funcionalidades
    initMobileMenu();
    initPortfolio();
    initCalendar();
    initFormValidation();
    initSmoothScrolling();
    initAnimations();
    initContactForm();
    initModal();
    initFloatingElements();
    initTypewriter();
    initHeaderScroll();
});

// ===== MENU MOBILE ELEGANTE =====
function initMobileMenu() {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    // Adicionar botão mobile apenas em telas pequenas
    function updateMobileMenu() {
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-menu-btn')) {
                navbar.appendChild(mobileMenuBtn);
                navLinks.style.display = 'none';
            }
        } else {
            const existingBtn = document.querySelector('.mobile-menu-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            navLinks.style.display = 'flex';
        }
    }
    
    updateMobileMenu();
    window.addEventListener('resize', updateMobileMenu);
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        mobileMenuBtn.innerHTML = navLinks.style.display === 'flex' ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
}

// ===== PORTFÓLIO ELEGANTE =====
function initPortfolio() {
    // Carregar imagens dinamicamente
    loadPortfolioImages();
    
    // Configurar filtros
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            filterPortfolio(category);
            
            // Atualizar botão ativo
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function loadPortfolioImages() {
    // Simular carregamento de imagens do portfólio
    const categories = [
        'ensaio-feminino', 'ensaio-feminino', 'ensaio-feminino',
        'casamento', 'casamento', 'casamento',
        'retrato', 'retrato', 'retrato',
        'evento', 'evento', 'evento'
    ];
    
    portfolioItems = [];
    
    for (let i = 1; i <= 35; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        portfolioItems.push({
            id: i,
            src: `assets/image/foto_${String(i).padStart(2, '0')}.jpg`,
            category: category,
            title: `Fotografia ${i}`,
            description: `Descrição da fotografia ${i}`
        });
    }
    
    renderPortfolio(portfolioItems);
}

function renderPortfolio(items) {
    const grid = document.getElementById('portfolio-grid');
    grid.innerHTML = '';
    
    items.forEach((item, index) => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.style.animationDelay = `${index * 0.1}s`;
        
        portfolioItem.innerHTML = `
            <img src="${item.src}" alt="${item.title}" loading="lazy">
            <div class="portfolio-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        `;
        
        portfolioItem.addEventListener('click', () => openPortfolioModal(item));
        grid.appendChild(portfolioItem);
    });
}

function filterPortfolio(category) {
    currentFilter = category;
    const filteredItems = category === 'todos' ? 
        portfolioItems : 
        portfolioItems.filter(item => item.category === category);
    
    renderPortfolio(filteredItems);
}

function openPortfolioModal(item) {
    const modal = document.getElementById('portfolio-modal');
    const modalImage = document.getElementById('modal-image');
    
    modalImage.src = item.src;
    modalImage.alt = item.title;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Adicionar animação de entrada
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// ===== CALENDÁRIO ELEGANTE COM FIREBASE =====
async function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) return;
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês'
        },
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        events: [], // Será carregado do Firebase
        select: function(arg) {
            handleDateSelection(arg.startStr);
        },
        eventClick: function(info) {
            handleEventClick(info);
        },
        dateClick: function(info) {
            handleDateClick(info.dateStr);
        },
        loading: function(isLoading) {
            if (isLoading) {
                showNotification('Carregando agendamentos...', 'info');
            }
        },
        // Configurações para dias disponíveis/indisponíveis
        dayCellDidMount: function(arg) {
            const date = arg.date;
            const dayOfWeek = date.getDay(); // 0 = Domingo, 3 = Quarta, 6 = Sábado
            
            // Verificar se é um dia de atendimento (Quarta, Sábado, Domingo)
            const isAvailableDay = dayOfWeek === 3 || dayOfWeek === 6 || dayOfWeek === 0;
            
            if (!isAvailableDay) {
                // Dias não disponíveis ficam com fundo cinza
                arg.el.style.backgroundColor = '#f5f5f5';
                arg.el.style.color = '#999';
                arg.el.style.cursor = 'not-allowed';
            } else {
                // Dias disponíveis ficam com fundo verde claro
                arg.el.style.backgroundColor = '#e8f5e8';
                arg.el.style.cursor = 'pointer';
            }
        },
        // Impedir seleção de dias não disponíveis
        dateClick: function(info) {
            console.log('=== FULLCALENDAR dateClick ===');
            console.log('Info completa:', info);
            console.log('Data clicada (info.date):', info.date);
            console.log('Data como string (info.dateStr):', info.dateStr);
            
            // Usar a mesma lógica de criação de data para evitar problemas de timezone
            const dateStr = info.dateStr;
            const [year, month, day] = dateStr.split('-').map(Number);
            const clickedDate = new Date(year, month - 1, day);
            const dayOfWeek = clickedDate.getDay();
            const isAvailableDay = dayOfWeek === 3 || dayOfWeek === 6 || dayOfWeek === 0;
            
            console.log('Dia da semana:', dayOfWeek);
            console.log('É dia de atendimento:', isAvailableDay);
            
            if (!isAvailableDay) {
                console.log('Dia não disponível - mostrando aviso');
                showNotification('Atendimento apenas às quartas-feiras, sábados e domingos', 'warning');
                return;
            }
            
            console.log('Chamando handleDateClick com:', info.dateStr);
            handleDateClick(info.dateStr);
        }
    });
    
    calendar.render();
    
    // Carregar agendamentos do Firebase
    try {
        const appointments = await FirebaseAppointment.loadAppointments();
        calendar.addEventSource(appointments);
        
        // Configurar listener em tempo real
        FirebaseAppointment.setupRealtimeListener(calendar);
        
        showNotification('Calendário carregado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        showNotification('Erro ao carregar agendamentos. Tente novamente.', 'error');
    }
}

function getSampleEvents() {
    // Datas ocupadas de exemplo
    const today = new Date();
    const events = [];
    
    // Adicionar alguns eventos de exemplo
    for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + (i * 3));
        
        events.push({
            title: 'Sessão Agendada',
            start: date.toISOString().split('T')[0],
            backgroundColor: '#6C1847',
            borderColor: '#B4457A',
            textColor: '#FFFFFF'
        });
    }
    
    return events;
}

function handleDateSelection(dateStr) {
    selectedDate = dateStr;
    document.getElementById('date').value = formatDate(dateStr);
    
    // Adicionar feedback visual
    showNotification('Data selecionada: ' + formatDate(dateStr), 'success');
}

async function handleDateClick(dateStr) {
    console.log('=== INÍCIO handleDateClick ===');
    console.log('Data clicada (dateStr):', dateStr);
    console.log('Tipo de dateStr:', typeof dateStr);
    
    const today = new Date();
    
    // Criar a data corretamente para o timezone local
    // Dividir a string da data (YYYY-MM-DD) e criar a data no timezone local
    const [year, month, day] = dateStr.split('-').map(Number);
    const clickedDate = new Date(year, month - 1, day); // month - 1 porque getMonth() retorna 0-11
    
    console.log('Data de hoje:', today);
    console.log('Data clicada (objeto Date):', clickedDate);
    console.log('Componentes da data:', { year, month, day });
    
    if (clickedDate < today) {
        showNotification('Não é possível selecionar datas passadas', 'error');
        return;
    }
    
    // Verificar se é um dia de atendimento
    const dayOfWeek = clickedDate.getDay();
    const isAvailableDay = dayOfWeek === 3 || dayOfWeek === 6 || dayOfWeek === 0;
    
    console.log('Dia da semana:', dayOfWeek);
    console.log('É dia de atendimento:', isAvailableDay);
    
    if (!isAvailableDay) {
        showNotification('Atendimento apenas às quartas-feiras, sábados e domingos', 'warning');
        return;
    }
    
    // Definir a data imediatamente
    selectedDate = dateStr;
    console.log('selectedDate definido como:', selectedDate);
    
    const dateInput = document.getElementById('date');
    console.log('Input de data encontrado:', dateInput);
    console.log('Valor atual do input:', dateInput ? dateInput.value : 'N/A');
    
    if (!dateInput) {
        console.error('Input de data não encontrado!');
        showNotification('Erro: Campo de data não encontrado', 'error');
        return;
    }
    
    const formattedDate = formatDate(dateStr);
    console.log('Data formatada para input:', formattedDate);
    
    // Definir o valor do input
    dateInput.value = formattedDate;
    console.log('Valor do input após definição:', dateInput.value);
    
    // Forçar atualização do DOM
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('=== FIM handleDateClick ===');
    
    // Verificar disponibilidade no Firebase
    try {
        console.log('Verificando disponibilidade para:', clickedDate);
        const isAvailable = await FirebaseAppointment.checkAvailability(clickedDate);
        console.log('Disponibilidade:', isAvailable);
        
        if (!isAvailable) {
            showNotification('Esta data já está ocupada. Escolha outra data.', 'warning');
            // Limpar a data se não estiver disponível
            selectedDate = null;
            dateInput.value = '';
            return;
        }
        
        showNotification('Data disponível selecionada!', 'success');
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        showNotification('Data selecionada! (Verificação de disponibilidade indisponível)', 'info');
    }
}

function handleEventClick(info) {
    showNotification('Esta data já está ocupada. Escolha outra data.', 'warning');
}

function formatDate(dateStr) {
    console.log('=== INÍCIO formatDate ===');
    console.log('Data recebida (dateStr):', dateStr);
    console.log('Tipo de dateStr:', typeof dateStr);
    
    // Garantir que dateStr seja uma string válida
    if (!dateStr) {
        console.error('dateStr é vazio ou undefined');
        return '';
    }
    
    // Se já estiver no formato DD/MM/YYYY, retornar como está
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        console.log('Data já está no formato correto:', dateStr);
        return dateStr;
    }
    
    // Criar a data corretamente para o timezone local
    let date;
    if (dateStr.includes('-')) {
        // Formato YYYY-MM-DD
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        // Outros formatos
        date = new Date(dateStr);
    }
    
    console.log('Data criada (objeto Date):', date);
    console.log('Data é válida:', !isNaN(date.getTime()));
    
    if (isNaN(date.getTime())) {
        console.error('Data inválida criada a partir de:', dateStr);
        return '';
    }
    
    // Garantir que a data seja formatada corretamente
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;
    console.log('Data formatada final:', formattedDate);
    console.log('=== FIM formatDate ===');
    return formattedDate;
}

// ===== VALIDAÇÃO DE FORMULÁRIO ELEGANTE =====
function initFormValidation() {
    const bookingForm = document.getElementById('booking-form');
    const contactForm = document.getElementById('contact-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
        setupFormValidation(bookingForm);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        setupFormValidation(contactForm);
    }
}

function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remover classes de erro anteriores
    field.classList.remove('error', 'success');
    
    // Validações específicas
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'E-mail inválido';
            }
            break;
            
        case 'tel':
            const phoneRegex = /^[\d\s\-\(\)\+]+$/;
            if (value && !phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Telefone inválido';
            }
            break;
            
        default:
            if (field.required && !value) {
                isValid = false;
                errorMessage = 'Este campo é obrigatório';
            }
    }
    
    // Aplicar resultado da validação
    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    } else if (value) {
        field.classList.add('success');
    }
    
    return isValid;
}

function showFieldError(field, message) {
    // Remover mensagem de erro anterior
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#FF6B6B';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// ===== HANDLERS DE FORMULÁRIO COM FIREBASE =====
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!validateForm(e.target)) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    if (!selectedDate) {
        showNotification('Por favor, selecione uma data no calendário', 'error');
        return;
    }
    
    // Verificar disponibilidade novamente antes de enviar
    try {
        // Criar a data corretamente para o timezone local
        let checkDate;
        if (selectedDate.includes('-')) {
            const [year, month, day] = selectedDate.split('-').map(Number);
            checkDate = new Date(year, month - 1, day);
        } else {
            checkDate = new Date(selectedDate);
        }
        const isAvailable = await FirebaseAppointment.checkAvailability(checkDate);
        
        if (!isAvailable) {
            showNotification('Esta data não está mais disponível. Escolha outra data.', 'error');
            return;
        }
        
        // Preparar dados do agendamento
        const formData = new FormData(e.target);
        const appointmentData = {
            clientName: formData.get('name'),
            clientEmail: formData.get('email'),
            clientPhone: formData.get('phone'),
            serviceType: formData.get('service'),
            date: selectedDate,
            message: formData.get('message') || ''
        };
        
        // Mostrar loading
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Salvar no Firebase
        const result = await FirebaseAppointment.createAppointment(appointmentData);
        
        if (result.success) {
            showNotification('Agendamento enviado com sucesso! Entraremos em contato em breve.', 'success');
            e.target.reset();
            selectedDate = null;
            document.getElementById('date').value = '';
            
            // Track do evento
            trackEvent('Agendamento', 'Submit', appointmentData.serviceType);
        } else {
            showNotification('Erro ao enviar agendamento. Tente novamente.', 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Erro ao processar agendamento:', error);
        showNotification('Erro ao processar agendamento. Tente novamente.', 'error');
        
        const submitBtn = e.target.querySelector('.submit-btn');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    if (!validateForm(e.target)) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Simular envio
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
        e.target.reset();
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// ===== FORMULÁRIO DE CONTATO =====
function initContactForm() {
    // Adicionar funcionalidade de formatação de telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    input.value = value;
}

// ===== MODAL ELEGANTE =====
function initModal() {
    const modal = document.getElementById('portfolio-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('portfolio-modal');
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// ===== SCROLL SUAVE =====
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== ANIMAÇÕES ELEGANTES =====
function initAnimations() {
    // Intersection Observer para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.about-text, .about-image, .contact-info, .contact-form');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== ELEMENTOS FLUTUANTES =====
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 2}s`;
    });
}

// ===== NOTIFICAÇÕES ELEGANTES =====
function showNotification(message, type = 'info') {
    // Remover notificação anterior
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #28a745, #20c997)',
        error: 'linear-gradient(135deg, #dc3545, #e74c3c)',
        warning: 'linear-gradient(135deg, #ffc107, #f39c12)',
        info: 'linear-gradient(135deg, #6C1847, #B4457A)'
    };
    return colors[type] || colors.info;
}

// ===== HEADER SCROLL ELEGANTE =====
function initHeaderScroll() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ===== EFEITO TYPEWRITER ELEGANTE =====
function initTypewriter() {
    const typewriterText = document.querySelector('.typewriter-text');
    const cursor = document.querySelector('.cursor');
    
    if (!typewriterText || !cursor) return;
    
    const text = typewriterText.textContent;
    typewriterText.textContent = '';
    
    let currentIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeWriter() {
        if (isDeleting) {
            // Apagando texto
            typewriterText.textContent = text.substring(0, currentIndex - 1);
            currentIndex--;
            typingSpeed = 50;
        } else {
            // Digitando texto
            typewriterText.textContent = text.substring(0, currentIndex + 1);
            currentIndex++;
            typingSpeed = 100;
        }
        
        // Verificar se terminou de digitar
        if (!isDeleting && currentIndex === text.length) {
            // Pausa antes de começar a apagar
            setTimeout(() => {
                isDeleting = true;
            }, 2000);
        }
        
        // Verificar se terminou de apagar
        if (isDeleting && currentIndex === 0) {
            isDeleting = false;
            // Pausa antes de começar a digitar novamente
            setTimeout(() => {
                typeWriter();
            }, 1000);
            return;
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
    
    // Iniciar o efeito após um pequeno delay
    setTimeout(typeWriter, 1000);
}

// ===== UTILITÁRIOS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== SERVICE WORKER (OPCIONAL) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== PERFORMANCE E OTIMIZAÇÃO =====
// Lazy loading para imagens
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
});

// ===== ACESSIBILIDADE =====
// Navegação por teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// ===== ANALYTICS (OPCIONAL) =====
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// ===== FUNÇÃO DE TESTE TEMPORÁRIA =====
function testDateInput() {
    console.log('=== TESTE DE INPUT DE DATA ===');
    
    const dateInput = document.getElementById('date');
    console.log('Input encontrado:', dateInput);
    console.log('Valor atual:', dateInput ? dateInput.value : 'N/A');
    
    if (!dateInput) {
        console.error('Input não encontrado!');
        alert('Erro: Input de data não encontrado!');
        return;
    }
    
    // Testar com data específica
    const testDate = '2025-08-01';
    const formattedDate = formatDate(testDate);
    
    console.log('Data de teste:', testDate);
    console.log('Data formatada:', formattedDate);
    
    // Definir o valor
    dateInput.value = formattedDate;
    
    console.log('Valor após definição:', dateInput.value);
    
    // Forçar eventos
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('Valor após eventos:', dateInput.value);
    
    alert(`Teste concluído!\nData definida: ${formattedDate}\nValor do input: ${dateInput.value}`);
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', () => {
    // Marcar como carregado
    document.body.classList.add('loaded');
    
    // Track page view
    trackEvent('engagement', 'page_view', window.location.pathname);
}); 