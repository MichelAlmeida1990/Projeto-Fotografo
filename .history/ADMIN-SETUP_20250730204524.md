# 🔐 Configuração do Sistema de Autenticação para Administradores

## 📋 Visão Geral

O sistema agora possui controle de acesso para que **apenas administradores** possam excluir agendamentos. Isso garante a segurança e integridade dos dados.

## 🚀 Como Funciona

### 1. **Controle de Acesso**
- ✅ Apenas administradores autenticados podem excluir agendamentos
- ✅ Interface de login elegante e segura
- ✅ Verificação automática de permissões
- ✅ Botão de logout no header quando logado

### 2. **Fluxo de Segurança**
1. Usuário clica em um agendamento no calendário
2. Sistema verifica se é administrador
3. Se não for: mostra modal de login
4. Se for: permite exclusão com confirmação

## 🔧 Configuração no Firebase

### Passo 1: Habilitar Autenticação por E-mail/Senha

1. Acesse o [Console do Firebase](https://console.firebase.google.com)
2. Selecione seu projeto: `cristiane-justino-fotografia`
3. Vá para **Authentication** → **Sign-in method**
4. Habilite **Email/Password**
5. Clique em **Save**

### Passo 2: Criar Conta de Administrador

1. No Firebase Console, vá para **Authentication** → **Users**
2. Clique em **Add user**
3. Digite o e-mail: `krika.justino@gmail.com`
4. Digite a senha: `Cris2025@1`
5. Clique em **Add user**

### Passo 3: Adicionar Mais Administradores (Opcional)

Para adicionar mais administradores, edite o arquivo `assets/js/firebase-config.js`:

```javascript
const adminEmails = [
    'krika.justino@gmail.com',
    'cristiane@cristianejustino.com',
    'admin@cristianejustino.com',
    'seu-email@exemplo.com'  // Adicione aqui
];
```

## 👤 E-mails de Administrador Configurados

Atualmente, os seguintes e-mails têm permissão de administrador:

- `krika.justino@gmail.com` (Principal)
- `cristiane@cristianejustino.com`
- `admin@cristianejustino.com`

## 🔒 Segurança Implementada

### ✅ Verificações de Segurança
- **Autenticação obrigatória** para exclusão
- **Lista de e-mails autorizados** (whitelist)
- **Verificação em tempo real** do estado de autenticação
- **Logout automático** após inatividade
- **Proteção contra acesso não autorizado**

### ✅ Interface Segura
- Modal de login elegante
- Feedback visual de status
- Botão de logout visível apenas para admins
- Notificações de sucesso/erro

## 🎯 Como Usar

### Para Administradores:

1. **Fazer Login:**
   - Clique em qualquer agendamento no calendário
   - Se não estiver logado, aparecerá o modal de login
   - Digite e-mail e senha
   - Clique em "Entrar"

2. **Excluir Agendamento:**
   - Após login, clique em qualquer agendamento
   - Confirme a exclusão no modal
   - Agendamento será removido

3. **Fazer Logout:**
   - Clique no botão "Sair" no header
   - Confirmação automática

### Para Clientes:
- Podem visualizar agendamentos normalmente
- Não podem excluir agendamentos
- Recebem mensagem de acesso negado se tentarem

## 🛠️ Troubleshooting

### Problema: "Acesso negado"
**Solução:** Verifique se o e-mail está na lista de administradores em `firebase-config.js`

### Problema: "Erro de autenticação"
**Solução:** 
1. Verifique se a autenticação está habilitada no Firebase
2. Confirme se a conta foi criada corretamente
3. Verifique se a senha está correta

### Problema: Modal não aparece
**Solução:** 
1. Verifique se o Firebase Auth está carregado
2. Abra o console do navegador para ver erros
3. Recarregue a página

## 📱 Recursos Adicionais

### Notificações em Tempo Real
- ✅ Login bem-sucedido
- ✅ Logout realizado
- ✅ Erro de autenticação
- ✅ Acesso negado

### Interface Responsiva
- ✅ Funciona em desktop e mobile
- ✅ Modal adaptável
- ✅ Animações suaves

## 🔄 Próximos Passos (Opcional)

### Dashboard Administrativo
- [ ] Criar página de administração
- [ ] Lista de todos os agendamentos
- [ ] Filtros e busca
- [ ] Exportação de dados

### Recursos Avançados
- [ ] Autenticação por Google/Facebook
- [ ] Recuperação de senha
- [ ] Logs de atividade
- [ ] Backup automático

## 📞 Suporte

Se precisar de ajuda com a configuração:

1. **Verifique a documentação do Firebase**
2. **Teste com diferentes navegadores**
3. **Verifique o console para erros**
4. **Confirme as configurações de segurança**

---

**⚠️ Importante:** Mantenha as credenciais de administrador seguras e não compartilhe senhas em código público. 