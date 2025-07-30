# Configuração do Firebase para Agendamento em Tempo Real

## 1. Criar Projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Nome do projeto: `cristiane-justino-fotografia`
4. Siga os passos de configuração

## 2. Configurar Firestore Database

1. No console do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha a localização mais próxima (us-east1)

## 3. Configurar Regras de Segurança

No Firestore, vá para "Regras" e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura de agendamentos
    match /appointments/{document} {
      allow read: if true;
      allow write: if true; // Em produção, adicionar autenticação
    }
    
    // Permitir leitura/escrita de disponibilidade
    match /availability/{document} {
      allow read, write: if true; // Em produção, adicionar autenticação
    }
  }
}
```

## 4. Obter Configuração do Projeto

1. No console do Firebase, clique na engrenagem (⚙️)
2. Vá para "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique em "Adicionar app" e escolha "Web"
5. Copie a configuração

## 5. Atualizar Configuração no Código

Substitua a configuração em `assets/js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "cristiane-justino-fotografia.firebaseapp.com",
    projectId: "cristiane-justino-fotografia",
    storageBucket: "cristiane-justino-fotografia.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

## 6. Funcionalidades Implementadas

### ✅ Agendamento em Tempo Real
- Verificação de disponibilidade antes de agendar
- Salvamento automático no Firebase
- Atualização em tempo real do calendário
- Prevenção de conflitos de horário

### ✅ Interface do Usuário
- Feedback visual durante o processo
- Validação em tempo real
- Notificações de sucesso/erro
- Loading states

### ✅ Segurança
- Verificação dupla de disponibilidade
- Validação de dados no frontend
- Estrutura preparada para autenticação

## 7. Estrutura dos Dados

### Collection: `appointments`
```javascript
{
    clientName: "Nome do Cliente",
    clientEmail: "email@exemplo.com",
    clientPhone: "(11) 99999-9999",
    serviceType: "Ensaio Feminino",
    date: "2024-01-15",
    message: "Mensagem opcional",
    status: "pending", // pending, confirmed, cancelled
    createdAt: Timestamp
}
```

### Collection: `availability`
```javascript
{
    available: false, // true/false
    updatedAt: Timestamp
}
```

## 8. Próximos Passos

1. **Configurar Firebase** seguindo as instruções acima
2. **Testar o sistema** de agendamento
3. **Implementar autenticação** para admin (opcional)
4. **Configurar notificações** por email/WhatsApp
5. **Deploy** em produção

## 9. Comandos para Deploy

```bash
# Fazer commit das alterações
git add .
git commit -m "Implementar agendamento em tempo real com Firebase"
git push origin main
```

## 10. Monitoramento

- Use o console do Firebase para monitorar agendamentos
- Configure alertas para novos agendamentos
- Monitore o uso do Firestore 