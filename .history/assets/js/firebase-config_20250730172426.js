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
        await markDateAsUnavailable(new Date(appointmentData.date));

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
        await markDateAsAvailable(new Date(date));
        return { success: true };
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        throw error;
    }
}

// Configurar listener em tempo real
function setupRealtimeListener(calendar) {
    appointmentsCollection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                calendar.addEvent({
                    id: change.doc.id,
                    title: `${data.clientName} - ${data.serviceType}`,
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
    setupRealtimeListener
}; 