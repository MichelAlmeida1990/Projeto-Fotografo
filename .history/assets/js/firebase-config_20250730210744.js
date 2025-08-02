// ===== CONFIGURAÇÃO DO FIREBASE =====
// IMPORTANTE: Substitua as credenciais abaixo pelas suas credenciais reais do Firebase
// Para obter suas credenciais:
// 1. Acesse console.firebase.google.com
// 2. Selecione seu projeto
// 3. Clique na engrenagem (⚙️) → Configurações do projeto
// 4. Role até "Seus aplicativos" e clique em "Adicionar app" → Web
// 5. Copie a configuração e substitua abaixo

const firebaseConfig = {
    apiKey: "AIzaSyB_iUzatG_vYbZRr7qMHqO3y0leBoTghcU",
    authDomain: "cristiane-justino-fotografia.firebaseapp.com",
    projectId: "cristiane-justino-fotografia",
    storageBucket: "cristiane-justino-fotografia.firebasestorage.app",
    messagingSenderId: "475947671200",
    appId: "1:475947671200:web:9d391f4f3e051ced4bf3c5",
    measurementId: "G-WC96G4XVHC"
};

// ===== INICIALIZAÇÃO DO FIREBASE =====
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

const db = firebase.firestore();
const appointmentsCollection = db.collection('appointments');
const availabilityCollection = db.collection('availability');

console.log('✅ Collections configuradas:', { appointmentsCollection, availabilityCollection });

// Inicializar Analytics (opcional)
if (typeof firebase.analytics !== 'undefined') {
    firebase.analytics();
}

// ===== FUNÇÕES DO FIREBASE =====

// Função para enviar notificação por e-mail
async function sendEmailNotification(appointmentData) {
    try {
        console.log('=== ENVIANDO E-MAIL DE NOTIFICAÇÃO ===');
        
        // Verificar se o EmailJS está disponível
        if (typeof emailjs === 'undefined') {
            console.log('EmailJS não está disponível');
            return;
        }
        
        const templateParams = {
            clientName: appointmentData.clientName,
            clientEmail: appointmentData.clientEmail,
            clientPhone: appointmentData.clientPhone,
            serviceType: appointmentData.serviceType,
            date: appointmentData.date,
            time: appointmentData.time ? getTimeText(appointmentData.time) : '',
            message: appointmentData.message,
            createdAt: new Date().toLocaleString('pt-BR')
        };

        const result = await emailjs.send(
            'service_g2cr22t',
            'template_71hujhc',
            templateParams
        );

        console.log('✅ E-mail enviado com sucesso!');
        console.log('Resultado:', result);
        
    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        console.log('=== DETALHES DO AGENDAMENTO ===');
        console.log('Cliente:', appointmentData.clientName);
        console.log('E-mail:', appointmentData.clientEmail);
        console.log('Telefone:', appointmentData.clientPhone);
        console.log('Serviço:', appointmentData.serviceType);
        console.log('Data:', appointmentData.date);
        console.log('Horário:', appointmentData.time);
        console.log('Mensagem:', appointmentData.message);
        console.log('================================');
    }
}

// Carregar agendamentos existentes
async function loadAppointments() {
    try {
        const snapshot = await appointmentsCollection.get();
        const appointments = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const timeText = data.time ? ` (${getTimeText(data.time)})` : '';
            appointments.push({
                id: doc.id,
                title: `Agendado${timeText}`,
                start: data.date,
                backgroundColor: '#FF0000',
                borderColor: '#FF0000',
                textColor: '#FFFFFF',
                extendedProps: {
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    serviceType: data.serviceType,
                    time: data.time,
                    message: data.message,
                    status: data.status
                }
            });
        });
        
        // Adicionar eventos para segundas e sextas (dias não disponíveis)
        const unavailableDays = generateUnavailableDays();
        appointments.push(...unavailableDays);
        
        return appointments;
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        throw error;
    }
}

// Função auxiliar para converter código de horário em texto
function getTimeText(time) {
    switch(time) {
        case 'manha': return 'Manhã';
        case 'tarde': return 'Tarde';
        case 'noite': return 'Noite';
        default: return time;
    }
}

// Gerar eventos para dias não disponíveis (segundas e sextas)
function generateUnavailableDays() {
    const events = [];
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(currentDate.getFullYear() + 1); // Próximo ano
    
    const current = new Date(currentDate);
    
    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        
        // Segunda-feira (1) ou Sexta-feira (5)
        if (dayOfWeek === 1 || dayOfWeek === 5) {
            const dateStr = current.toISOString().split('T')[0];
            events.push({
                id: `unavailable-${dateStr}`,
                title: 'Não Atendemos',
                start: dateStr,
                backgroundColor: '#666666',
                borderColor: '#666666',
                textColor: '#FFFFFF',
                allDay: true,
                extendedProps: {
                    unavailable: true,
                    reason: dayOfWeek === 1 ? 'Segunda-feira' : 'Sexta-feira'
                }
            });
        }
        
        current.setDate(current.getDate() + 1);
    }
    
    return events;
}

// Verificar disponibilidade de uma data
async function checkAvailability(date) {
    try {
        console.log('=== FIREBASE checkAvailability ===');
        console.log('Data recebida:', date);
        console.log('Tipo da data:', typeof date);
        
        const dateStr = date.toISOString().split('T')[0];
        console.log('Data formatada para consulta:', dateStr);
        
        // Verificar se é segunda-feira (1) ou sexta-feira (5)
        const dayOfWeek = date.getDay();
        console.log('Dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado):', dayOfWeek);
        
        if (dayOfWeek === 1 || dayOfWeek === 5) {
            console.log('Segunda ou Sexta - não atendemos - retornando false');
            return false;
        }
        
        // Verificar se há agendamentos para esta data
        console.log('Verificando agendamentos existentes...');
        const appointments = await appointmentsCollection
            .where('date', '==', dateStr)
            .get();
        
        const appointmentCount = appointments.size;
        console.log('Número de agendamentos para esta data:', appointmentCount);
        
        // Se já tem 3 agendamentos, a data está lotada
        if (appointmentCount >= 3) {
            console.log('Data lotada (3 agendamentos) - retornando false');
            return false;
        }
        
        // Se não há registro de disponibilidade nem agendamentos, a data está disponível
        console.log('Data disponível - retornando true');
        return true;
        
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        // Em caso de erro, retornar true (disponível) para não bloquear a seleção
        console.log('Erro - retornando true (disponível)');
        return true;
    }
}

// Criar novo agendamento
async function createAppointment(appointmentData) {
    try {
        // Verificar disponibilidade do horário específico
        let checkDate;
        if (appointmentData.date.includes('-')) {
            const [year, month, day] = appointmentData.date.split('-').map(Number);
            checkDate = new Date(year, month - 1, day);
        } else {
            checkDate = new Date(appointmentData.date);
        }
        
        const timeAvailability = await checkTimeAvailability(checkDate, appointmentData.time);
        if (!timeAvailability.available) {
            return { success: false, error: timeAvailability.reason };
        }

        // Salvar agendamento
        const docRef = await appointmentsCollection.add({
            ...appointmentData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        
        // Tentar enviar notificação por e-mail (não bloquear se falhar)
        try {
            await sendEmailNotification(appointmentData);
        } catch (emailError) {
            console.error('Erro ao enviar e-mail de notificação:', emailError);
            // Não bloquear o agendamento se o e-mail falhar
        }

        return { success: true, appointmentId: docRef.id };
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        return { success: false, error: error.message };
    }
}

// Verificar disponibilidade de horário específico
async function checkTimeAvailability(date, time) {
    try {
        console.log('=== FIREBASE checkTimeAvailability ===');
        console.log('Data:', date);
        console.log('Horário:', time);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Verificar se é segunda-feira (1) ou sexta-feira (5)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 1 || dayOfWeek === 5) {
            return { available: false, reason: 'Dia não disponível' };
        }
        
        // Verificar agendamentos para esta data e horário
        const appointments = await appointmentsCollection
            .where('date', '==', dateStr)
            .where('time', '==', time)
            .get();
        
        if (!appointments.empty) {
            return { available: false, reason: 'Horário já ocupado' };
        }
        
        // Verificar se já tem 3 agendamentos para esta data
        const allAppointments = await appointmentsCollection
            .where('date', '==', dateStr)
            .get();
        
        if (allAppointments.size >= 3) {
            return { available: false, reason: 'Dia lotado (máximo 3 agendamentos)' };
        }
        
        return { available: true };
    } catch (error) {
        console.error('Erro ao verificar disponibilidade de horário:', error);
        return { available: false, reason: 'Erro ao verificar disponibilidade' };
    }
}

// Marcar data como indisponível
async function markDateAsUnavailable(date) {
    try {
        const dateStr = date.toISOString().split('T')[0];
        await availabilityCollection.doc(dateStr).set({
            available: false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao marcar data como indisponível:', error);
        throw error;
    }
}

// Marcar data como disponível
async function markDateAsAvailable(date) {
    try {
        const dateStr = date.toISOString().split('T')[0];
        await availabilityCollection.doc(dateStr).set({
            available: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao marcar data como disponível:', error);
        throw error;
    }
}

// Cancelar agendamento
async function cancelAppointment(appointmentId, date) {
    try {
        await appointmentsCollection.doc(appointmentId).delete();
        
        // Criar a data corretamente para o timezone local
        let checkDate;
        if (date.includes('-')) {
            const [year, month, day] = date.split('-').map(Number);
            checkDate = new Date(year, month - 1, day);
        } else {
            checkDate = new Date(date);
        }
        
        await markDateAsAvailable(checkDate);
        return { success: true };
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        throw error;
    }
}

// Configurar listener em tempo real
function setupRealtimeListener(calendar) {
    let isInitialLoad = true;
    
    appointmentsCollection.onSnapshot(snapshot => {
        // Se for o carregamento inicial, adicionar todos os eventos de uma vez
        if (isInitialLoad) {
            const events = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                events.push({
                    id: doc.id,
                    title: 'Agendado',
                    start: data.date,
                    backgroundColor: '#FF0000',
                    borderColor: '#FF0000',
                    textColor: '#FFFFFF',
                    extendedProps: {
                        clientName: data.clientName,
                        clientEmail: data.clientEmail,
                        clientPhone: data.clientPhone,
                        serviceType: data.serviceType,
                        message: data.message,
                        status: data.status
                    }
                });
            });
            
            if (events.length > 0) {
                calendar.addEventSource(events);
            }
            
            isInitialLoad = false;
            return;
        }
        
        // Para mudanças subsequentes, processar apenas as mudanças
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                calendar.addEvent({
                    id: change.doc.id,
                    title: 'Agendado',
                    start: data.date,
                    backgroundColor: '#FF0000',
                    borderColor: '#FF0000',
                    textColor: '#FFFFFF',
                    extendedProps: {
                        clientName: data.clientName,
                        clientEmail: data.clientEmail,
                        clientPhone: data.clientPhone,
                        serviceType: data.serviceType,
                        message: data.message,
                        status: data.status
                    }
                });
            } else if (change.type === 'removed') {
                calendar.getEventById(change.doc.id)?.remove();
            }
        });
    });
}

// ===== EXPORTAR FUNÇÕES =====
window.FirebaseAppointment = {
    loadAppointments,
    checkAvailability,
    checkTimeAvailability,
    createAppointment,
    markDateAsUnavailable,
    markDateAsAvailable,
    cancelAppointment,
    setupRealtimeListener,
    sendEmailNotification
}; 

// ===== SISTEMA DE AUTENTICAÇÃO PARA ADMINISTRADORES =====

// Verificar se o usuário está autenticado como administrador
async function isAdminAuthenticated() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            return false;
        }
        
        // Verificar se o e-mail está na lista de administradores
        const adminEmails = [
            'krika.justino@gmail.com',
            'cristiane@cristianejustino.com',
            'admin@cristianejustino.com'
            // Adicione mais e-mails de administradores aqui
        ];
        
        return adminEmails.includes(user.email);
    } catch (error) {
        console.error('Erro ao verificar autenticação de admin:', error);
        return false;
    }
}

// Fazer login como administrador
async function adminLogin(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Verificar se é um administrador
        const isAdmin = await isAdminAuthenticated();
        if (!isAdmin) {
            await firebase.auth().signOut();
            throw new Error('Acesso negado. Apenas administradores podem fazer login.');
        }
        
        console.log('Login de administrador realizado com sucesso:', user.email);
        return { success: true, user: user };
    } catch (error) {
        console.error('Erro no login de administrador:', error);
        return { success: false, error: error.message };
    }
}

// Fazer logout
async function adminLogout() {
    try {
        await firebase.auth().signOut();
        console.log('Logout realizado com sucesso');
        return { success: true };
    } catch (error) {
        console.error('Erro no logout:', error);
        return { success: false, error: error.message };
    }
}

// Função modificada para cancelar agendamento (apenas administradores)
async function cancelAppointmentAsAdmin(appointmentId, date) {
    try {
        // Verificar se o usuário está autenticado como administrador
        const isAdmin = await isAdminAuthenticated();
        if (!isAdmin) {
            throw new Error('Acesso negado. Apenas administradores podem excluir agendamentos.');
        }
        
        // Se chegou até aqui, é um administrador autenticado
        await appointmentsCollection.doc(appointmentId).delete();
        
        // Criar a data corretamente para o timezone local
        let checkDate;
        if (date.includes('-')) {
            const [year, month, day] = date.split('-').map(Number);
            checkDate = new Date(year, month - 1, day);
        } else {
            checkDate = new Date(date);
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        throw error;
    }
}

// Expor funções para uso global
window.FirebaseAuth = {
    adminLogin,
    adminLogout,
    isAdminAuthenticated,
    cancelAppointmentAsAdmin
}; 