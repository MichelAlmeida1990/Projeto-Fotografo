# 📋 Guia Completo: Como Receber Agendamentos

## 🎯 Métodos para Receber Notificações

### 1. **Console do Firebase (Imediato)**
- **Acesso**: https://console.firebase.google.com
- **Projeto**: `cristiane-justino-fotografia`
- **Localização**: Firestore Database → Coleção `appointments`
- **Vantagem**: Visualização em tempo real de todos os agendamentos

### 2. **Notificações por E-mail (Recomendado)**

#### **Opção A: EmailJS (Mais Fácil)**
1. Acesse: https://www.emailjs.com/
2. Crie uma conta gratuita
3. Configure um template de e-mail
4. Integre no código (instruções abaixo)

#### **Opção B: SendGrid**
1. Acesse: https://sendgrid.com/
2. Crie uma conta gratuita (100 e-mails/dia)
3. Configure SMTP
4. Integre no código

#### **Opção C: Zapier (Automático)**
1. Acesse: https://zapier.com/
2. Crie um "Zap" que conecte Firebase → Gmail
3. Configure para enviar e-mail sempre que um documento for criado

### 3. **Notificações por WhatsApp**

#### **Opção A: WhatsApp Business API**
- Requer aprovação do WhatsApp
- Mais complexo de configurar

#### **Opção B: IFTTT**
1. Acesse: https://ifttt.com/
2. Crie um applet: Firebase → WhatsApp
3. Configure para enviar mensagem automática

## 🔧 Configuração do EmailJS (Recomendado)

### Passo 1: Criar conta no EmailJS
1. Acesse: https://www.emailjs.com/
2. Clique em "Sign Up"
3. Crie uma conta gratuita

### Passo 2: Configurar Template
1. No dashboard, vá em "Email Templates"
2. Clique em "Create New Template"
3. Configure o template:

```html
<h2>🎉 Novo Agendamento Recebido!</h2>

<p><strong>Cliente:</strong> {{clientName}}</p>
<p><strong>E-mail:</strong> {{clientEmail}}</p>
<p><strong>Telefone:</strong> {{clientPhone}}</p>
<p><strong>Serviço:</strong> {{serviceType}}</p>
<p><strong>Data:</strong> {{date}}</p>
<p><strong>Mensagem:</strong> {{message}}</p>

<p>Data do agendamento: {{createdAt}}</p>
```

### Passo 3: Integrar no Código
Adicione no `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
    (function() {
        emailjs.init("SEU_USER_ID");
    })();
</script>
```

E no `firebase-config.js`:

```javascript
async function sendEmailNotification(appointmentData) {
    try {
        const templateParams = {
            clientName: appointmentData.clientName,
            clientEmail: appointmentData.clientEmail,
            clientPhone: appointmentData.clientPhone,
            serviceType: appointmentData.serviceType,
            date: appointmentData.date,
            message: appointmentData.message,
            createdAt: new Date().toLocaleString('pt-BR')
        };

        await emailjs.send(
            'SEU_SERVICE_ID',
            'SEU_TEMPLATE_ID',
            templateParams
        );

        console.log('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
    }
}
```

## 📱 Notificações Push (Opcional)

### Configurar Push Notifications
1. **Firebase Cloud Messaging**
2. **Service Workers**
3. **Notificações do navegador**

## 📊 Dashboard de Agendamentos

### Criar um Painel Administrativo
- Página privada para visualizar todos os agendamentos
- Filtros por data, status, cliente
- Exportar dados para Excel
- Marcar como confirmado/cancelado

## 🔔 Alertas em Tempo Real

### Configurar Webhooks
1. **Discord**: Bot para canal específico
2. **Slack**: Integração com workspace
3. **Telegram**: Bot para grupo/canal

## 📋 Checklist de Implementação

- [ ] Configurar EmailJS
- [ ] Testar envio de e-mails
- [ ] Configurar notificações push
- [ ] Criar dashboard administrativo
- [ ] Configurar alertas WhatsApp
- [ ] Testar todos os fluxos

## 🚀 Próximos Passos

1. **Imediato**: Configurar EmailJS para receber e-mails
2. **Curto prazo**: Criar dashboard administrativo
3. **Médio prazo**: Integrar WhatsApp Business
4. **Longo prazo**: Sistema completo de CRM

## 📞 Suporte

Para dúvidas sobre implementação:
- EmailJS: https://www.emailjs.com/docs/
- Firebase: https://firebase.google.com/docs
- WhatsApp Business: https://business.whatsapp.com/

---

**💡 Dica**: Comece com EmailJS, é gratuito e fácil de configurar! 