/**
 * Converte um arquivo File em uma string Base64.
 * @param {File} file - O objeto File a ser codificado.
 * @returns {Promise<string>} Promessa que resolve para a string Base64 (sem o prefixo data:).
 * @throws {Error} Se houver erro ao ler o arquivo.
 */
export function base64EncodeFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error("Arquivo inválido"));
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("O arquivo deve ser uma imagem"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Remove o prefixo "data:image/...;base64,"
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      } catch (error) {
        reject(new Error(`Erro ao processar o arquivo: ${error.message}`));
      }
    };
    reader.onerror = (error) => {
      reject(
        new Error(
          `Erro ao ler o arquivo: ${error.message || "Erro desconhecido"}`
        )
      );
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem válida.
 * @param {File} file - O arquivo a ser validado.
 * @returns {boolean} True se for uma imagem válida.
 */
export function isValidImageFile(file) {
  if (!file) return false;
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return validTypes.includes(file.type);
}

/**
 * Cria uma URL de objeto para preview da imagem.
 * @param {File} file - O arquivo a ser convertido.
 * @returns {string} URL do objeto.
 */
export function createImagePreviewUrl(file) {
  if (!file || !isValidImageFile(file)) {
    return null;
  }
  return URL.createObjectURL(file);
}

/**
 * Revoga uma URL de objeto para liberar memória.
 * @param {string} url - A URL a ser revogada.
 */
export function revokeImagePreviewUrl(url) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
