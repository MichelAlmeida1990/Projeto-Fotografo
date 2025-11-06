// ===== CRISTIANE JUSTINO FOTOGRAFIA - JAVASCRIPT ELEGANTE =====

// Variáveis globais
let selectedDate = null;
let portfolioItems = [];
let currentFilter = 'todos';
let calendar = null; // Variável global para o calendário

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

// Função para encontrar duplicatas no portfolio
function findDuplicates(items) {
    const seen = new Set();
    const duplicates = [];
    
    items.forEach((item, index) => {
        const key = `${item.src}-${item.title}`;
        if (seen.has(key)) {
            duplicates.push({
                index,
                item,
                key
            });
        } else {
            seen.add(key);
        }
    });
    
    return duplicates;
}

// Função para remover duplicatas do portfolio
function removeDuplicates(items) {
    const seen = new Set();
    const uniqueItems = [];
    
    items.forEach((item) => {
        const key = `${item.src}-${item.title}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueItems.push(item);
        } else {
            console.log('Removendo duplicata:', item.title, item.src);
        }
    });
    
    return uniqueItems;
}

// ===== DETECÇÃO iOS =====
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// ===== DETECTAR VERSÃO DO iOS =====
function getIOSVersion() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    
    if (match) {
        return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: match[3] ? parseInt(match[3], 10) : 0
        };
    }
    
    return null;
}

// ===== VERIFICAR SE É iOS 15+ (iPhone 13+ geralmente tem iOS 15+) =====
function isIOS15Plus() {
    const version = getIOSVersion();
    if (version) {
        return version.major >= 15;
    }
    // Se não conseguir detectar, assumir que é iOS mais novo se for iPhone 13 ou mais novo
    const userAgent = navigator.userAgent || '';
    // iPhone 13 foi lançado com iOS 15
    if (/iPhone.*1[3-9]|iPhone.*2[0-9]/.test(userAgent)) {
        return true;
    }
    return false;
}

// ===== CALCULAR ALTURA DINÂMICA DA VIEWPORT (FIX iOS 100vh) =====
function setViewportHeight() {
    try {
        // Calcular altura real da viewport
        const vh = window.innerHeight * 0.01;
        // Definir variável CSS customizada
        if (document.documentElement) {
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            // Também definir altura real para uso direto
            document.documentElement.style.setProperty('--real-height', `${window.innerHeight}px`);
        }
    } catch (e) {
        console.warn('Erro ao calcular altura da viewport:', e);
    }
}

// Ajustar altura quando a viewport mudar (importante para iOS)
function initViewportHeight() {
    try {
        setViewportHeight();
        
        // Recalcular em eventos de resize e orientationchange
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            // Delay para iOS processar a mudança de orientação
            setTimeout(setViewportHeight, 100);
        });
        
        // Recalcular periodicamente no iOS (para mudanças na barra de endereço)
        // Reduzido para evitar problemas de performance
        if (isIOS()) {
            setTimeout(() => {
                setViewportHeight();
            }, 1000);
        }
    } catch (e) {
        console.warn('Erro ao inicializar altura da viewport:', e);
    }
}

// ===== GARANTIR VISIBILIDADE DO CONTEÚDO NO iOS (VERSÃO AGRESSIVA) =====
function ensureContentVisibility() {
    try {
        const body = document.body;
        const html = document.documentElement;
        
        if (!body || !html) return;
        
        // No iOS, ser mais agressivo para garantir visibilidade
        const isIOSDevice = isIOS();
        
        if (isIOSDevice) {
            // FORÇAR visibilidade no iOS
            body.style.display = 'block';
            body.style.opacity = '1';
            body.style.visibility = 'visible';
            body.style.height = 'auto';
            body.style.minHeight = '100%';
            body.style.background = 'var(--dark-primary)';
            body.style.color = 'var(--text-primary)';
            
            html.style.display = 'block';
            html.style.opacity = '1';
            html.style.visibility = 'visible';
            html.style.height = '100%';
            
            // Forçar visibilidade de TODAS as seções principais
            // IMPORTANTE: Não forçar nav-links em mobile (deve ser controlado pelo menu mobile)
            const allSections = document.querySelectorAll('section, header, .hero, main, .navbar');
            allSections.forEach(el => {
                if (el) {
                    el.style.display = '';
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                    // Remover qualquer estilo que possa estar escondendo
                    if (el.style.display === 'none') el.style.display = '';
                    if (el.style.opacity === '0') el.style.opacity = '1';
                    if (el.style.visibility === 'hidden') el.style.visibility = 'visible';
                }
            });
            
            // Garantir que o menu mobile esteja FECHADO por padrão em mobile
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && window.innerWidth <= 768) {
                // Em mobile, o menu deve estar fechado por padrão
                navLinks.style.display = 'none';
                navLinks.classList.remove('active');
                
                // Garantir que o overlay também esteja fechado
                const menuOverlay = document.querySelector('.menu-overlay');
                if (menuOverlay) {
                    menuOverlay.classList.remove('active');
                }
                
                // Garantir que o body não tenha overflow hidden
                document.body.style.overflow = '';
            }
            
            // Garantir que o hero esteja visível
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.display = 'flex';
                hero.style.opacity = '1';
                hero.style.visibility = 'visible';
                hero.style.minHeight = 'calc(var(--vh, 1vh) * 100)';
            }
        } else {
            // Para outros dispositivos, ser menos agressivo
            if (body.style.display === 'none') {
                body.style.display = '';
            }
            if (body.style.opacity === '0') {
                body.style.opacity = '';
            }
            if (body.style.visibility === 'hidden') {
                body.style.visibility = '';
            }
        }
        
        // Garantir que o loading screen não esteja bloqueando
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            if (loadingScreen.classList.contains('hidden') || isIOSDevice) {
                loadingScreen.style.display = 'none';
                loadingScreen.style.visibility = 'hidden';
                loadingScreen.style.opacity = '0';
                loadingScreen.style.pointerEvents = 'none';
                loadingScreen.style.zIndex = '-1';
                loadingScreen.style.position = 'fixed';
                loadingScreen.style.top = '-9999px';
                loadingScreen.style.left = '-9999px';
            }
        }
    } catch (e) {
        console.warn('Erro ao garantir visibilidade do conteúdo:', e);
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Inicializar cálculo de altura da viewport (CRÍTICO para iOS)
        initViewportHeight();
        
        // Garantir visibilidade do conteúdo imediatamente
        ensureContentVisibility();
        
        // Detectar iOS e ajustar timeout
        const isIOSDevice = isIOS();
        const isIOSNewer = isIOS15Plus(); // iPhone 13+ geralmente tem iOS 15+
        const loadingTimeout = isIOSDevice ? 1500 : 3000; // iOS ainda mais rápido
        
        // No iOS mais novo (iPhone 13+), desabilitar backdrop-filter que pode causar tela preta
        if (isIOSNewer) {
            try {
                // Adicionar classe CSS para desabilitar backdrop-filter
                document.documentElement.classList.add('ios-newer');
                
                // Desabilitar backdrop-filter no header via JavaScript
                const header = document.querySelector('header');
                if (header) {
                    // Usar background mais opaco e desabilitar backdrop-filter
                    header.style.background = 'rgba(0, 4, 25, 0.9)';
                    header.style.backdropFilter = 'none';
                    header.style.webkitBackdropFilter = 'none';
                }
            } catch (e) {
                console.warn('Erro ao desabilitar backdrop-filter no iOS mais novo:', e);
            }
        }
        
        // Função para remover completamente o loading screen
        function removeLoadingScreen() {
            try {
                const loadingScreen = document.getElementById('loading-screen');
                
                // No iOS, PRIMEIRO garantir visibilidade do conteúdo, DEPOIS remover loading
                // No iOS mais novo (iPhone 13+), ser ainda mais agressivo
                if (isIOSDevice) {
                    // No iOS mais novo, garantir que backdrop-filter não cause problemas
                    if (isIOSNewer) {
                        const header = document.querySelector('header');
                        if (header) {
                            header.style.background = 'rgba(0, 4, 25, 0.9)';
                            header.style.backdropFilter = 'none';
                            header.style.webkitBackdropFilter = 'none';
                        }
                    }
                    // PASSO 1: Forçar visibilidade do conteúdo ANTES de remover loading
                    ensureContentVisibility();
                    
                    // PASSO 2: Forçar reflow para garantir renderização
                    void document.body.offsetWidth;
                    void document.documentElement.offsetWidth;
                    
                    // PASSO 3: Remover loading screen IMEDIATAMENTE (sem delay)
                    if (loadingScreen) {
                        // Esconder completamente
                        loadingScreen.style.cssText = `
                            display: none !important;
                            visibility: hidden !important;
                            opacity: 0 !important;
                            pointer-events: none !important;
                            z-index: -1 !important;
                            position: fixed !important;
                            top: -9999px !important;
                            left: -9999px !important;
                            width: 0 !important;
                            height: 0 !important;
                        `;
                        
                        // Forçar reflow novamente
                        void document.body.offsetWidth;
                        
                        // Remover do DOM após pequeno delay
                        setTimeout(() => {
                            try {
                                if (loadingScreen && loadingScreen.parentNode) {
                                    loadingScreen.remove();
                                }
                                // Forçar visibilidade novamente após remover
                                ensureContentVisibility();
                                setViewportHeight();
                                
                                // Forçar renderização com requestAnimationFrame
                                requestAnimationFrame(() => {
                                    ensureContentVisibility();
                                    setViewportHeight();
                                    
                                    // Duplo check para garantir
                                    requestAnimationFrame(() => {
                                        ensureContentVisibility();
                                    });
                                });
                            } catch (e) {
                                console.warn('Erro ao remover loading screen do DOM:', e);
                                ensureContentVisibility();
                            }
                        }, 50); // Delay muito curto no iOS
                    } else {
                        // Se não houver loading screen, garantir visibilidade
                        ensureContentVisibility();
                    }
                } else {
                    // Para outros dispositivos, usar transição suave
                    if (loadingScreen) {
                        loadingScreen.classList.add('hidden');
                        setTimeout(() => {
                            try {
                                loadingScreen.style.display = 'none';
                                loadingScreen.style.visibility = 'hidden';
                                loadingScreen.style.opacity = '0';
                                loadingScreen.style.pointerEvents = 'none';
                                ensureContentVisibility();
                            } catch (e) {
                                console.warn('Erro ao esconder loading screen:', e);
                            }
                        }, 800);
                    } else {
                        ensureContentVisibility();
                    }
                }
            } catch (e) {
                console.warn('Erro na função removeLoadingScreen:', e);
                ensureContentVisibility();
            }
        }
        
        // No iOS, remover loading screen MAIS CEDO e garantir visibilidade
        if (isIOSDevice) {
            // Remover loading screen mais cedo no iOS (1 segundo)
            setTimeout(removeLoadingScreen, 1000);
            
            // Backup: garantir visibilidade após 2 segundos
            setTimeout(() => {
                ensureContentVisibility();
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; z-index: -1 !important;';
                    if (loadingScreen.parentNode) {
                        loadingScreen.remove();
                    }
                }
                ensureContentVisibility();
            }, 2000);
        } else {
            // Para outros dispositivos, usar timeout normal
            setTimeout(removeLoadingScreen, loadingTimeout);
        }
        
        // Garantir visibilidade após carregamento completo (backup para iOS)
        window.addEventListener('load', function() {
            try {
                ensureContentVisibility();
                setViewportHeight();
                
                // No iOS, remover loading screen IMEDIATAMENTE após load
                if (isIOSDevice) {
                    // No iOS mais novo, garantir que backdrop-filter não cause problemas
                    if (isIOSNewer) {
                        const header = document.querySelector('header');
                        if (header) {
                            header.style.background = 'rgba(0, 4, 25, 0.9)';
                            header.style.backdropFilter = 'none';
                            header.style.webkitBackdropFilter = 'none';
                        }
                    }
                    
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; z-index: -1 !important; position: fixed !important; top: -9999px !important; left: -9999px !important; width: 0 !important; height: 0 !important;';
                        setTimeout(() => {
                            if (loadingScreen.parentNode) {
                                loadingScreen.remove();
                            }
                            ensureContentVisibility();
                            setViewportHeight();
                            
                            // No iOS mais novo, garantir backdrop-filter desabilitado após remover loading
                            if (isIOSNewer) {
                                const header = document.querySelector('header');
                                if (header) {
                                    header.style.background = 'rgba(0, 4, 25, 0.9)';
                                    header.style.backdropFilter = 'none';
                                    header.style.webkitBackdropFilter = 'none';
                                }
                            }
                        }, 100);
                    }
                }
                
                // Forçar remoção do loading screen se ainda estiver visível após 2 segundos (iOS) ou 3 segundos (outros)
                setTimeout(() => {
                    try {
                        // No iOS mais novo, garantir que backdrop-filter não cause problemas
                        if (isIOSNewer) {
                            const header = document.querySelector('header');
                            if (header) {
                                header.style.background = 'rgba(0, 4, 25, 0.9)';
                                header.style.backdropFilter = 'none';
                                header.style.webkitBackdropFilter = 'none';
                            }
                        }
                        
                        const loadingScreen = document.getElementById('loading-screen');
                        if (loadingScreen) {
                            if (isIOSDevice) {
                                // No iOS, remover completamente
                                loadingScreen.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; z-index: -1 !important;';
                                if (loadingScreen.parentNode) {
                                    loadingScreen.remove();
                                }
                            } else {
                                loadingScreen.classList.add('hidden');
                                loadingScreen.style.display = 'none';
                                loadingScreen.style.visibility = 'hidden';
                                loadingScreen.style.opacity = '0';
                                loadingScreen.style.pointerEvents = 'none';
                            }
                            ensureContentVisibility();
                            setViewportHeight();
                            
                            // No iOS mais novo, garantir backdrop-filter desabilitado após remover loading
                            if (isIOSNewer) {
                                const header = document.querySelector('header');
                                if (header) {
                                    header.style.background = 'rgba(0, 4, 25, 0.9)';
                                    header.style.backdropFilter = 'none';
                                    header.style.webkitBackdropFilter = 'none';
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Erro ao remover loading screen:', e);
                    }
                }, isIOSDevice ? 2000 : 3000);
            } catch (e) {
                console.warn('Erro no evento load:', e);
                ensureContentVisibility();
            }
        });
        
        // No iOS, adicionar listener adicional para garantir visibilidade
        if (isIOSDevice) {
            // Forçar visibilidade após um pequeno delay
            setTimeout(() => {
                ensureContentVisibility();
                setViewportHeight();
                
                // Garantir que o menu mobile esteja fechado
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    navLinks.classList.remove('active');
                }
            }, 500);
            
            // No iOS mais novo, verificar periodicamente se o conteúdo ainda está visível
            if (isIOSNewer) {
                setInterval(() => {
                    const body = document.body;
                    if (body && (body.style.display === 'none' || body.style.opacity === '0' || body.style.visibility === 'hidden')) {
                        ensureContentVisibility();
                    }
                    
                    // Garantir que o menu mobile esteja fechado se estiver em mobile
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks && window.innerWidth <= 768 && navLinks.style.display === 'flex') {
                        navLinks.style.display = 'none';
                        navLinks.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }, 1000);
            }
            
            // Forçar visibilidade quando a página ganha foco
            window.addEventListener('focus', function() {
                ensureContentVisibility();
                
                // Garantir que o menu mobile esteja fechado
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    navLinks.classList.remove('active');
                }
            });
            
            // Forçar visibilidade quando a página fica visível
            document.addEventListener('visibilitychange', function() {
                if (!document.hidden) {
                    ensureContentVisibility();
                    setViewportHeight();
                    
                    // Garantir que o menu mobile esteja fechado
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks && window.innerWidth <= 768) {
                        navLinks.style.display = 'none';
                        navLinks.classList.remove('active');
                    }
                }
            });
        }
    } catch (e) {
        console.error('Erro na inicialização:', e);
        // Fallback básico - garantir que o conteúdo apareça mesmo com erro
        ensureContentVisibility();
    }

    // Inicializar todas as funcionalidades (fora do try-catch para garantir execução)
    try {
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
        initModernCTAButton();
    } catch (e) {
        console.error('Erro ao inicializar funcionalidades:', e);
    }
    
    // Inicializar efeitos fotográficos avançados
    setTimeout(() => {
        initPhotoEffects();
        initScrollAnimations();
        initPhotoParticles();
        
        console.log('Inicializando galerias...');
        console.log('Window width:', window.innerWidth);
        console.log('Portfolio items:', portfolioItems ? portfolioItems.length : 'undefined');
        
        // Inicializar masonry layout apenas em desktop após carregamento
        if (window.innerWidth > 768 && portfolioItems && portfolioItems.length > 0) {
            console.log('Inicializando masonry layout...');
            initMasonryLayout();
        }
        
        // Inicializar galeria mobile se estiver em mobile
        if (window.innerWidth <= 768 && portfolioItems && portfolioItems.length > 0) {
            console.log('Inicializando galeria mobile...');
            initMobileGallery();
        } else {
            console.log('Condições não atendidas para galeria mobile:');
            console.log('- Width <= 768:', window.innerWidth <= 768);
            console.log('- Portfolio items exist:', !!portfolioItems);
            console.log('- Portfolio items length > 0:', portfolioItems ? portfolioItems.length > 0 : false);
        }
        
        // Remover initAdvancedFeatures temporariamente para evitar conflitos
        // initAdvancedFeatures();
    }, 2000);

    // Inicializar sistema de autenticação após um pequeno delay
    setTimeout(() => {
        initAuthSystem();
    }, 500);
    
    // Verificação final para galeria mobile (backup)
    setTimeout(() => {
        if (window.innerWidth <= 768 && portfolioItems && portfolioItems.length > 0) {
            const mobileGallery = document.querySelector('.mobile-gallery-section');
            if (!mobileGallery) {
                console.log('🔄 Verificação final: Criando galeria mobile...');
                initMobileGallery();
            }
        }
    }, 3000);
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
            }
            // GARANTIR que o menu esteja FECHADO em mobile
            if (navLinks) {
                navLinks.style.display = 'none';
                navLinks.classList.remove('active');
            }
            
            // Garantir que o overlay esteja fechado
            const menuOverlay = document.querySelector('.menu-overlay');
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
            
            // Garantir que o body não tenha overflow hidden
            document.body.style.overflow = '';
        } else {
            const existingBtn = document.querySelector('.mobile-menu-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            if (navLinks) {
                navLinks.style.display = 'flex';
                navLinks.classList.remove('active');
            }
        }
    }
    
    // Garantir que o menu esteja fechado ao inicializar
    if (navLinks) {
        navLinks.style.display = window.innerWidth <= 768 ? 'none' : 'flex';
        navLinks.classList.remove('active');
    }
    
    updateMobileMenu();
    window.addEventListener('resize', updateMobileMenu);
    
    // Gerenciar galerias no redimensionamento
    window.addEventListener('resize', debounce(() => {
        const masonrySection = document.querySelector('.masonry-section');
        const mobileGallery = document.querySelector('.mobile-gallery-section');
        
        if (window.innerWidth <= 768) {
            // Remover masonry em mobile
            if (masonrySection) {
                masonrySection.remove();
                console.log('Masonry layout removido para mobile');
            }
            
            // Adicionar galeria mobile se não existir
            if (!mobileGallery && portfolioItems && portfolioItems.length > 0) {
                setTimeout(() => {
                    initMobileGallery();
                }, 300);
            }
        } else {
            // Remover galeria mobile em desktop
            if (mobileGallery) {
                mobileGallery.remove();
                console.log('Galeria mobile removida para desktop');
            }
            
            // Adicionar masonry em desktop se não existir
            if (!masonrySection && portfolioItems && portfolioItems.length > 0) {
                setTimeout(() => {
                    initMasonryLayout();
                }, 300);
            }
        }
    }, 300));
    
    // Criar overlay de fundo
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);
    
    // Função para abrir o menu
    function openMenu() {
        navLinks.style.display = 'flex';
        menuOverlay.classList.add('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        document.body.style.overflow = 'hidden';
    }
    
    // Função para fechar o menu
    function closeMenu() {
        navLinks.style.display = 'none';
        menuOverlay.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
    }
    
    // Toggle do menu
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navLinks.style.display === 'flex') {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Fechar ao clicar no overlay
    menuOverlay.addEventListener('click', () => {
        closeMenu();
    });
    
    // Fechar ao clicar em qualquer link
    navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            setTimeout(() => {
                closeMenu();
            }, 300);
        }
    });
    
    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.style.display === 'flex') {
            closeMenu();
        }
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
    // Mapeamento expandido das imagens com todas as fotos disponíveis
    const portfolioData = [
        // Fotos originais (1-36)
        { id: 1, src: 'assets/image/foto_01.jpg', category: 'aniversario-geral', title: 'Aniversário Infantil', description: 'Celebração de aniversário com tema colorido, decoração festiva e momentos de alegria com família e amigos' },
        { id: 2, src: 'assets/image/foto_02.jpg', category: 'eventos-corporativos', title: 'Evento Corporativo', description: 'Cobertura profissional de evento empresarial com networking, palestras e interação entre participantes' },
        { id: 3, src: 'assets/image/foto_03.jpg', category: 'casamento-civil', title: 'Casamento Civil', description: 'Cerimônia íntima de casamento civil com momentos especiais, troca de alianças e celebração do amor' },
        { id: 4, src: 'assets/image/foto_04.jpg', category: 'ensaio-gestante', title: 'Ensaio Gestante', description: 'Sessão fotográfica para gestantes com iluminação natural, capturando a beleza da maternidade' },
        { id: 5, src: 'assets/image/foto_05.jpg', category: 'ensaio-tematico-infantil', title: 'Ensaio Bebê', description: 'Fotografia de bebê com técnica macro, cenários delicados e captura de momentos únicos' },
        { id: 6, src: 'assets/image/foto_06.jpg', category: 'aniversario-geral', title: 'Festa de Aniversário', description: 'Celebração de aniversário com decoração temática, convidados e momentos de diversão' },
        { id: 7, src: 'assets/image/foto_07.jpg', category: 'book-pessoal', title: 'Ensaio Feminino', description: 'Sessão fotográfica feminina com técnica de retrato profissional e iluminação artística' },
        { id: 8, src: 'assets/image/foto_08.jpg', category: 'eventos-corporativos', title: 'Evento Social', description: 'Cobertura de evento social com momentos de interação, networking e celebração' },
        { id: 9, src: 'assets/image/foto_09.jpg', category: 'casamento-civil', title: 'Casamento Íntimo', description: 'Casamento civil com cerimônia simples e elegante, focando na intimidade do casal' },
        { id: 10, src: 'assets/image/foto_10.jpg', category: 'ensaio-gestante', title: 'Sessão Gestante', description: 'Ensaio fotográfico para gestantes com cenários naturais e técnica de iluminação suave' },
        { id: 11, src: 'assets/image/foto_11.jpg', category: 'ensaio-tematico-infantil', title: 'Fotografia de Bebê', description: 'Sessão fotográfica de bebê com técnica macro, detalhes e cenários delicados' },
        { id: 12, src: 'assets/image/foto_12.jpg', category: 'aniversario-geral', title: 'Aniversário Especial', description: 'Celebração de aniversário com decoração personalizada e momentos especiais' },
        { id: 13, src: 'assets/image/foto_13.jpg', category: 'book-pessoal', title: 'Ensaio Pessoal', description: 'Sessão fotográfica pessoal com técnica de retrato e iluminação profissional' },
        { id: 14, src: 'assets/image/foto_14.jpg', category: 'eventos-corporativos', title: 'Evento Comemorativo', description: 'Cobertura de evento comemorativo com momentos especiais e celebração' },
        { id: 15, src: 'assets/image/foto_15.jpg', category: 'casamento-civil', title: 'Casamento Simples', description: 'Casamento civil com cerimônia descontraída e momentos de alegria' },
        { id: 16, src: 'assets/image/foto_16.jpg', category: 'ensaio-gestante', title: 'Ensaio Maternidade', description: 'Fotografia de gestante com técnica de iluminação natural e cenários artísticos' },
        { id: 17, src: 'assets/image/foto_17.jpg', category: 'ensaio-tematico-infantil', title: 'Sessão Bebê', description: 'Ensaio fotográfico de bebê com cenários delicados e técnica macro' },
        { id: 18, src: 'assets/image/foto_18.jpg', category: 'aniversario-geral', title: 'Festa Infantil', description: 'Aniversário infantil com decoração temática, diversão e momentos de alegria' },
        { id: 19, src: 'assets/image/foto_19.jpg', category: 'book-pessoal', title: 'Retrato Profissional', description: 'Sessão de retrato profissional com técnica avançada e iluminação artística' },
        { id: 20, src: 'assets/image/foto_20.jpg', category: 'eventos-corporativos', title: 'Evento Familiar', description: 'Cobertura de evento familiar com momentos de união e celebração' },
        { id: 21, src: 'assets/image/foto_21.jpg', category: 'casamento-civil', title: 'Casamento Familiar', description: 'Casamento civil com presença da família e momentos especiais' },
        { id: 22, src: 'assets/image/foto_22.jpg', category: 'ensaio-gestante', title: 'Fotografia Gestante', description: 'Ensaio fotográfico para gestantes com técnica artística e iluminação natural' },
        { id: 23, src: 'assets/image/foto_23.jpg', category: 'ensaio-tematico-infantil', title: 'Fotografia Infantil', description: 'Sessão fotográfica infantil com técnica macro e cenários delicados' },
        { id: 24, src: 'assets/image/foto_24.jpg', category: 'aniversario-geral', title: 'Celebração Especial', description: 'Aniversário com decoração festiva e momentos especiais de celebração' },
        { id: 25, src: 'assets/image/foto_25.jpg', category: 'book-pessoal', title: 'Ensaio Artístico', description: 'Sessão fotográfica artística com técnica profissional e iluminação criativa' },
        { id: 26, src: 'assets/image/foto_26.jpg', category: 'eventos-corporativos', title: 'Evento Especial', description: 'Cobertura de evento especial com momentos únicos e celebração' },
        { id: 27, src: 'assets/image/foto_27.jpg', category: 'casamento-civil', title: 'Casamento Elegante', description: 'Casamento civil com cerimônia elegante e sofisticada, focando na elegância' },
        { id: 28, src: 'assets/image/foto_28.jpg', category: 'ensaio-gestante', title: 'Sessão Maternidade', description: 'Ensaio fotográfico de maternidade com técnica natural e iluminação suave' },
        { id: 29, src: 'assets/image/foto_29.jpg', category: 'ensaio-tematico-infantil', title: 'Fotografia de Bebê', description: 'Sessão fotográfica de bebê com técnica macro, detalhes e cenários delicados' },
        { id: 30, src: 'assets/image/foto_30.jpg', category: 'aniversario-geral', title: 'Festa de Aniversário', description: 'Celebração de aniversário com decoração personalizada e momentos especiais' },
        { id: 31, src: 'assets/image/foto_31.jpg', category: 'book-pessoal', title: 'Ensaio Feminino', description: 'Sessão fotográfica feminina com técnica profissional e iluminação artística' },
        { id: 32, src: 'assets/image/foto_32.jpg', category: 'eventos-corporativos', title: 'Evento Corporativo', description: 'Cobertura de evento corporativo com networking e momentos profissionais' },
        { id: 33, src: 'assets/image/foto_33.jpg', category: 'casamento-civil', title: 'Casamento Íntimo', description: 'Casamento civil com cerimônia íntima e especial, focando na intimidade' },
        { id: 34, src: 'assets/image/foto_34.jpg', category: 'ensaio-gestante', title: 'Ensaio Gestante', description: 'Fotografia de gestante com técnica de iluminação natural e cenários artísticos' },
        { id: 35, src: 'assets/image/foto_35.jpg', category: 'ensaio-tematico-infantil', title: 'Sessão Bebê', description: 'Ensaio fotográfico de bebê com cenários delicados e técnica macro' },
        { id: 36, src: 'assets/image/foto_36.jpg', category: 'book-pessoal', title: 'Retrato Profissional', description: 'Sessão de retrato profissional com técnica avançada e iluminação artística' },
        
        // Fotos do WhatsApp - Categorizadas por data e conteúdo
        // Sessão 2025-08-06
        { id: 37, src: 'assets/image/WhatsApp Image 2025-08-06 at 15.27.15.jpeg', category: 'book-pessoal', title: 'Ensaio Feminino Elegante', description: 'Sessão fotográfica feminina com iluminação natural e cenários sofisticados' },
        { id: 38, src: 'assets/image/WhatsApp Image 2025-08-06 at 15.27.15 (1).jpeg', category: 'book-pessoal', title: 'Retrato Artístico', description: 'Retrato artístico com técnica de iluminação dramática e composição criativa' },
        { id: 39, src: 'assets/image/WhatsApp Image 2025-08-06 at 15.27.15 (2).jpeg', category: 'book-pessoal', title: 'Ensaio Contemporâneo', description: 'Sessão fotográfica contemporânea com estilo moderno e urbano' },
        { id: 40, src: 'assets/image/WhatsApp Image 2025-08-06 at 15.27.15 (3).jpeg', category: 'book-pessoal', title: 'Fotografia Editorial', description: 'Fotografia editorial com conceito artístico e iluminação profissional' },
        
        // Sessão 2025-08-05 - 22:16
        { id: 41, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.16.48.jpeg', category: 'eventos-corporativos', title: 'Evento Corporativo', description: 'Cobertura de evento corporativo com networking e momentos profissionais' },
        { id: 42, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.16.48 (1).jpeg', category: 'eventos-corporativos', title: 'Conferência Empresarial', description: 'Fotografia de conferência empresarial com palestras e interação' },
        { id: 43, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.16.48 (2).jpeg', category: 'eventos-corporativos', title: 'Networking Profissional', description: 'Momentos de networking e conexões profissionais em evento' },
        { id: 44, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.16.48 (3).jpeg', category: 'eventos-corporativos', title: 'Apresentação Corporativa', description: 'Apresentação corporativa com foco em comunicação e engajamento' },
        
        // Sessão 2025-08-05 - 22:15
        { id: 45, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.15.39.jpeg', category: 'aniversario-geral', title: 'Festa de Aniversário', description: 'Celebração de aniversário com decoração festiva e momentos de alegria' },
        { id: 46, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.15.39 (1).jpeg', category: 'aniversario-geral', title: 'Aniversário Especial', description: 'Aniversário com decoração personalizada e momentos especiais' },
        { id: 47, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.15.40.jpeg', category: 'aniversario-geral', title: 'Celebração Familiar', description: 'Celebração de aniversário em família com momentos de união' },
        { id: 48, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.15.40 (1).jpeg', category: 'aniversario-geral', title: 'Festa Infantil', description: 'Aniversário infantil com decoração temática e diversão' },
        { id: 49, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.15.41.jpeg', category: 'aniversario-geral', title: 'Momento Especial', description: 'Momento especial de aniversário com família e amigos' },
        
        // Sessão 2025-08-05 - 22:14
        { id: 50, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.14.40.jpeg', category: 'ensaio-gestante', title: 'Ensaio Gestante Natural', description: 'Sessão fotográfica para gestantes com iluminação natural e cenários suaves' },
        { id: 51, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.14.41.jpeg', category: 'ensaio-gestante', title: 'Maternidade Artística', description: 'Fotografia de maternidade com técnica artística e iluminação criativa' },
        { id: 52, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.14.42.jpeg', category: 'ensaio-gestante', title: 'Sessão Maternidade', description: 'Ensaio fotográfico de maternidade com técnica natural e iluminação suave' },
        { id: 53, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.14.42 (1).jpeg', category: 'ensaio-gestante', title: 'Fotografia Gestante', description: 'Fotografia de gestante com técnica de iluminação natural e cenários artísticos' },
        
        // Sessão 2025-08-05 - 22:13
        { id: 54, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.38.jpeg', category: 'casamento-civil', title: 'Casamento Íntimo', description: 'Casamento civil com cerimônia íntima e momentos especiais' },
        // REMOVIDO - DUPLICATA: { id: 55, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.38 (1).jpeg', category: 'casamento-civil', title: 'Casamento Simples', description: 'Casamento civil com cerimônia simples e elegante' },
        { id: 56, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39.jpeg', category: 'casamento-civil', title: 'Casamento Familiar', description: 'Casamento civil com presença da família e momentos especiais' },
        { id: 57, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39 (1).jpeg', category: 'casamento-civil', title: 'Casamento Elegante', description: 'Casamento civil com cerimônia elegante e sofisticada' },
        { id: 58, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39 (2).jpeg', category: 'casamento-civil', title: 'Casamento Civil', description: 'Cerimônia íntima de casamento civil com momentos especiais' },
        { id: 59, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39 (3).jpeg', category: 'casamento-civil', title: 'Casamento Simples', description: 'Casamento civil com cerimônia descontraída e momentos de alegria' },
        { id: 60, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39 (4).jpeg', category: 'casamento-civil', title: 'Casamento Íntimo', description: 'Casamento civil com cerimônia íntima e especial' },
        { id: 61, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39 (5).jpeg', category: 'casamento-civil', title: 'Casamento Familiar', description: 'Casamento civil com presença da família e momentos especiais' },
        { id: 62, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.13.39 (6).jpeg', category: 'casamento-civil', title: 'Casamento Elegante', description: 'Casamento civil com cerimônia elegante e sofisticada' },
        
        // Sessão 2025-08-05 - 22:12
        { id: 63, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.12.47.jpeg', category: 'ensaio-tematico-infantil', title: 'Fotografia de Bebê', description: 'Sessão fotográfica de bebê com técnica macro, detalhes e cenários delicados' },
        { id: 64, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.12.47 (1).jpeg', category: 'ensaio-tematico-infantil', title: 'Sessão Bebê', description: 'Ensaio fotográfico de bebê com cenários delicados e técnica macro' },
        { id: 65, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.12.48.jpeg', category: 'ensaio-tematico-infantil', title: 'Fotografia Infantil', description: 'Sessão fotográfica infantil com técnica macro e cenários delicados' },
        { id: 66, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.12.48 (1).jpeg', category: 'ensaio-tematico-infantil', title: 'Ensaio Bebê', description: 'Fotografia de bebê com técnica macro, cenários delicados e captura de momentos únicos' },
        
        // Sessão 2025-08-05 - 22:11
        { id: 67, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.09.jpeg', category: 'book-pessoal', title: 'Ensaio Feminino', description: 'Sessão fotográfica feminina com técnica profissional e iluminação artística' },
        { id: 68, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.09 (1).jpeg', category: 'book-pessoal', title: 'Retrato Profissional', description: 'Sessão de retrato profissional com técnica avançada e iluminação artística' },
        { id: 69, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.10.jpeg', category: 'book-pessoal', title: 'Ensaio Artístico', description: 'Sessão fotográfica artística com técnica profissional e iluminação criativa' },
        // REMOVIDO - DUPLICATA: { id: 70, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.10 (1).jpeg', category: 'book-pessoal', title: 'Ensaio Pessoal', description: 'Sessão fotográfica pessoal com técnica de retrato e iluminação profissional' },
        // REMOVIDO - DUPLICATA: { id: 71, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.10 (2).jpeg', category: 'book-pessoal', title: 'Retrato Editorial', description: 'Retrato editorial com conceito artístico e iluminação profissional' },
        // REMOVIDO - DUPLICATA: { id: 72, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.10 (3).jpeg', category: 'book-pessoal', title: 'Ensaio Contemporâneo', description: 'Sessão fotográfica contemporânea com estilo moderno e urbano' },
        { id: 73, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.11.jpeg', category: 'book-pessoal', title: 'Fotografia Artística', description: 'Fotografia artística com técnica criativa e iluminação dramática' },
        
        // Sessão 2025-08-05 - 22:11 (continuação)
        { id: 74, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.58.jpeg', category: 'eventos-corporativos', title: 'Evento Social', description: 'Cobertura de evento social com momentos de interação e celebração' },
        { id: 75, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.58 (1).jpeg', category: 'eventos-corporativos', title: 'Evento Comemorativo', description: 'Cobertura de evento comemorativo com momentos especiais e celebração' },
        { id: 76, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.11.58 (2).jpeg', category: 'eventos-corporativos', title: 'Evento Especial', description: 'Cobertura de evento especial com momentos únicos e celebração' },
        
        // Sessão 2025-08-05 - 22:09
        { id: 77, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.09.49.jpeg', category: 'aniversario-geral', title: 'Festa de Aniversário', description: 'Celebração de aniversário com decoração festiva e momentos de alegria' },
        { id: 78, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.09.49 (1).jpeg', category: 'aniversario-geral', title: 'Aniversário Especial', description: 'Aniversário com decoração personalizada e momentos especiais' },
        { id: 79, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.09.49 (2).jpeg', category: 'aniversario-geral', title: 'Celebração Familiar', description: 'Celebração de aniversário em família com momentos de união' },
        { id: 80, src: 'assets/image/WhatsApp Image 2025-08-05 at 22.09.49 (3).jpeg', category: 'aniversario-geral', title: 'Festa Infantil', description: 'Aniversário infantil com decoração temática e diversão' }
    ];
    
    // Verificar duplicatas no portfolioData
    const duplicates = findDuplicates(portfolioData);
    if (duplicates.length > 0) {
        console.log('⚠️ Duplicatas encontradas no portfolioData:', duplicates);
        console.log('Removendo duplicatas...');
    }
    
    // Remover duplicatas do portfolioData
    const uniquePortfolioData = removeDuplicates(portfolioData);
    console.log('Portfolio original:', portfolioData.length, 'itens');
    console.log('Portfolio sem duplicatas:', uniquePortfolioData.length, 'itens');
    
    portfolioItems = uniquePortfolioData;
    renderPortfolio(portfolioItems);
    
    console.log('Portfolio items carregados:', portfolioItems.length);
    
    // Inicializar galeria mobile imediatamente se estiver em mobile
    if (window.innerWidth <= 768) {
        console.log('Inicializando galeria mobile após carregamento...');
        setTimeout(() => {
            initMobileGallery();
        }, 500);
    }
    
    // Inicializar masonry layout apenas em desktop (removido para evitar duplicação)
    // A galeria masonry será criada apenas através do listener de resize
}

function renderPortfolio(items) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    // Limpar grid antes de renderizar
    grid.innerHTML = '';
    
    console.log('Renderizando', items.length, 'itens do portfólio');
    
    items.forEach((item, index) => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.style.animationDelay = `${index * 0.1}s`;
        
        // Adicionar elementos de efeito
        // Verificar e corrigir caminho da imagem
        let imagePath = item.src;
        if (!imagePath.startsWith('assets/')) {
            imagePath = `assets/image/${item.src.split('/').pop()}`;
        }
        
        portfolioItem.innerHTML = `
            <div class="lens-effect"></div>
            <div class="focus-ring"></div>
            <div class="aperture-effect"></div>
            <img src="${imagePath}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'; console.error('Erro ao carregar:', this.src);">
        `;
        
        portfolioItem.addEventListener('click', () => {
            // Debug: Mostrar informações da foto clicada
            console.log('🖼️ FOTO CLICADA (GALERIA PRINCIPAL):');
            console.log('📁 Arquivo:', item.src);
            console.log('📝 Título:', item.title);
            console.log('🏷️ Categoria:', item.category);
            console.log('🆔 ID:', item.id);
            console.log('📄 Descrição:', item.description);
            console.log('---');
            
            openPortfolioModal(item);
        });
        grid.appendChild(portfolioItem);
    });
    
    // Reinicializar efeitos após renderizar
    setTimeout(() => {
        initPhotoEffects();
        initScrollAnimations();
    }, 100);
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
            const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
            
            // Verificar se é um dia de atendimento (Terça, Quarta, Quinta, Sábado, Domingo)
            const isAvailableDay = dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 6 || dayOfWeek === 0;
            
            if (!isAvailableDay) {
                // Dias não disponíveis (Segunda e Sexta) - bloqueio visual
                arg.el.style.backgroundColor = '#f8f9fa';
                arg.el.style.color = '#6c757d';
                arg.el.style.cursor = 'not-allowed';
                arg.el.style.opacity = '0.6';
                
                // Adicionar texto indicativo
                const dayNumber = arg.el.querySelector('.fc-daygrid-day-number');
                if (dayNumber) {
                    dayNumber.style.fontSize = '0.8em';
                    dayNumber.style.color = '#6c757d';
                }
            } else {
                // Dias disponíveis (Terça, Quarta, Quinta, Sábado, Domingo)
                arg.el.style.backgroundColor = '#e8f5e8';
                arg.el.style.cursor = 'pointer';
                arg.el.style.opacity = '1';
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
            const isAvailableDay = dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 6 || dayOfWeek === 0;
            
            console.log('Dia da semana:', dayOfWeek);
            console.log('É dia de atendimento:', isAvailableDay);
            
            if (!isAvailableDay) {
                console.log('Dia não disponível - mostrando aviso');
                const dayName = dayOfWeek === 1 ? 'Segunda-feira' : 'Sexta-feira';
                showNotification(`Não atendemos às ${dayName.toLowerCase()}s. Atendimento: Terça a Quinta, Sábado e Domingo.`, 'warning');
                return;
            }
            
            console.log('Chamando handleDateClick com:', info.dateStr);
            handleDateClick(info.dateStr);
        }
    });
    
    calendar.render();
    
    // Configurar listener em tempo real (que também carrega eventos existentes)
    try {
        console.log('=== INICIALIZANDO CALENDÁRIO ===');
        console.log('Chamando setupRealtimeListener...');
        FirebaseAppointment.setupRealtimeListener(calendar);
        
        // Verificar se os agendamentos foram carregados após 3 segundos
        setTimeout(async () => {
            console.log('=== VERIFICANDO CARREGAMENTO DE AGENDAMENTOS ===');
            const events = calendar.getEvents();
            console.log('Eventos no calendário:', events.length);
            
            if (events.length === 0) {
                console.log('⚠️ Nenhum evento carregado - tentando carregar manualmente');
                try {
                    const appointments = await FirebaseAppointment.loadAppointments();
                    if (appointments && appointments.length > 0) {
                        calendar.addEventSource(appointments);
                        console.log('✅ Agendamentos carregados manualmente:', appointments.length);
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar agendamentos manualmente:', error);
                }
            } else {
                console.log('✅ Agendamentos carregados com sucesso:', events.length);
            }
        }, 3000);
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
    
    // Verificar se é um dia de atendimento (Terça, Quarta, Quinta, Sábado, Domingo)
    const dayOfWeek = clickedDate.getDay();
    const isAvailableDay = dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 6 || dayOfWeek === 0;
    
    console.log('Dia da semana:', dayOfWeek);
    console.log('É dia de atendimento:', isAvailableDay);
    
    if (!isAvailableDay) {
        showNotification('Atendimento apenas às terças, quartas, quintas, sábados e domingos', 'warning');
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

async function handleEventClick(info) {
    const event = info.event;
    const clientName = event.extendedProps.clientName;
    const serviceType = event.extendedProps.serviceType;
    const clientEmail = event.extendedProps.clientEmail;
    const clientPhone = event.extendedProps.clientPhone;
    
    console.log('=== VERIFICANDO PERMISSÃO PARA EXCLUIR AGENDAMENTO ===');
    console.log('Evento clicado:', event.id);
    console.log('Cliente:', clientName);
    
    // Verificar se FirebaseAuth está disponível
    if (typeof FirebaseAuth === 'undefined') {
        console.log('❌ FirebaseAuth não está disponível');
        showNotification('❌ Erro: Sistema de autenticação não disponível', 'error');
        return;
    }
    
    console.log('✅ FirebaseAuth está disponível');
    console.log('Verificando autenticação...');
    
    // Verificar se o usuário está autenticado como administrador
    const isAdmin = await FirebaseAuth.isAdminAuthenticated();
    console.log('Resultado da verificação de admin:', isAdmin);
    
    if (!isAdmin) {
        console.log('❌ Usuário não é administrador - mostrando modal de login');
        showNotification('🔒 Acesso negado. Apenas administradores podem excluir agendamentos.', 'error');
        showAdminLoginModal();
        return;
    }
    
    console.log('✅ Usuário autenticado como administrador - prosseguindo com exclusão');
    
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

// Função para excluir agendamento (versão protegida)
async function deleteAppointment(appointmentId, dateStr) {
    try {
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
    
    const text = typewriterText.textContent.trim();
    // Garantir que o elemento tenha conteúdo mínimo para manter altura
    typewriterText.textContent = '\u200B'; // Zero-width space para manter altura
    
    let currentIndex = 0;
    let typingSpeed = 100;
    
    function typeWriter() {
        // Digitando texto - garantir que sempre tenha conteúdo visível
        if (currentIndex === 0) {
            // Primeiro caractere - remover o zero-width space
            typewriterText.textContent = text.substring(0, 1);
        } else {
            typewriterText.textContent = text.substring(0, currentIndex + 1);
        }
        currentIndex++;
        
        // Verificar se terminou de digitar
        if (currentIndex <= text.length) {
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Animação concluída - manter o texto completo e parar
            // O cursor continua piscando normalmente
            typewriterText.textContent = text;
        }
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


// ===== BOTÃO CTA MODERNO =====
function initModernCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    
    if (!ctaButton) return;
    
    // Efeito de ripple no clique
    ctaButton.addEventListener('click', function(e) {
        // Criar efeito de ripple
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1001;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
        
        // Feedback visual simples
        this.classList.add('loading');
        
        setTimeout(() => {
            this.classList.remove('loading');
            this.classList.add('success');
            
            setTimeout(() => {
                this.classList.remove('success');
            }, 2000);
        }, 1000);
    });
    
    // Garantir que o botão sempre fique visível
    function ensureButtonVisibility() {
        if (ctaButton && (ctaButton.style.display === 'none' || 
                          ctaButton.style.opacity === '0' || 
                          ctaButton.style.visibility === 'hidden')) {
            ctaButton.style.display = 'inline-flex';
            ctaButton.style.opacity = '1';
            ctaButton.style.visibility = 'visible';
        }
    }
    
    // Verificar a cada 5 segundos
    setInterval(ensureButtonVisibility, 5000);
}

// Adicionar keyframes para ripple
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

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

// ===== EFEITOS FOTOGRÁFICOS AVANÇADOS =====
function initPhotoEffects() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        // Adicionar elementos de efeito se não existirem
        if (!item.querySelector('.lens-effect')) {
            item.insertAdjacentHTML('afterbegin', '<div class="lens-effect"></div>');
        }
        if (!item.querySelector('.focus-ring')) {
            item.insertAdjacentHTML('afterbegin', '<div class="focus-ring"></div>');
        }
        if (!item.querySelector('.aperture-effect')) {
            item.insertAdjacentHTML('afterbegin', '<div class="aperture-effect"></div>');
        }
        
        const lensEffect = item.querySelector('.lens-effect');
        
        // Efeito de lente fotográfica avançado
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcula a distância do centro
            const distanceX = (x - centerX) / centerX;
            const distanceY = (y - centerY) / centerY;
            
            // Efeito de lente mais realista
            const rotateX = distanceY * 12;
            const rotateY = -distanceX * 12;
            
            // Efeito de profundidade baseado na posição
            const depth = Math.abs(distanceX) + Math.abs(distanceY);
            const translateZ = 20 + (depth * 15);
            const scale = 1 + (depth * 0.05);
            
            // Aplica transformação 3D com limites para evitar overflow
            const limitedRotateX = Math.max(-8, Math.min(8, rotateX));
            const limitedRotateY = Math.max(-8, Math.min(8, rotateY));
            
            item.style.transform = `
                translateZ(${translateZ}px) 
                rotateX(${limitedRotateX}deg) 
                rotateY(${limitedRotateY}deg) 
                scale(${scale})
            `;
            
            // Efeito de lente dinâmico
            if (lensEffect) {
                lensEffect.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
                lensEffect.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
            }
            
            // Efeito de brilho fotográfico
            const brightness = 1 + (depth * 0.15);
            const contrast = 1 + (depth * 0.1);
            item.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(1.3)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
            item.style.filter = 'brightness(1) contrast(1) saturate(1.2)';
        });
    });
}

// ===== ANIMAÇÃO DE ENTRADA COM SCROLL =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
            }
        });
    }, observerOptions);

    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        observer.observe(item);
    });
}

// ===== EFEITO DE PARTÍCULAS DINÂMICAS =====
function initPhotoParticles() {
    function createPhotoParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        
        const particlesContainer = document.querySelector('.photo-particles');
        if (particlesContainer) {
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 10000);
        }
    }

    setInterval(createPhotoParticle, 3000);
}

// ===== ATUALIZAR RENDERIZAÇÃO DO PORTFÓLIO =====
function renderPortfolioWithEffects(items) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    items.forEach((item, index) => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.setAttribute('data-category', item.category);
        
        // Adicionar elementos de efeito
        portfolioItem.innerHTML = `
            <div class="lens-effect"></div>
            <div class="focus-ring"></div>
            <div class="aperture-effect"></div>
            <img src="${item.image}" alt="${item.title}" loading="lazy">
        `;
        
        // Adicionar evento de clique para modal
        portfolioItem.addEventListener('click', () => openPortfolioModal(item));
        
        grid.appendChild(portfolioItem);
    });
    
    // Reinicializar efeitos após renderizar
    setTimeout(() => {
        initPhotoEffects();
        initScrollAnimations();
    }, 100);
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', () => {
    // Marcar como carregado
    document.body.classList.add('loaded');
    
    // Track page view
    trackEvent('engagement', 'page_view', window.location.pathname);
    
    // Inicializar efeitos fotográficos após carregamento
    setTimeout(() => {
        initPhotoEffects();
        initScrollAnimations();
        initPhotoParticles();
    }, 1000);
}); 

// ===== MASONRY LAYOUT =====
function initMasonryLayout() {
    // Verificar se já existe uma seção masonry
    const existingMasonry = document.querySelector('.masonry-section');
    if (existingMasonry) {
        existingMasonry.remove();
    }
    
    // Adicionar seção de masonry layout apenas em desktop
    if (window.innerWidth <= 768) {
        console.log('Masonry layout não será criado em mobile');
        return;
    }
    
    // Verificar se portfolioItems está disponível
    if (!portfolioItems || portfolioItems.length === 0) {
        console.log('Portfolio items não disponíveis para masonry');
        return;
    }
    
    const portfolioSection = document.getElementById('portfolio');
    if (!portfolioSection) return;
    
    const masonrySection = document.createElement('div');
    masonrySection.className = 'masonry-section';
    masonrySection.innerHTML = `
        <div class="section-title">
            <h2>Galeria Masonry</h2>
            <p>Layout dinâmico com diferentes tamanhos de imagens</p>
        </div>
        <div class="masonry-grid" id="masonry-grid"></div>
    `;
    
    portfolioSection.appendChild(masonrySection);
    
    // Criar masonry grid
    const masonryGrid = document.getElementById('masonry-grid');
    if (!masonryGrid) return;
    
    // Selecionar algumas imagens para o masonry (diferentes tamanhos)
    const masonryItems = portfolioItems.filter((_, index) => index % 3 === 0 || index % 5 === 0);
    
    masonryItems.forEach((item, index) => {
        const masonryItem = document.createElement('div');
        masonryItem.className = 'masonry-item';
        
        // Definir diferentes tamanhos para criar efeito masonry
        const sizes = ['small', 'medium', 'large'];
        const size = sizes[index % sizes.length];
        masonryItem.classList.add(`masonry-${size}`);
        
        // Corrigir caminho da imagem quando necessário
        let imagePath = item.src;
        if (!imagePath.startsWith('assets/')) {
            imagePath = `assets/image/${item.src.split('/').pop()}`;
        }
        
        masonryItem.innerHTML = `
            <div class="masonry-image">
                <img src="${imagePath}" alt="${item.title}" onerror="this.style.display='none'">
            </div>
        `;
        
        masonryItem.addEventListener('click', () => {
            // Debug: Mostrar informações da foto clicada
            console.log('🖼️ FOTO CLICADA (GALERIA MASONRY):');
            console.log('📁 Arquivo:', item.src);
            console.log('📝 Título:', item.title);
            console.log('🏷️ Categoria:', item.category);
            console.log('🆔 ID:', item.id);
            console.log('📄 Descrição:', item.description);
            console.log('---');
            
            openPortfolioModal(item);
        });
        masonryGrid.appendChild(masonryItem);
    });
    
    // Layout masonry já foi inicializado
    console.log('Masonry layout inicializado com', masonryItems.length, 'itens');
}

// ===== FILTROS AVANÇADOS =====
function initAdvancedFilters() {
    const filtersContainer = document.querySelector('.portfolio-filters');
    if (!filtersContainer) return;
    
    // Adicionar filtros avançados
    const advancedFilters = document.createElement('div');
    advancedFilters.className = 'advanced-filters';
    advancedFilters.innerHTML = `
        <div class="filter-group">
            <label>Ordenar por:</label>
            <select id="sort-filter">
                <option value="date">Data</option>
                <option value="category">Categoria</option>
                <option value="title">Título</option>
            </select>
        </div>
        <div class="filter-group">
            <label>Visualização:</label>
            <select id="view-filter">
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="carousel">Carrossel</option>
            </select>
        </div>
        <div class="filter-group">
            <label>Itens por página:</label>
            <select id="items-per-page">
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
                <option value="all">Todos</option>
            </select>
        </div>
    `;
    
    filtersContainer.appendChild(advancedFilters);
    
    // Adicionar event listeners
    document.getElementById('sort-filter').addEventListener('change', handleSortChange);
    document.getElementById('view-filter').addEventListener('change', handleViewChange);
    document.getElementById('items-per-page').addEventListener('change', handleItemsPerPageChange);
}

function handleSortChange(e) {
    const sortBy = e.target.value;
    let sortedItems = [...portfolioItems];
    
    switch (sortBy) {
        case 'date':
            sortedItems.sort((a, b) => a.id - b.id);
            break;
        case 'category':
            sortedItems.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'title':
            sortedItems.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    renderPortfolio(sortedItems);
}

function handleViewChange(e) {
    const viewType = e.target.value;
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    portfolioGrid.className = `portfolio-grid portfolio-${viewType}`;
    
    // Re-renderizar com o novo layout
    renderPortfolio(portfolioItems);
}

function handleItemsPerPageChange(e) {
    const itemsPerPage = e.target.value;
    let itemsToShow = portfolioItems;
    
    if (itemsPerPage !== 'all') {
        itemsToShow = portfolioItems.slice(0, parseInt(itemsPerPage));
    }
    
    renderPortfolio(itemsToShow);
}

// ===== LAZY LOADING AVANÇADO =====
function initAdvancedLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Adicionar efeito de fade-in
                    img.style.opacity = '0';
                    img.style.transform = 'scale(0.8)';
                    
                    img.onload = () => {
                        img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        img.style.opacity = '1';
                        img.style.transform = 'scale(1)';
                    };
                    
                    // Carregar imagem
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ===== EFEITOS 3D AVANÇADOS =====
function initAdvanced3DEffects() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        // Adicionar efeito de profundidade 3D
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            item.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale3d(1.05, 1.05, 1.05)
            `;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// ===== RESPONSIVIDADE AVANÇADA =====
function initAdvancedResponsiveness() {
    function updateLayout() {
        const width = window.innerWidth;
        const portfolioGrid = document.getElementById('portfolio-grid');
        
        if (!portfolioGrid) return;
        
        if (width < 768) {
            portfolioGrid.style.gridTemplateColumns = '1fr';
            portfolioGrid.style.gap = '1rem';
        } else if (width < 1024) {
            portfolioGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            portfolioGrid.style.gap = '1.5rem';
        } else if (width < 1440) {
            portfolioGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            portfolioGrid.style.gap = '2rem';
        } else {
            portfolioGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            portfolioGrid.style.gap = '2rem';
        }
    }
    
    updateLayout();
    window.addEventListener('resize', debounce(updateLayout, 250));
}



// ===== INICIALIZAÇÃO AVANÇADA =====
function initAdvancedFeatures() {
    initAdvancedFilters();
    initAdvancedLazyLoading();
    initAdvanced3DEffects();
    initAdvancedResponsiveness();
}

// ===== SISTEMA DE AUTENTICAÇÃO ADMINISTRATIVA =====

// Função para atualizar o status de autenticação na interface
async function updateAuthStatus() {
    try {
        console.log('=== ATUALIZANDO STATUS DE AUTENTICAÇÃO ===');
        
        const logoutItem = document.getElementById('admin-logout-item');
        const logoutBtn = document.getElementById('admin-logout-btn');
        
        if (!logoutItem || !logoutBtn) {
            console.log('❌ Elementos de logout não encontrados');
            return;
        }
        
        // Verificar se o usuário está autenticado como administrador
        const isAdmin = await FirebaseAuth.isAdminAuthenticated();
        console.log('Status de autenticação:', isAdmin);
        
        if (isAdmin) {
            // Usuário está logado como admin
            logoutItem.style.display = 'block';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair (Admin)';
            logoutBtn.style.color = '#B4457A';
            console.log('✅ Mostrando botão de logout para admin');
        } else {
            // Usuário não está logado como admin
            logoutItem.style.display = 'none';
            console.log('❌ Ocultando botão de logout');
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar status de autenticação:', error);
    }
}

// Função para fazer logout
async function handleAdminLogout() {
    try {
        console.log('=== FAZENDO LOGOUT DE ADMINISTRADOR ===');
        
        const result = await FirebaseAuth.adminLogout();
        
        if (result.success) {
            console.log('✅ Logout realizado com sucesso');
            showNotification('🔓 Logout realizado com sucesso!', 'success');
            
            // Atualizar interface
            updateAuthStatus();
            
            // Recarregar página para limpar qualquer estado
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            console.log('❌ Erro no logout:', result.error);
            showNotification(`❌ Erro no logout: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        showNotification(`❌ Erro: ${error.message}`, 'error');
    }
}

// Função para verificar status atual de autenticação
async function checkCurrentAuthStatus() {
    try {
        console.log('=== VERIFICANDO STATUS ATUAL DE AUTENTICAÇÃO ===');
        
        const isAdmin = await FirebaseAuth.isAdminAuthenticated();
        console.log('Usuário atual é admin:', isAdmin);
        
        if (isAdmin) {
            const user = firebase.auth().currentUser;
            console.log('E-mail do usuário logado:', user.email);
            showNotification(`🔐 Logado como administrador: ${user.email}`, 'success');
        } else {
            console.log('Nenhum administrador logado');
        }
        
        return isAdmin;
        
    } catch (error) {
        console.error('❌ Erro ao verificar status de autenticação:', error);
        return false;
    }
}

// ===== MODAL DE LOGIN ADMINISTRATIVO =====
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
            console.log('=== TENTANDO LOGIN ADMIN ===');
            console.log('E-mail:', email);
            
            const result = await FirebaseAuth.adminLogin(email, password);
            console.log('Resultado do login:', result);
            
            if (result.success) {
                statusDiv.textContent = '✅ Login realizado com sucesso!';
                statusDiv.style.color = '#28a745';
                
                setTimeout(() => {
                    closeModal();
                    showNotification('🔓 Login administrativo realizado com sucesso!', 'success');
                    // Atualizar status de autenticação
                    updateAuthStatus();
                    // Recarregar página para atualizar interface
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }, 1500);
            } else {
                statusDiv.textContent = `❌ ${result.error}`;
                statusDiv.style.color = '#dc3545';
                console.error('Erro no login:', result.error);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            statusDiv.textContent = `❌ Erro: ${error.message}`;
            statusDiv.style.color = '#dc3545';
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Função para inicializar o sistema de autenticação
function initAuthSystem() {
    console.log('=== INICIALIZANDO SISTEMA DE AUTENTICAÇÃO ===');
    
    // Adicionar event listener para o botão de logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Botão de logout clicado');
            await handleAdminLogout();
        });
        console.log('✅ Event listener do botão de logout adicionado');
    } else {
        console.log('❌ Botão de logout não encontrado');
    }
    
    // Verificar status inicial de autenticação
    setTimeout(async () => {
        await updateAuthStatus();
        console.log('✅ Status de autenticação atualizado');
    }, 1000);
}

// Adicionar funções de autenticação ao escopo global
window.AuthSystem = {
    checkCurrentAuthStatus,
    updateAuthStatus,
    handleAdminLogout,
    initAuthSystem
};

// ===== GALERIA MOBILE ESPECIAL =====
function initMobileGallery() {
    console.log('Função initMobileGallery chamada');
    console.log('Window width:', window.innerWidth);
    console.log('Portfolio items:', portfolioItems ? portfolioItems.length : 'undefined');
    
    // Verificar se estamos em mobile
    if (window.innerWidth > 768) {
        console.log('Não é mobile, saindo...');
        return;
    }
    
    // Verificar se já existe a galeria mobile
    const existingMobileGallery = document.querySelector('.mobile-gallery-section');
    if (existingMobileGallery) {
        console.log('Removendo galeria mobile existente...');
        existingMobileGallery.remove();
    }
    
    const portfolioSection = document.getElementById('portfolio');
    if (!portfolioSection) {
        console.log('Seção portfolio não encontrada');
        return;
    }
    
    if (!portfolioItems || portfolioItems.length === 0) {
        console.log('Portfolio items não disponíveis');
        return;
    }
    
    // Criar seção da galeria mobile
    const mobileGallerySection = document.createElement('div');
    mobileGallerySection.className = 'mobile-gallery-section';
    mobileGallerySection.innerHTML = `
        <div class="section-title">
            <h2>📱 Galeria Mobile</h2>
            <p>Deslize para navegar • Toque para ampliar</p>
        </div>
        <div class="mobile-gallery-container">
            <div class="mobile-gallery-track" id="mobile-gallery-track"></div>
            <div class="mobile-gallery-indicators" id="mobile-gallery-indicators"></div>
            <div class="mobile-gallery-controls">
                <button class="mobile-gallery-btn prev" id="mobile-prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="mobile-gallery-btn next" id="mobile-next">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    portfolioSection.appendChild(mobileGallerySection);
    
    // Criar cards da galeria mobile
    const track = document.getElementById('mobile-gallery-track');
    const indicators = document.getElementById('mobile-gallery-indicators');
    
    console.log('Criando cards da galeria mobile...');
    const uniqueItems = new Set();
    
    portfolioItems.forEach((item, index) => {
        // Verificar se o item já foi processado
        const itemKey = `${item.src}-${item.title}`;
        if (uniqueItems.has(itemKey)) {
            console.log('⚠️ Item duplicado encontrado:', item.title, item.src);
            return; // Pular item duplicado
        }
        uniqueItems.add(itemKey);
        
        // Card principal
        const card = document.createElement('div');
        card.className = 'mobile-gallery-card';
        card.setAttribute('data-index', index);
        
        // Corrigir caminho da imagem
        let imagePath = item.src;
        if (!imagePath.startsWith('assets/')) {
            imagePath = `assets/image/${item.src.split('/').pop()}`;
        }
        
        card.innerHTML = `
            <div class="mobile-card-image">
                <img src="${imagePath}" alt="${item.title}" loading="lazy">
                <div class="mobile-card-overlay">
                    <div class="mobile-card-category">${item.category}</div>
                    <div class="mobile-card-title">${item.title}</div>
                </div>
            </div>
            <div class="mobile-card-effects">
                <div class="mobile-card-glow"></div>
                <div class="mobile-card-particles"></div>
            </div>
        `;
        
        // Indicador
        const indicator = document.createElement('div');
        indicator.className = 'mobile-gallery-indicator';
        indicator.setAttribute('data-index', index);
        
        track.appendChild(card);
        indicators.appendChild(indicator);
        
        // Event listeners
        card.addEventListener('click', () => {
            // Debug: Mostrar informações da foto clicada
            console.log('🖼️ FOTO CLICADA (GALERIA MOBILE):');
            console.log('📁 Arquivo:', item.src);
            console.log('📝 Título:', item.title);
            console.log('🏷️ Categoria:', item.category);
            console.log('🆔 ID:', item.id);
            console.log('📄 Descrição:', item.description);
            console.log('---');
            
            openPortfolioModal(item);
        });
        indicator.addEventListener('click', () => {
            // Verificar se goToSlide está disponível
            if (typeof goToSlide === 'function') {
                goToSlide(index);
            } else {
                console.log('Função goToSlide não disponível ainda');
            }
        });
    });
    
    console.log('Cards únicos criados:', uniqueItems.size);
    
    // Configurar navegação
    setupMobileGalleryNavigation();
    
    console.log('✅ Galeria mobile criada com', portfolioItems.length, 'cards');
    console.log('Elemento criado:', document.querySelector('.mobile-gallery-section'));
}

// ===== NAVEGAÇÃO DA GALERIA MOBILE =====
function setupMobileGalleryNavigation() {
    const track = document.getElementById('mobile-gallery-track');
    const indicators = document.querySelectorAll('.mobile-gallery-indicator');
    const prevBtn = document.getElementById('mobile-prev');
    const nextBtn = document.getElementById('mobile-next');
    
    if (!track) return;
    
    let currentIndex = 0;
    const totalSlides = indicators.length;
    
    function updateGallery() {
        // Atualizar posição do track
        const cardWidth = track.querySelector('.mobile-gallery-card').offsetWidth;
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        
        // Atualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Atualizar botões
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex === totalSlides - 1 ? '0.5' : '1';
        
        // Adicionar haptic feedback apenas após interação do usuário
        // Removido para evitar erros de intervenção do navegador
    }
    
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
        updateGallery();
    }
    
    function nextSlide() {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateGallery();
        }
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateGallery();
        }
    }
    
    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        // Haptic feedback apenas após interação do usuário
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        // Haptic feedback apenas após interação do usuário
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    });
    
    // Swipe gestures
    let startX = 0;
    let currentX = 0;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        // Adicionar resistência visual
        if (Math.abs(diff) > 50) {
            track.style.transform = `translateX(-${currentIndex * track.querySelector('.mobile-gallery-card').offsetWidth - diff * 0.3}px)`;
        }
    });
    
    track.addEventListener('touchend', (e) => {
        const diff = startX - currentX;
        const threshold = 100;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
                // Haptic feedback apenas após interação do usuário
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            } else {
                prevSlide();
                // Haptic feedback apenas após interação do usuário
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            }
        } else {
            updateGallery(); // Voltar à posição original
        }
    });
    
    // Inicializar
    updateGallery();
    
    // Auto-play (opcional)
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (currentIndex < totalSlides - 1) {
                nextSlide();
            } else {
                currentIndex = 0;
                updateGallery();
            }
        }, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Pausar auto-play quando o usuário interage
    track.addEventListener('touchstart', stopAutoPlay);
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    
    // Iniciar auto-play
    startAutoPlay();
}

// ===== GESTÃO DA GALERIA MOBILE NO REDIMENSIONAMENTO =====
function manageMobileGallery() {
    const mobileGallery = document.querySelector('.mobile-gallery-section');
    
    if (window.innerWidth <= 768) {
        // Criar galeria mobile se não existir
        if (!mobileGallery && portfolioItems && portfolioItems.length > 0) {
            setTimeout(() => {
                initMobileGallery();
            }, 300);
        }
    } else {
        // Remover galeria mobile em desktop
        if (mobileGallery) {
            mobileGallery.remove();
            console.log('Galeria mobile removida para desktop');
        }
    }
}