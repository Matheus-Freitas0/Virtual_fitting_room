import { Box, Typography, Button, Stack, styled } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

const PlaceholderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius * 1.5,
  minHeight: "600px",
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const ResultImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[8],
  transition: "opacity 0.5s ease-in-out",
}));

/**
 * Componente para exibir o resultado da geração de prova virtual.
 * @param {Object} props
 * @param {string|null} props.imageUrl - URL da imagem gerada (data:image/...)
 * @param {Function} props.onDownload - Callback chamado ao clicar em Download
 * @param {Function} props.onReset - Callback chamado ao clicar em Novo Teste
 */
export default function ResultDisplay({ imageUrl, onDownload, onReset }) {
  if (!imageUrl) {
    return (
      <PlaceholderBox>
        <ImageIcon sx={{ fontSize: 64, mb: 2, color: "text.secondary" }} />
        <Typography variant="h6" fontWeight={600} mb={1}>
          A sua imagem gerada aparecerá aqui.
        </Typography>
        <Typography variant="body2">
          Tamanho alvo: 1200 x 1540 px. Alta qualidade.
        </Typography>
      </PlaceholderBox>
    );
  }

  return (
    <Box>
      <ResultImage src={imageUrl} alt="Imagem de Prova Virtual Gerada" />
      <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onDownload}
          size="large"
        >
          Download
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onReset}
          size="large"
        >
          Novo Teste
        </Button>
      </Stack>
    </Box>
  );
}

