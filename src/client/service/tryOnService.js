import axios from "axios";

/**
 * Modelos disponíveis no free tier do Google AI Studio.
 * Ordem de prioridade: modelo de geração de imagens primeiro, depois alternativas.
 *
 * Free Tier Limits (aproximados):
 * - 60 requisições por minuto
 * - 300.000 tokens diários
 * - Alguns modelos de geração de imagens podem ter limites mais restritivos
 *
 * Modelos atualizados (2024):
 * - gemini-2.5-flash-image-preview: Modelo específico para geração de imagens (PRIORIDADE)
 * - gemini-2.5-flash: Modelo mais recente (pode retornar apenas texto)
 * - gemini-2.0-flash-001: Alternativa estável (pode retornar apenas texto)
 *
 * Para mais informações: https://ai.google.dev/pricing
 * Lista de modelos: https://ai.google.dev/gemini-api/docs/models
 */
const MODEL_NAMES = [
  "gemini-2.5-flash-image-preview", // Modelo específico para geração de imagens - TENTA PRIMEIRO
  "gemini-2.5-flash", // Modelo mais recente (fallback - pode retornar apenas texto)
  "gemini-2.0-flash-001", // Alternativa estável (fallback - pode retornar apenas texto)
];

const MAX_RETRIES = 2; // Reduzido para evitar desperdício de quota no free tier

/**
 * Verifica se o erro é relacionado a quota excedida.
 */
function isQuotaError(error) {
  const errorData = error?.response?.data?.error;
  if (!errorData) return false;

  const message = errorData.message || "";
  const status = errorData.status || "";

  return (
    message.includes("quota") ||
    message.includes("Quota exceeded") ||
    status === "RESOURCE_EXHAUSTED" ||
    message.includes("free_tier")
  );
}

/**
 * Extrai o tempo de retry da mensagem de erro.
 */
function extractRetryTime(errorMessage) {
  const match = errorMessage.match(/Please retry in ([\d.]+)s/);
  return match ? Math.ceil(parseFloat(match[1])) : null;
}

/**
 * Tenta fazer a requisição com v1beta, se falhar por modelo não encontrado, tenta v1.
 */
async function tryApiRequest(modelName, payload, apiKey) {
  const apiVersions = ["v1beta", "v1"];
  let lastError = null;

  for (const version of apiVersions) {
    const apiUrl = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        return response;
      }
    } catch (error) {
      lastError = error;
      const errorData = error?.response?.data?.error;
      const errorMessage = errorData?.message || "";

      // Se o erro for de modelo não encontrado/não suportado, tenta próxima versão
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("not supported") ||
        errorMessage.includes("is not found for API version")
      ) {
        // Continua para próxima versão da API
        continue;
      }

      // Se for outro tipo de erro (quota, etc), propaga imediatamente
      throw error;
    }
  }

  // Se chegou aqui, todas as versões falharam
  throw (
    lastError ||
    new Error("Falha ao fazer requisição para todas as versões da API")
  );
}

/**
 * Gera uma imagem de prova virtual usando a API do Gemini.
 * @param {string} modelBase64 - Imagem da pessoa/modelo em base64 (sem prefixo data:).
 * @param {string} garmentBase64 - Imagem da roupa/item em base64 (sem prefixo data:).
 * @param {string} stylePrompt - Descrição opcional de estilo.
 * @param {string} apiKey - Chave da API do Gemini.
 * @returns {Promise<string>} Promessa que resolve para a URL da imagem gerada (data:image/png;base64,...).
 * @throws {Error} Se houver erro na geração.
 */
export async function generateTryOn(
  modelBase64,
  garmentBase64,
  stylePrompt = "",
  apiKey
) {
  if (!modelBase64 || !garmentBase64) {
    throw new Error("É necessário fornecer as imagens da pessoa e da roupa.");
  }

  if (!apiKey) {
    throw new Error(
      "Chave da API não fornecida. Configure VITE_GEMINI_API_KEY no arquivo .env"
    );
  }

  const defaultStylePrompt =
    "fotorrealista, alta qualidade, resolução 1200x1540, detalhes de tecido";
  const finalStylePrompt = stylePrompt.trim() || defaultStylePrompt;

  const userPrompt = `Crie uma imagem fotorrealista de virtual try-on combinando as duas imagens fornecidas. Use a primeira imagem (modelo/pessoa) para a pose, cenário e iluminação, e a segunda imagem (roupa/item) como o vestuário. O resultado deve ser o mais realista possível, como uma fotografia de estúdio. Estilo adicional: ${finalStylePrompt}.`;

  // Configurações de payload - tenta com e sem responseModalities
  // Alguns modelos podem não suportar responseModalities no free tier
  const payloads = [
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: modelBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: garmentBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    },
    // Fallback: sem responseModalities (para modelos que não suportam no free tier)
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: modelBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: garmentBase64,
              },
            },
          ],
        },
      ],
    },
  ];

  // Tenta cada modelo disponível com diferentes configurações
  let lastError = null;

  for (const modelName of MODEL_NAMES) {
    // Tenta cada configuração de payload para este modelo
    for (const payload of payloads) {
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          // Tenta fazer a requisição (tenta v1beta primeiro, depois v1 se necessário)
          const response = await tryApiRequest(modelName, payload, apiKey);

          const result = response.data;
          const candidate = result?.candidates?.[0];

          // Verifica se a resposta contém imagem
          const base64Data = candidate?.content?.parts?.find(
            (p) => p.inlineData
          )?.inlineData?.data;

          // Verifica se a resposta contém apenas texto
          const textResponse = candidate?.content?.parts?.find(
            (p) => p.text
          )?.text;

          if (!base64Data) {
            // Se a API respondeu com sucesso mas sem imagem, não continua tentando
            // Isso significa que o modelo não suporta geração de imagens ou retornou apenas texto
            if (textResponse) {
              // API respondeu com texto mas sem imagem - modelo não suporta geração de imagens
              // Cria um erro especial que indica que não devemos continuar tentando outros modelos
              const error = new Error(
                `O modelo ${modelName} retornou apenas texto, não uma imagem. Este modelo não suporta geração de imagens. Tentando próximo modelo...`
              );
              error.isTextOnlyResponse = true;
              error.modelName = modelName;
              throw error;
            }

            // Se não retornou nem imagem nem texto, pode ser que o modelo não suporte
            // Tenta próxima configuração apenas se estiver na primeira
            if (payload === payloads[0]) {
              break; // Tenta próxima configuração
            }

            throw new Error(
              "A API não retornou uma imagem válida. Este modelo pode não suportar geração de imagens no free tier."
            );
          }

          // Sucesso! Retorna a URL completa da imagem
          return `data:image/png;base64,${base64Data}`;
        } catch (error) {
          lastError = error;

          // Se a resposta foi apenas texto (sem imagem), continua para próximo modelo
          // mas não tenta mais configurações deste modelo
          if (error.isTextOnlyResponse) {
            // Este modelo não suporta geração de imagens, tenta próximo modelo
            break; // Sai do loop de payloads para tentar próximo modelo
          }

          // Se for erro de quota, para imediatamente
          if (isQuotaError(error)) {
            const errorData = error?.response?.data?.error;
            const errorMessage = errorData?.message || error.message || "";

            const retryTime = extractRetryTime(errorMessage);

            let friendlyMessage = "Quota da API excedida (Free Tier). ";
            if (retryTime) {
              friendlyMessage += `Tente novamente em aproximadamente ${retryTime} segundos. `;
            }
            friendlyMessage += "\n\nLimites do Free Tier:\n";
            friendlyMessage += "- 60 requisições por minuto\n";
            friendlyMessage += "- 300.000 tokens diários\n";
            friendlyMessage +=
              "\nVerifique seu uso em: https://ai.dev/usage?tab=rate-limit\n";
            friendlyMessage +=
              "Para mais informações: https://ai.google.dev/gemini-api/docs/rate-limits";

            throw new Error(friendlyMessage);
          }

          // Verifica se é erro de modelo não suportado
          const errorData = error?.response?.data?.error;
          const isModelError =
            errorData?.status === "INVALID_ARGUMENT" ||
            errorData?.message?.includes("not supported") ||
            errorData?.message?.includes("responseModalities") ||
            errorData?.message?.includes("IMAGE");

          // Se for erro de modelo e estamos na primeira configuração, tenta a segunda
          if (isModelError && payload === payloads[0]) {
            break; // Tenta próxima configuração (sem responseModalities)
          }

          // Se for a última tentativa para esta configuração, tenta próxima
          if (attempt === MAX_RETRIES - 1) {
            break; // Tenta próxima configuração ou próximo modelo
          }

          // Calcula o delay com exponential backoff + jitter aleatório
          attempt++;
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // Se conseguiu com esta configuração, não precisa tentar outras
      // (mas se chegou aqui sem return, foi erro - continua para próxima)
    }

    // Se foi erro de quota, para de tentar outros modelos
    const errorData = lastError?.response?.data?.error;
    const isQuotaErrorFinal =
      errorData?.message?.includes("quota") ||
      errorData?.message?.includes("Quota exceeded") ||
      errorData?.status === "RESOURCE_EXHAUSTED" ||
      errorData?.message?.includes("free_tier");

    if (isQuotaErrorFinal) {
      break; // Para o loop de modelos
    }
  }

  // Se chegou aqui, todos os modelos falharam
  const errorData = lastError?.response?.data?.error;

  // Verifica se o último erro foi de resposta apenas com texto
  if (lastError?.isTextOnlyResponse) {
    throw new Error(
      `Nenhum dos modelos testados suporta geração de imagens no free tier. ` +
        `O modelo ${lastError.modelName} retornou apenas texto. ` +
        `Tente usar o modelo gemini-2.5-flash-image-preview que é específico para geração de imagens, ` +
        `ou considere fazer upgrade para um plano pago que oferece mais modelos de geração de imagens.`
    );
  }

  const errorMessage =
    errorData?.message ||
    lastError?.message ||
    "Erro desconhecido na geração da imagem";

  throw new Error(
    `Erro de Geração após tentar ${MODEL_NAMES.length} modelo(s): ${errorMessage}`
  );
}

/**
 * Obtém informações sobre o progresso da geração (para uso futuro com polling).
 * @param {number} attempt - Número da tentativa atual.
 * @param {number} maxRetries - Número máximo de tentativas.
 * @returns {string} Mensagem de status.
 */
export function getGenerationStatus(attempt, maxRetries = MAX_RETRIES) {
  return `Geração em andamento (Tentativa ${attempt + 1}/${maxRetries})...`;
}
