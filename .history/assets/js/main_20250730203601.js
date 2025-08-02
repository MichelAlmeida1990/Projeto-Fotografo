// ===== CRISTIANE JUSTINO FOTOGRAFIA - JAVASCRIPT ELEGANTE =====

// Variáveis globais
let selectedDate = null;
let portfolioItems = [];
let currentFilter = 'todos';
let calendar = null; // Variável global para o calendário

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Esconder loading screen após carregamento
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 800);
        }
    }, 3000); // Aumentei para 3 segundos para apreciar o loading

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
    initAdminAuth();
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
    
    calendar = new FullCalendar.Calendar(calendarEl, {
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
        dayMaxEvents: false, // Mostrar todos os eventos
        weekends: true,
        events: [], // Será carregado do Firebase
        eventDisplay: 'block', // Mostrar eventos como blocos
        eventDidMount: function(info) {
            // Adicionar tooltip com informações do cliente
            const event = info.event;
            const clientName = event.extendedProps.clientName;
            const serviceType = event.extendedProps.serviceType;
            
            if (clientName) {
                info.el.title = `Cliente: ${clientName}\nServiço: ${serviceType}`;
            }
        },
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
    
    // Configurar listener em tempo real (que também carrega eventos existentes)
    try {
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
    const event = info.event;
    const clientName = event.extendedProps.clientName;
    const serviceType = event.extendedProps.serviceType;
    const clientEmail = event.extendedProps.clientEmail;
    const clientPhone = event.extendedProps.clientPhone;
    
    // Criar modal de confirmação para exclusão
    const confirmMessage = `
        <div style="text-align: center; padding: 20px;">
            <h3 style="color: #B4457A; margin-bottom: 15px;">🗑️ Excluir Agendamento</h3>
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Serviço:</strong> ${serviceType}</p>
            <p><strong>Data:</strong> ${formatDate(event.startStr)}</p>
            <p><strong>E-mail:</strong> ${clientEmail}</p>
            <p><strong>Telefone:</strong> ${clientPhone}</p>
            <br>
            <p style="color: #ff6b6b; font-weight: bold;">⚠️ Tem certeza que deseja excluir este agendamento?</p>
        </div>
    `;
    
    // Mostrar modal de confirmação
    showConfirmModal(confirmMessage, () => {
        // Função de confirmação - excluir agendamento
        deleteAppointment(event.id, event.startStr);
    });
}

// Função para excluir agendamento (apenas administradores)
async function deleteAppointment(appointmentId, dateStr) {
    try {
        console.log('=== VERIFICANDO PERMISSÃO PARA EXCLUIR AGENDAMENTO ===');
        
        // Verificar se o usuário está autenticado como administrador
        const isAdmin = await FirebaseAuth.isAdminAuthenticated();
        
        if (!isAdmin) {
            showNotification('🔒 Acesso negado. Apenas administradores podem excluir agendamentos.', 'error');
            showAdminLoginModal();
            return;
        }
        
        console.log('=== EXCLUINDO AGENDAMENTO ===');
        console.log('ID:', appointmentId);
        console.log('Data:', dateStr);
        
        // Chamar função do Firebase para excluir (versão protegida)
        const result = await FirebaseAuth.cancelAppointmentAsAdmin(appointmentId, dateStr);
        
        if (result.success) {
            showNotification('✅ Agendamento excluído com sucesso!', 'success');
            
            // Remover evento do calendário
            const event = calendar.getEventById(appointmentId);
            if (event) {
                event.remove();
            }
        } else {
            showNotification('❌ Erro ao excluir agendamento. Tente novamente.', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        showNotification(`❌ Erro: ${error.message}`, 'error');
    }
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

// Modal de confirmação para exclusão
function showConfirmModal(message, onConfirm) {
    // Criar modal de confirmação
    const modal = document.createElement('div');
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `
        <div class="confirm-modal-content">
            <div class="confirm-modal-header">
                <h3>Confirmação</h3>
                <button class="confirm-modal-close">&times;</button>
            </div>
            <div class="confirm-modal-body">
                ${message}
            </div>
            <div class="confirm-modal-footer">
                <button class="confirm-btn cancel-btn">Cancelar</button>
                <button class="confirm-btn delete-btn">Excluir</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const closeBtn = modal.querySelector('.confirm-modal-close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const deleteBtn = modal.querySelector('.delete-btn');
    
    const closeModal = () => {
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    deleteBtn.addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Modal de login para administradores
function showAdminLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-login-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 40px;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        ">
            <h3 style="color: #B4457A; margin-bottom: 20px; font-size: 24px;">
                🔐 Login Administrativo
            </h3>
            <p style="color: #666; margin-bottom: 25px; font-size: 14px;">
                Apenas administradores podem excluir agendamentos.
            </p>
            
            <form id="admin-login-form" style="text-align: left;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                        E-mail:
                    </label>
                    <input type="email" id="admin-email" required style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        transition: border-color 0.3s ease;
                    " placeholder="seu@email.com">
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600;">
                        Senha:
                    </label>
                    <input type="password" id="admin-password" required style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        transition: border-color 0.3s ease;
                    " placeholder="Sua senha">
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button type="button" class="btn-cancel" style="
                        padding: 12px 25px;
                        border: 2px solid #ddd;
                        background: white;
                        color: #666;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">Cancelar</button>
                    <button type="submit" class="btn-login" style="
                        padding: 12px 25px;
                        border: none;
                        background: #B4457A;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">Entrar</button>
                </div>
            </form>
            
            <div id="login-status" style="margin-top: 15px; font-size: 14px;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
    
    // Event listeners
    const closeModal = () => {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };
    
    modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle form submission
    const form = modal.querySelector('#admin-login-form');
    const statusDiv = modal.querySelector('#login-status');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        // Disable form during login
        const submitBtn = form.querySelector('.btn-login');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;
        statusDiv.textContent = '';
        
        try {
            const result = await FirebaseAuth.adminLogin(email, password);
            
            if (result.success) {
                statusDiv.textContent = '✅ Login realizado com sucesso!';
                statusDiv.style.color = '#28a745';
                
                setTimeout(() => {
                    closeModal();
                    showNotification('🔓 Login administrativo realizado com sucesso!', 'success');
                }, 1500);
            } else {
                statusDiv.textContent = `❌ ${result.error}`;
                statusDiv.style.color = '#dc3545';
            }
        } catch (error) {
            statusDiv.textContent = `❌ Erro: ${error.message}`;
            statusDiv.style.color = '#dc3545';
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
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

// ===== SISTEMA DE AUTENTICAÇÃO DE ADMINISTRADORES =====
function initAdminAuth() {
    // Verificar estado de autenticação ao carregar a página
    checkAdminAuthState();
    
    // Configurar listener para mudanças no estado de autenticação
    firebase.auth().onAuthStateChanged(async (user) => {
        await checkAdminAuthState();
    });
    
    // Configurar botão de logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleAdminLogout();
        });
    }
}

// Verificar estado de autenticação e atualizar interface
async function checkAdminAuthState() {
    try {
        const isAdmin = await FirebaseAuth.isAdminAuthenticated();
        updateAdminUI(isAdmin);
    } catch (error) {
        console.error('Erro ao verificar estado de autenticação:', error);
        updateAdminUI(false);
    }
}

// Atualizar interface baseada no estado de autenticação
function updateAdminUI(isAdmin) {
    const logoutItem = document.getElementById('admin-logout-item');
    const logoutBtn = document.getElementById('admin-logout-btn');
    
    if (logoutItem && logoutBtn) {
        if (isAdmin) {
            logoutItem.style.display = 'block';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        } else {
            logoutItem.style.display = 'none';
        }
    }
}

// Função para fazer logout
async function handleAdminLogout() {
    try {
        const result = await FirebaseAuth.adminLogout();
        
        if (result.success) {
            showNotification('🔓 Logout realizado com sucesso!', 'success');
            updateAdminUI(false);
        } else {
            showNotification('❌ Erro ao fazer logout', 'error');
        }
    } catch (error) {
        console.error('Erro no logout:', error);
        showNotification('❌ Erro ao fazer logout', 'error');
    }
} 