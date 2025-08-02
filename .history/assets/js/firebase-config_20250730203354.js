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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const appointmentsCollection = db.collection('appointments');
const availabilityCollection = db.collection('availability');

// Inicializar Analytics (opcional)
if (typeof firebase.analytics !== 'undefined') {
    firebase.analytics();
}

// ===== FUNÇÕES DO FIREBASE =====

// Função para enviar notificação por e-mail
async function sendEmailNotification(appointmentData) {
    try {
        console.log('=== ENVIANDO E-MAIL DE NOTIFICAÇÃO ===');
        
        const templateParams = {
            clientName: appointmentData.clientName,
            clientEmail: appointmentData.clientEmail,
            clientPhone: appointmentData.clientPhone,
            serviceType: appointmentData.serviceType,
            date: appointmentData.date,
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
                    appointments.push({
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
        return appointments;
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        throw error;
    }
}

// Verificar disponibilidade de uma data
async function checkAvailability(date) {
    try {
        console.log('=== FIREBASE checkAvailability ===');
        console.log('Data recebida:', date);
        console.log('Tipo da data:', typeof date);
        
        const dateStr = date.toISOString().split('T')[0];
        console.log('Data formatada para consulta:', dateStr);
        
        // Primeiro, verificar se há agendamentos para esta data
        console.log('Verificando agendamentos existentes...');
        const appointments = await appointmentsCollection
            .where('date', '==', dateStr)
            .get();
        
        const hasAppointments = !appointments.empty;
        console.log('Há agendamentos para esta data:', hasAppointments);
        
        if (hasAppointments) {
            console.log('Data ocupada - retornando false');
            return false;
        }
        
        // Se não há agendamentos, verificar se há registro de disponibilidade
        console.log('Verificando registro de disponibilidade...');
        const availabilityDoc = await availabilityCollection.doc(dateStr).get();
        console.log('Documento de disponibilidade existe:', availabilityDoc.exists);
        
        if (availabilityDoc.exists) {
            const isAvailable = availabilityDoc.data().available;
            console.log('Disponibilidade do documento:', isAvailable);
            return isAvailable;
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
        // Verificar disponibilidade novamente antes de salvar
        // Criar a data corretamente para o timezone local
        let checkDate;
        if (appointmentData.date.includes('-')) {
            const [year, month, day] = appointmentData.date.split('-').map(Number);
            checkDate = new Date(year, month - 1, day);
        } else {
            checkDate = new Date(appointmentData.date);
        }
        const isAvailable = await checkAvailability(checkDate);
        if (!isAvailable) {
            return { success: false, error: 'Data não está mais disponível' };
        }

        // Salvar agendamento
        const docRef = await appointmentsCollection.add({
            ...appointmentData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });

        // Marcar data como indisponível
        await markDateAsUnavailable(checkDate);
        
        // Enviar notificação por e-mail
        await sendEmailNotification(appointmentData);

        return { success: true, appointmentId: docRef.id };
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        throw error;
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