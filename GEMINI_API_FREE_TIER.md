# Como Usar a API Gemini Gratuitamente

## Configuração Inicial

1. **Crie uma conta no Google AI Studio**

   - Acesse: https://ai.google.dev/
   - Faça login com sua conta Google
   - Crie uma chave de API gratuita

2. **Obtenha sua chave de API**
   - No Google AI Studio, vá em "Get API Key"
   - Copie a chave gerada
   - Adicione no arquivo `.env` do projeto:
     ```
     VITE_GEMINI_API_KEY=sua_chave_aqui
     ```

## Limites do Free Tier

O Google AI Studio oferece um nível gratuito com os seguintes limites:

- **60 requisições por minuto**
- **300.000 tokens diários**
- Alguns modelos de geração de imagens podem ter limites mais restritivos

## Modelos Disponíveis no Free Tier

O sistema tenta automaticamente os seguintes modelos (em ordem de prioridade):

1. **gemini-2.5-flash**

   - Modelo mais recente e estável no free tier
   - Suporta entrada multimodal (texto + imagens)
   - Disponível nas versões v1beta e v1 da API

2. **gemini-2.0-flash-001**

   - Alternativa estável
   - Suporta entrada multimodal
   - Disponível nas versões v1beta e v1 da API

3. **gemini-2.5-flash-image-preview**
   - Modelo específico para geração de imagens
   - Pode ter limites mais restritivos no free tier
   - Requer `responseModalities: ["TEXT", "IMAGE"]`

**Nota:** O sistema tenta automaticamente ambas as versões da API (v1beta e v1) caso uma falhe com erro de modelo não encontrado.

## Estratégia de Fallback

O sistema implementa uma estratégia inteligente:

1. Tenta primeiro com `responseModalities: ["TEXT", "IMAGE"]` (para geração de imagens)
2. Se falhar, tenta sem `responseModalities` (para modelos que não suportam no free tier)
3. Tenta modelos alternativos automaticamente
4. Tenta ambas as versões da API (v1beta e v1) automaticamente
5. Reduz tentativas para evitar desperdício de quota

## Monitoramento de Uso

- Acompanhe seu uso em: https://ai.dev/usage?tab=rate-limit
- Documentação completa: https://ai.google.dev/gemini-api/docs/rate-limits
- Preços e limites: https://ai.google.dev/pricing

## Dicas para Economizar Quota

1. **Aguarde o tempo de retry** quando receber erro de quota
2. **Use imagens menores** quando possível (reduz tokens)
3. **Evite múltiplas tentativas** desnecessárias
4. **Monitore seu uso diário** para não exceder 300k tokens

## Erros Comuns

### "Quota exceeded"

- Significa que você atingiu os limites do free tier
- Aguarde o tempo indicado antes de tentar novamente
- Verifique seu uso em https://ai.dev/usage?tab=rate-limit

### "Model not found for API version"

- Alguns modelos podem não estar disponíveis em certas versões da API
- O sistema tenta automaticamente a versão v1 se v1beta falhar
- O sistema também tenta modelos alternativos automaticamente

### "responseModalities not supported"

- Alguns modelos não suportam geração de imagens no free tier
- O sistema tenta automaticamente sem essa configuração

## Upgrade para Planos Pagos

Se precisar de mais capacidade:

- **Google AI Pro**: Planos pagos com limites maiores
- **Vertex AI**: Para uso empresarial
- Mais informações: https://ai.google.dev/pricing

## Suporte

- Documentação oficial: https://ai.google.dev/gemini-api/docs
- Google AI Studio: https://aistudio.google.com/
- Fórum de desenvolvedores: https://developers.googleblog.com/
