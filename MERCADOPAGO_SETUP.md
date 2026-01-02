# 🚀 Sistema de Pagamento PIX - Mercado Pago JobMatch

## ✅ Implementação Completa

Este documento descreve o sistema de pagamento PIX integrado com Mercado Pago para a aplicação JobMatch.

---

## 📋 Funcionalidades Implementadas

### 1. **Admin Panel - Gerenciamento de Planos**
- ✅ Interface completa para criar/editar/deletar planos
- ✅ Sistema dinâmico de planos com configurações:
  - **Preço**: Valor em R$
  - **Tipo**: Check, Checks, Dia, Dias, Mês, Meses, Ano, Anos, Vitalício
  - **Quantidade**: Para tipos plurais (ex: 10 checks, 3 meses)
  - **Toggles individuais**: 
    - Habilitar/Desabilitar PIX por plano
    - Habilitar/Desabilitar Google Pay por plano

### 2. **Sistema de Pagamento PIX**
- ✅ Integração completa com Mercado Pago SDK
- ✅ Geração automática de QR Code PIX
- ✅ Código Copia e Cola
- ✅ Verificação automática de status (polling a cada 5 segundos)
- ✅ Timer de expiração (30 minutos)
- ✅ Webhook para notificações do Mercado Pago

### 3. **Interface de Usuário**
- ✅ Modal de pagamento com tabs (PIX / Google Pay)
- ✅ Exibição de QR Code e código Copia e Cola
- ✅ Instruções passo a passo
- ✅ Feedback visual do status do pagamento
- ✅ Suporte multi-idioma (PT-BR / EN)

### 4. **Backend APIs**
- ✅ `/api/admin/plans` - CRUD de planos
- ✅ `/api/admin/settings` - Configurações de pagamento
- ✅ `/api/admin/stats` - Estatísticas do sistema
- ✅ `/api/admin/transactions` - Histórico de transações
- ✅ `/api/payment/mercadopago` - Criar e verificar pagamentos
- ✅ `/api/payment/webhook` - Receber notificações do MP

---

## 🔧 Configuração

### **Credenciais Mercado Pago**

As credenciais já estão configuradas no arquivo `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3595746059942621-082712-a66b43c5eef3e27189815df67f6bfeb4-2655345330
MERCADOPAGO_PUBLIC_KEY=APP_USR-601547e8-10ae-4515-bbff-30eb7ffd0fd1
GEMINI_API_KEY=AIzaSyCog7QYLOesQDO66S61ji3WKEEoVDI2E2M
```

### **Webhook URL**

Configure no painel do Mercado Pago:

```
https://pix-gateway-15.preview.emergentagent.com/api/payment/webhook
```

**Passos para configurar:**
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Integrações → Webhooks**
3. Clique em **Adicionar Webhook**
4. Cole a URL acima
5. Selecione o evento: **payment**
6. Salve

---

## 📱 Como Usar

### **Para Administradores:**

1. **Acessar Admin Panel:**
   ```
   URL: /admin
   Senha: admin123
   ```

2. **Criar Novo Plano:**
   - Clique na aba "💳 Planos e Pagamentos"
   - Preencha os campos:
     - Nome do Plano
     - Preço (R$)
     - Tipo (dropdown)
     - Quantidade (se plural)
   - Ative/Desative PIX e Google Pay
   - Clique em "Adicionar Plano"

3. **Configurar Webhook:**
   - Vá na aba "⚙️ Configurações"
   - Copie a Webhook URL
   - Configure no painel do Mercado Pago

4. **Visualizar Transações:**
   - Aba "📊 Transações"
   - Veja histórico completo de pagamentos
   - Status: approved, pending, rejected

### **Para Usuários:**

1. **Escolher Plano:**
   ```
   URL: /plans
   ```

2. **Selecionar Método de Pagamento:**
   - Clique em "Pagar com Pix" (se habilitado)
   - OU "Google Play" (se habilitado)

3. **Pagar via PIX:**
   - Escaneie o QR Code
   - OU copie o código e cole no app do banco
   - Aguarde confirmação automática (5-10 segundos)

---

## 🗂️ Estrutura de Arquivos

```
/app
├── .env                                    # Credenciais
├── lib/
│   ├── mercadopago.js                      # SDK e funções do MP
│   └── mongodb.js                          # Conexão com MongoDB
├── components/
│   ├── AdminPlansManager.jsx               # Gerenciador de planos
│   └── PaymentModal.jsx                    # Modal de pagamento
├── app/
│   ├── admin/page.js                       # Admin dashboard
│   ├── plans/page.js                       # Página de planos
│   └── api/
│       ├── admin/
│       │   ├── plans/route.js              # CRUD planos
│       │   ├── settings/route.js           # Configurações
│       │   ├── stats/route.js              # Estatísticas
│       │   └── transactions/route.js       # Transações
│       ├── payment/
│       │   ├── mercadopago/route.js        # Pagamentos PIX
│       │   └── webhook/route.js            # Webhook MP
│       └── plans/route.js                  # API pública de planos
```

---

## 🎯 Tipos de Planos Suportados

| Tipo       | Descrição              | Exemplo                    |
|------------|------------------------|----------------------------|
| `check`    | 1 verificação          | R$ 0,50 / check            |
| `checks`   | N verificações         | R$ 4,50 / 10 checks        |
| `day`      | 1 dia                  | R$ 0,99 / dia              |
| `days`     | N dias                 | R$ 4,90 / 7 dias           |
| `month`    | 1 mês                  | R$ 29,90 / mês             |
| `months`   | N meses                | R$ 79,90 / 3 meses         |
| `year`     | 1 ano                  | R$ 299,90 / ano            |
| `years`    | N anos                 | R$ 499,90 / 2 anos         |
| `lifetime` | Vitalício              | R$ 999,00 - Vitalício      |

---

## 💾 Banco de Dados (MongoDB)

### **Collections:**

#### `plans`
```javascript
{
  _id: ObjectId,
  name: String,                    // Nome do plano
  description: String,             // Descrição opcional
  price: Number,                   // Preço em R$
  type: String,                    // check, checks, day, days, etc.
  quantity: Number,                // Quantidade (para plurais)
  enablePix: Boolean,              // PIX habilitado?
  enableGooglePay: Boolean,        // Google Pay habilitado?
  active: Boolean,                 // Plano ativo?
  createdAt: Date,
  updatedAt: Date
}
```

#### `transactions`
```javascript
{
  _id: ObjectId,
  userId: String,                  // ID do usuário
  planId: String,                  // ID do plano
  paymentId: String,               // ID do pagamento (MP)
  amount: Number,                  // Valor pago
  status: String,                  // pending, approved, rejected
  paymentMethod: String,           // pix, googlepay
  qrCode: String,                  // Código PIX Copia e Cola
  qrCodeBase64: String,            // QR Code em base64
  expiresAt: Date,                 // Data de expiração
  createdAt: Date,
  updatedAt: Date
}
```

#### `users`
```javascript
{
  _id: ObjectId,
  email: String,
  plan: String,                    // Nome do plano atual
  availableChecks: Number,         // Checks disponíveis
  planExpiresAt: Date,             // Data de expiração do plano
  lifetimeAccess: Boolean,         // Acesso vitalício?
  ...
}
```

---

## 🔄 Fluxo de Pagamento PIX

```mermaid
sequenceDiagram
    User->>Frontend: Seleciona plano
    Frontend->>API: POST /api/payment/mercadopago
    API->>MercadoPago: Cria pagamento PIX
    MercadoPago->>API: Retorna QR Code
    API->>MongoDB: Salva transação
    API->>Frontend: QR Code + ID pagamento
    Frontend->>User: Exibe QR Code
    User->>Banco: Paga via PIX
    Banco->>MercadoPago: Confirma pagamento
    MercadoPago->>API: POST /api/payment/webhook
    API->>MongoDB: Atualiza transação
    API->>MongoDB: Atualiza plano do usuário
    Frontend->>API: Polling GET /api/payment/mercadopago?payment_id=X
    API->>Frontend: Status: approved
    Frontend->>User: Pagamento confirmado!
```

---

## 🧪 Testando o Sistema

### 1. **Testar Admin Panel**
```bash
# Acessar
URL: https://pix-gateway-15.preview.emergentagent.com/admin
Senha: admin123

# Criar plano de teste
Nome: Teste PIX
Preço: 0.50
Tipo: check
Toggles: PIX ON
```

### 2. **Testar Pagamento PIX (Sandbox)**
```bash
# Mercado Pago fornece cartões de teste
# Mas para PIX em teste, você pode:

# 1. Criar plano
# 2. Ir em /plans
# 3. Clicar em "Pagar com Pix"
# 4. Copiar QR Code
# 5. Simular pagamento (ambiente test)
```

### 3. **Testar Webhook**
```bash
# Simular webhook manualmente
curl -X POST https://pix-gateway-15.preview.emergentagent.com/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "PAYMENT_ID_AQUI"
    }
  }'
```

---

## 🚨 Troubleshooting

### **Problema: QR Code não aparece**
- Verificar credenciais no `.env`
- Verificar logs: `tail -f /var/log/supervisor/nextjs.out.log`

### **Problema: Webhook não funciona**
- Verificar URL configurada no Mercado Pago
- Verificar se o domínio é acessível publicamente
- Testar manualmente com curl

### **Problema: Status não atualiza**
- Polling acontece a cada 5 segundos
- Verificar se webhook está configurado
- Verificar logs do Mercado Pago

---

## 🎨 Personalizações Futuras

### Sugestões de melhorias:

1. **Dashboard com gráficos**
   - Receita por período
   - Planos mais vendidos
   - Taxa de conversão

2. **Sistema de cupons**
   - Descontos percentuais
   - Códigos promocionais

3. **Notificações por email**
   - Confirmação de pagamento
   - Recibo automático

4. **Planos recorrentes**
   - Assinaturas mensais automáticas
   - Renovação automática

5. **Multi-moeda**
   - USD, EUR, etc.
   - Conversão automática

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verificar logs: `/var/log/supervisor/nextjs.out.log`
2. Verificar MongoDB: Coleções `plans`, `transactions`, `users`
3. Verificar Mercado Pago: https://www.mercadopago.com.br/developers/panel

---

## ✅ Checklist de Produção

Antes de ir para produção:

- [ ] Alterar senha do admin (admin123)
- [ ] Configurar credenciais de PRODUÇÃO do Mercado Pago
- [ ] Configurar webhook no ambiente de produção
- [ ] Testar fluxo completo com pagamento real
- [ ] Configurar certificado SSL (HTTPS)
- [ ] Monitorar logs de erro
- [ ] Configurar backup do MongoDB
- [ ] Implementar rate limiting nas APIs
- [ ] Adicionar analytics de conversão

---

**Sistema desenvolvido com ❤️ para JobMatch**

*Última atualização: Janeiro 2025*
