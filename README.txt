================================================================
Focus Compass - Scripts de Deploy
================================================================

Ordem de Execucao:

1. 1_prepare_deploy.bat
   - Prepara o projeto para deploy
   - Cria arquivos de configuracao
   - Deve ser executado PRIMEIRO

2. 5_github_setup.bat (OPCIONAL)
   - Configura GitHub
   - Faz push do codigo
   - Necessario se for usar Railway com GitHub

3. Configure MongoDB Atlas:
   - Acesse: https://www.mongodb.com/cloud/atlas
   - Crie cluster gratuito
   - Copie connection string

4. 3_setup_railway.bat
   - Configura Railway para backend
   - Gera arquivo com variaveis de ambiente
   - Fornece instrucoes para Railway

5. 2_deploy_frontend.bat
   - Faz deploy do frontend no Vercel
   - Precisa da URL do backend (Railway)

6. 4_update_env.bat
   - Atualiza variaveis de ambiente
   - Use depois que tiver URLs finais
   - Garante que frontend e backend estao sincronizados

================================================================
Pre-requisitos:
================================================================

- Node.js instalado
- Python instalado
- Git instalado
- Conta Vercel: https://vercel.com
- Conta Railway: https://railway.app
- Conta MongoDB Atlas: https://mongodb.com/cloud/atlas
- Conta GitHub (opcional): https://github.com

================================================================
CLI Tools (instalar globalmente):
================================================================

npm install -g vercel
npm install -g @railway/cli

================================================================
Custos:
================================================================

- Vercel: GRATIS
- Railway: GRATIS ($5 credito/mes) ou $5/mes
- MongoDB Atlas: GRATIS (512 MB)
- GitHub: GRATIS

TOTAL: GRATIS ou ~$5/mes

================================================================
Suporte:
================================================================

Leia o arquivo DEPLOY_GUIDE.md para instrucoes detalhadas.

================================================================
