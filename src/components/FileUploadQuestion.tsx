import { Box, Button } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import { loadImageBase64 } from "../utils/imageStore";

interface FileUploadQuestionProps {
  value?: string; // image ID (stored in IndexedDB)
  onChange: (file: File) => void;
}

export function FileUploadQuestion({
  value,
  onChange,
}: FileUploadQuestionProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  // Load preview from IndexedDB when the ID changes
  useEffect(() => {
    let cancelled = false;
    if (value) {
      loadImageBase64(value).then((base64) => {
        if (!cancelled) setPreviewUrl(base64);
      });
    } else {
      setPreviewUrl(undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <Box>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <Button
        variant="outlined"
        onClick={() => cameraInputRef.current?.click()}
        sx={{ mt: 1 }}
      >
        Take Photo
      </Button>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          style={{
            marginTop: 12,
            maxWidth: "100%",
            maxHeight: 300,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
      )}
    </Box>
  );
}
