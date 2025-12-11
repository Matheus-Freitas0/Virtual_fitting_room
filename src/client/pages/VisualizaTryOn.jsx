import { useState, useCallback, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  LinearProgress,
  Avatar,
  Stack,
} from "@mui/material";
import ImageDropzone from "../components/ImageDropzone";
import ResultDisplay from "../components/ResultDisplay";
import { generateTryOn } from "../service/tryOnService";
import { revokeImagePreviewUrl } from "../utils/imageUtils";

const STYLE_SUGGESTIONS = [
  "Iluminação de estúdio profissional, pose em 3/4, fundo cinza sólido.",
  "Cenário de rua noturna, luzes de neon vibrantes, pose descontraída.",
  "Dia de sol na praia, roupa de verão, perspectiva de ângulo baixo, super fotorrealista.",
  "Ambiente minimalista e limpo, modelo olhando diretamente para a câmera, estilo editorial de revista.",
  "Efeito de luz dourada do pôr do sol, sombra suave, alta resolução e profundidade de campo.",
];

export default function VisualizaTryOn() {
  const [modelBase64, setModelBase64] = useState(null);
  const [garmentBase64, setGarmentBase64] = useState(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState(null);
  const [garmentPreviewUrl, setGarmentPreviewUrl] = useState(null);
  const [stylePrompt, setStylePrompt] = useState("");
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [status, setStatus] = useState({ message: "", type: "info", show: false });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Limpa o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Gerencia o contador de retry
  useEffect(() => {
    if (retryCountdown !== null && retryCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (retryCountdown === 0) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setRetryCountdown(null);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [retryCountdown]);

  const handleModelFileSelect = useCallback((file, base64, error, previewUrl) => {
    if (error) {
      setStatus({
        message: error.message || "Erro ao processar a imagem da pessoa.",
        type: "error",
        show: true,
      });
      return;
    }

    if (base64 && previewUrl) {
      // Revoga URL anterior se existir
      if (modelPreviewUrl) {
        revokeImagePreviewUrl(modelPreviewUrl);
      }
      setModelBase64(base64);
      setModelPreviewUrl(previewUrl);
      setStatus({
        message: "Imagens prontas! Clique em GERAR.",
        type: "success",
        show: true,
      });
    }
  }, [modelPreviewUrl]);

  const handleGarmentFileSelect = useCallback((file, base64, error, previewUrl) => {
    if (error) {
      setStatus({
        message: error.message || "Erro ao processar a imagem da roupa.",
        type: "error",
        show: true,
      });
      return;
    }

    if (base64 && previewUrl) {
      // Revoga URL anterior se existir
      if (garmentPreviewUrl) {
        revokeImagePreviewUrl(garmentPreviewUrl);
      }
      setGarmentBase64(base64);
      setGarmentPreviewUrl(previewUrl);
      setStatus({
        message: "Imagens prontas! Clique em GERAR.",
        type: "success",
        show: true,
      });
    }
  }, [garmentPreviewUrl]);

  const handleRemoveModel = useCallback(() => {
    if (modelPreviewUrl) {
      revokeImagePreviewUrl(modelPreviewUrl);
    }
    setModelBase64(null);
    setModelPreviewUrl(null);
    updateGenerateButton();
  }, [modelPreviewUrl]);

  const handleRemoveGarment = useCallback(() => {
    if (garmentPreviewUrl) {
      revokeImagePreviewUrl(garmentPreviewUrl);
    }
    setGarmentBase64(null);
    setGarmentPreviewUrl(null);
    updateGenerateButton();
  }, [garmentPreviewUrl]);

  const updateGenerateButton = useCallback(() => {
    const ready = modelBase64 && garmentBase64;
    if (!ready) {
      setStatus({
        message: "",
        type: "info",
        show: false,
      });
    }
  }, [modelBase64, garmentBase64]);

  const handleStyleSuggestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * STYLE_SUGGESTIONS.length);
    setStylePrompt(STYLE_SUGGESTIONS[randomIndex]);
    setStatus({
      message: "Sugestão de estilo aplicada.",
      type: "info",
      show: true,
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!modelBase64 || !garmentBase64) {
      setStatus({
        message: "Erro: É necessário fazer o upload da imagem da pessoa e da roupa.",
        type: "error",
        show: true,
      });
      return;
    }

    if (!apiKey) {
      setStatus({
        message: "Erro: Chave da API não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env",
        type: "error",
        show: true,
      });
      return;
    }

    setIsGenerating(true);
    setProgress(true);
    setStatus({
      message: "Geração em andamento...",
      type: "info",
      show: true,
    });
    setResultImageUrl(null);

    try {
      const imageUrl = await generateTryOn(
        modelBase64,
        garmentBase64,
        stylePrompt,
        apiKey
      );

      setResultImageUrl(imageUrl);
      setStatus({
        message: "Prova Virtual gerada com sucesso!",
        type: "success",
        show: true,
      });
    } catch (error) {
      // Extrai o tempo de retry da mensagem de erro
      const retryMatch = error.message.match(/Tente novamente em aproximadamente (\d+) segundos/);
      const retryTime = retryMatch ? parseInt(retryMatch[1], 10) : null;

      if (retryTime) {
        setRetryCountdown(retryTime);
      }

      setStatus({
        message: `Erro de Geração: ${error.message}`,
        type: "error",
        show: true,
      });
      setResultImageUrl(null);
    } finally {
      setIsGenerating(false);
      setProgress(false);
    }
  }, [modelBase64, garmentBase64, stylePrompt, apiKey]);

  const handleDownload = useCallback(() => {
    if (!resultImageUrl) return;

    const link = document.createElement("a");
    link.href = resultImageUrl;
    link.download = "visualiza-tryon.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImageUrl]);

  const handleReset = useCallback(() => {
    if (modelPreviewUrl) {
      revokeImagePreviewUrl(modelPreviewUrl);
    }
    if (garmentPreviewUrl) {
      revokeImagePreviewUrl(garmentPreviewUrl);
    }

    // Limpa o contador de retry
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setModelBase64(null);
    setGarmentBase64(null);
    setModelPreviewUrl(null);
    setGarmentPreviewUrl(null);
    setStylePrompt("");
    setResultImageUrl(null);
    setStatus({ message: "", type: "info", show: false });
    setProgress(false);
    setRetryCountdown(null);
  }, [modelPreviewUrl, garmentPreviewUrl]);

  const canGenerate = modelBase64 && garmentBase64 && !isGenerating && retryCountdown === null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box textAlign="center" mb={6} pb={3} borderBottom="1px solid" borderColor="divider">
        <Typography variant="h1" color="primary.dark" mb={2}>
          Visualiza AI: Seu Provador Virtual
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth="md" mx="auto">
          Transforme suas ideias em realidade fotorrealista. Basta enviar a foto de uma pessoa
          e a imagem de uma roupa para gerar o resultado final de alta qualidade.
        </Typography>
      </Box>

      {/* Conteúdo Principal */}
      <Grid container spacing={4}>
        {/* Coluna de Controle (Input) */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h2" color="primary.dark" mb={3} pb={2} borderBottom="2px solid" borderColor="primary.light">
              Etapas de Geração (3 Passos)
            </Typography>

            <Stack spacing={4}>
              {/* Passo 1: Imagem da Modelo */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    1
                  </Avatar>
                  <Typography variant="h3" color="text.primary">
                    Upload da Pessoa/Modelo
                  </Typography>
                </Stack>
                <ImageDropzone
                  label="Upload da Pessoa/Modelo"
                  type="person"
                  onFileSelect={handleModelFileSelect}
                  previewUrl={modelPreviewUrl}
                  onRemove={handleRemoveModel}
                />
              </Box>

              {/* Passo 2: Imagem da Roupa */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    2
                  </Avatar>
                  <Typography variant="h3" color="text.primary">
                    Upload da Roupa/Item
                  </Typography>
                </Stack>
                <ImageDropzone
                  label="Upload da Roupa/Item"
                  type="garment"
                  onFileSelect={handleGarmentFileSelect}
                  previewUrl={garmentPreviewUrl}
                  onRemove={handleRemoveGarment}
                />
              </Box>

              {/* Passo 3: Descrição de Estilo */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    3
                  </Avatar>
                  <Typography variant="h3" color="text.primary">
                    Descrição de Estilo (Opcional)
                  </Typography>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={stylePrompt}
                  onChange={(e) => setStylePrompt(e.target.value)}
                  placeholder="Ex: Iluminação suave de estúdio, pose dinâmica, cenário urbano, look fotorrealista em alta resolução."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleStyleSuggestion}
                  size="small"
                >
                  Sugestões Automáticas de Estilo
                </Button>
              </Box>

              {/* Botão de Geração */}
              <Box pt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  sx={{
                    py: 1.5,
                    fontSize: "1.125rem",
                    fontWeight: 700,
                  }}
                >
                  {isGenerating
                    ? "GERANDO..."
                    : retryCountdown !== null && retryCountdown > 0
                    ? `AGUARDE ${retryCountdown}s`
                    : canGenerate
                    ? "GERAR PROVA VIRTUAL"
                    : "FAZ FALTA A IMAGEM DA PESSOA E DA ROUPA"}
                </Button>
              </Box>

              {/* Status e Progresso */}
              {status.show && (
                <Box>
                  <Alert
                    severity={status.type === "error" ? "error" : status.type === "success" ? "success" : "info"}
                    sx={{ mb: progress || retryCountdown !== null ? 1 : 0 }}
                  >
                    <Box>
                      {status.message}
                      {retryCountdown !== null && retryCountdown > 0 && (
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                          ⏱️ Aguarde {retryCountdown} segundo{retryCountdown !== 1 ? "s" : ""} antes de tentar novamente...
                        </Typography>
                      )}
                      {retryCountdown === 0 && (
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: "success.main" }}>
                          ✅ Você pode tentar novamente agora!
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                  {progress && (
                    <LinearProgress
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        "& .MuiLinearProgress-bar": {
                          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        },
                      }}
                    />
                  )}
                  {retryCountdown !== null && retryCountdown > 0 && !progress && (
                    <LinearProgress
                      variant="determinate"
                      value={(retryCountdown / (retryCountdown + 1)) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                      }}
                    />
                  )}
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Coluna de Resultado */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h2" color="primary.dark" mb={3} pb={2} borderBottom="2px solid" borderColor="primary.light">
              Resultado Fotorrealista
            </Typography>
            <ResultDisplay
              imageUrl={resultImageUrl}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

