import { Box, Typography } from "@mui/material";
import React from "react";

interface QuestionWrapperProps {
  id?: string;
  question: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function QuestionWrapper({
  id,
  question,
  required,
  error,
  children,
}: QuestionWrapperProps) {
  return (
    <Box
      id={id}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        padding: 2,
        borderRadius: 1.5,
        backgroundColor: "#fafafa",
        border: "1px solid",
        borderColor: error ? "#d32f2f" : "#e0e0e0",
      }}
    >
      <Typography variant="subtitle1" fontWeight={500}>
        {question}
        {required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
      </Typography>
      {children}
      {error && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}
    </Box>
  );
}
