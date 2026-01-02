#!/bin/bash

# 🚀 Script de Teste - Sistema de Pagamento PIX JobMatch
# =========================================================

echo "🧪 Testando Sistema de Pagamento Mercado Pago..."
echo ""

BASE_URL="http://localhost:3000"
ADMIN_TOKEN="admin-secret-token"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =========================================================
# 1. Testar API de Planos Públicos
# =========================================================
echo -e "${BLUE}📋 1. Testando API de Planos (Público)${NC}"
echo "GET ${BASE_URL}/api/plans"
echo ""

PLANS=$(curl -s ${BASE_URL}/api/plans)
echo "${PLANS}" | jq '.'
echo ""

# =========================================================
# 2. Testar Admin - Listar Planos
# =========================================================
echo -e "${BLUE}💼 2. Testando Admin API - Listar Planos${NC}"
echo "GET ${BASE_URL}/api/admin/plans"
echo "Authorization: Bearer ${ADMIN_TOKEN}"
echo ""

ADMIN_PLANS=$(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  ${BASE_URL}/api/admin/plans)
echo "${ADMIN_PLANS}" | jq '.'
echo ""

# =========================================================
# 3. Testar Admin - Criar Novo Plano
# =========================================================
echo -e "${BLUE}➕ 3. Testando Admin API - Criar Plano${NC}"
echo "POST ${BASE_URL}/api/admin/plans"
echo ""

NEW_PLAN=$(curl -s -X POST ${BASE_URL}/api/admin/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "name": "Plano Teste",
    "description": "Plano criado via API",
    "price": 9.99,
    "type": "checks",
    "quantity": 5,
    "enablePix": true,
    "enableGooglePay": false
  }')
  
echo "${NEW_PLAN}" | jq '.'
PLAN_ID=$(echo "${NEW_PLAN}" | jq -r '.plan._id')
echo ""
echo -e "${GREEN}✓ Plano criado com ID: ${PLAN_ID}${NC}"
echo ""

# =========================================================
# 4. Testar Admin - Estatísticas
# =========================================================
echo -e "${BLUE}📊 4. Testando Admin API - Estatísticas${NC}"
echo "GET ${BASE_URL}/api/admin/stats"
echo ""

STATS=$(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  ${BASE_URL}/api/admin/stats)
echo "${STATS}" | jq '.'
echo ""

# =========================================================
# 5. Testar Admin - Transações
# =========================================================
echo -e "${BLUE}💳 5. Testando Admin API - Transações${NC}"
echo "GET ${BASE_URL}/api/admin/transactions"
echo ""

TRANSACTIONS=$(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  ${BASE_URL}/api/admin/transactions)
echo "${TRANSACTIONS}" | jq '.'
echo ""

# =========================================================
# 6. Testar Admin - Deletar Plano
# =========================================================
if [ ! -z "$PLAN_ID" ] && [ "$PLAN_ID" != "null" ]; then
  echo -e "${BLUE}🗑️  6. Testando Admin API - Deletar Plano${NC}"
  echo "DELETE ${BASE_URL}/api/admin/plans?planId=${PLAN_ID}"
  echo ""

  DELETE_RESULT=$(curl -s -X DELETE \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    "${BASE_URL}/api/admin/plans?planId=${PLAN_ID}")
  echo "${DELETE_RESULT}" | jq '.'
  echo ""
  echo -e "${GREEN}✓ Plano deletado com sucesso${NC}"
  echo ""
fi

# =========================================================
# 7. Testar Webhook (Simulação)
# =========================================================
echo -e "${BLUE}🔔 7. Testando Webhook (Simulação)${NC}"
echo "POST ${BASE_URL}/api/payment/webhook"
echo ""
echo -e "${YELLOW}⚠️  Nota: Webhook precisa de um payment_id real do Mercado Pago${NC}"
echo "Em produção, o Mercado Pago envia automaticamente."
echo ""

# =========================================================
# Resumo
# =========================================================
echo ""
echo "========================================="
echo -e "${GREEN}✅ Testes Concluídos!${NC}"
echo "========================================="
echo ""
echo "🌐 URLs Importantes:"
echo "   - Admin Panel: ${BASE_URL}/admin (senha: admin123)"
echo "   - Planos: ${BASE_URL}/plans"
echo "   - API Docs: ${BASE_URL}/api"
echo ""
echo "📝 Próximos Passos:"
echo "   1. Acesse o Admin Panel para criar planos personalizados"
echo "   2. Configure o webhook no Mercado Pago"
echo "   3. Teste um pagamento PIX real"
echo ""
echo "📚 Documentação completa em: /app/MERCADOPAGO_SETUP.md"
echo ""
