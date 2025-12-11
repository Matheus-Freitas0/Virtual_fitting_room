import { useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  styled,
  alpha,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import CloseIcon from "@mui/icons-material/Close";
import { isValidImageFile, createImagePreviewUrl, revokeImagePreviewUrl } from "../utils/imageUtils";

const DropzoneBox = styled(Box)(({ theme, isActive }) => ({
  border: `2px dashed ${isActive ? theme.palette.secondary.main : theme.palette.primary.main}`,
  backgroundColor: isActive
    ? alpha(theme.palette.secondary.main, 0.1)
    : alpha(theme.palette.primary.main, 0.05),
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(4),
  minHeight: "208px", // h-52 equivalente
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  position: "relative",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
    backgroundColor: isActive
      ? alpha(theme.palette.secondary.main, 0.15)
      : alpha(theme.palette.primary.main, 0.1),
  },
}));

const PreviewImage = styled("img")(({ theme }) => ({
  width: "100%",
  maxHeight: "208px",
  objectFit: "contain",
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[2],
  marginTop: theme.spacing(2),
}));

const HiddenInput = styled("input")({
  display: "none",
});

/**
 * Componente de upload de imagem com drag-and-drop.
 * @param {Object} props
 * @param {string} props.label - Label do campo (ex: "Upload da Pessoa/Modelo")
 * @param {string} props.type - Tipo de ícone ("person" ou "garment")
 * @param {Function} props.onFileSelect - Callback chamado quando um arquivo é selecionado (recebe File e base64)
 * @param {string|null} props.previewUrl - URL da imagem de preview (opcional)
 * @param {Function} props.onRemove - Callback chamado quando a imagem é removida
 */
export default function ImageDropzone({
  label,
  type = "person",
  onFileSelect,
  previewUrl,
  onRemove,
}) {
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsActive(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    []
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await handleFiles(files);
      }
    },
    []
  );

  const handleFiles = async (files) => {
    const file = files[0];

    if (!isValidImageFile(file)) {
      if (onFileSelect) {
        onFileSelect(null, null, new Error("Por favor, selecione um arquivo de imagem válido (JPG, PNG)."));
      }
      return;
    }

    try {
      // Cria preview URL
      const preview = createImagePreviewUrl(file);

      // Converte para base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        if (onFileSelect) {
          onFileSelect(file, base64String, null, preview);
        }
      };
      reader.onerror = () => {
        if (onFileSelect) {
          onFileSelect(null, null, new Error("Erro ao ler o arquivo."));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      if (onFileSelect) {
        onFileSelect(null, null, error);
      }
    }
  };

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (previewUrl) {
        revokeImagePreviewUrl(previewUrl);
      }
      if (onRemove) {
        onRemove();
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [previewUrl, onRemove]
  );

  const IconComponent = type === "person" ? PersonIcon : CheckroomIcon;

  return (
    <Box>
      {!previewUrl ? (
        <DropzoneBox
          isActive={isActive}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <IconComponent
            sx={{
              fontSize: 40,
              color: "primary.main",
              mb: 2,
            }}
          />
          <Typography variant="body1" fontWeight={600} color="primary.dark" mb={1}>
            Arraste e solte a imagem aqui
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ou clique para selecionar (JPG, PNG)
          </Typography>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </DropzoneBox>
      ) : (
        <Box position="relative">
          <PreviewImage src={previewUrl} alt={label} />
          <IconButton
            onClick={handleRemove}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

