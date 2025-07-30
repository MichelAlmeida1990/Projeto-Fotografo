// ===== CONFIGURAÇÃO DO FIREBASE - EXEMPLO =====
// Copie este arquivo para firebase-config.js e substitua com suas credenciais

const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "cristiane-justino-fotografia.firebaseapp.com",
    projectId: "cristiane-justino-fotografia",
    storageBucket: "cristiane-justino-fotografia.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências do Firestore
const db = firebase.firestore();
const appointmentsCollection = db.collection('appointments');
const availabilityCollection = db.collection('availability');

// ===== FUNÇÕES DE AGENDAMENTO =====

// Carregar agendamentos existentes
async function loadAppointments() {
    try {
        const snapshot = await appointmentsCollection.get();
        const appointments = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            appointments.push({
                id: doc.id,
                title: `${data.clientName} - ${data.serviceType}`,
                start: data.date,
                end: data.date,
                backgroundColor: '#FF6B6B',
                borderColor: '#FF6B6B',
                textColor: '#FFFFFF',
                extendedProps: {
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    serviceType: data.serviceType,
                    message: data.message,
                    status: data.status || 'pending'
                }
            });
        });
        
        return appointments;
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return [];
    }
}

// Verificar disponibilidade de uma data
async function checkAvailability(date) {
    try {
        const dateStr = date.toISOString().split('T')[0];
        const doc = await availabilityCollection.doc(dateStr).get();
        
        if (doc.exists) {
            const data = doc.data();
            return data.available;
        }
        
        // Se não existe registro, considerar disponível
        return true;
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        return false;
    }
}

// Criar novo agendamento
async function createAppointment(appointmentData) {
    try {
        const docRef = await appointmentsCollection.add({
            clientName: appointmentData.clientName,
            clientEmail: appointmentData.clientEmail,
            clientPhone: appointmentData.clientPhone,
            serviceType: appointmentData.serviceType,
            date: appointmentData.date,
            message: appointmentData.message,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Marcar data como indisponível
        await markDateAsUnavailable(appointmentData.date);
        
        return {
            success: true,
            appointmentId: docRef.id
        };
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        return {
            success: false,
            error: error.message
        };
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
    }
}

// Cancelar agendamento
async function cancelAppointment(appointmentId, date) {
    try {
        await appointmentsCollection.doc(appointmentId).update({
            status: 'cancelled',
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Marcar data como disponível novamente
        await markDateAsAvailable(date);
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        return { success: false, error: error.message };
    }
}

// Listener em tempo real para agendamentos
function setupRealtimeListener(calendar) {
    appointmentsCollection.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                const event = {
                    id: change.doc.id,
                    title: `${data.clientName} - ${data.serviceType}`,
                    start: data.date,
                    end: data.date,
                    backgroundColor: '#FF6B6B',
                    borderColor: '#FF6B6B',
                    textColor: '#FFFFFF',
                    extendedProps: {
                        clientName: data.clientName,
                        clientEmail: data.clientEmail,
                        clientPhone: data.clientPhone,
                        serviceType: data.serviceType,
                        message: data.message,
                        status: data.status || 'pending'
                    }
                };
                calendar.addEvent(event);
            } else if (change.type === 'modified') {
                const data = change.doc.data();
                const event = calendar.getEventById(change.doc.id);
                if (event) {
                    event.setProp('title', `${data.clientName} - ${data.serviceType}`);
                    event.setExtendedProp('status', data.status);
                }
            } else if (change.type === 'removed') {
                const event = calendar.getEventById(change.doc.id);
                if (event) {
                    event.remove();
                }
            }
        });
    });
}

// Exportar funções para uso global
window.FirebaseAppointment = {
    loadAppointments,
    checkAvailability,
    createAppointment,
    cancelAppointment,
    setupRealtimeListener,
    markDateAsAvailable,
    markDateAsUnavailable
}; 