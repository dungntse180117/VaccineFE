import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { createVaccinationImage } from "../../config/axios";

const Input = styled("input")({
  display: "none",
});

function UploadImageForm({ open, onClose, vaccinationId, vaccinationName, accountId, setError, fetchVaccines }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn một ảnh.");
      return;
    }

    try {
      const response = await createVaccinationImage(selectedFile, vaccinationId);

      if (response.status === 200) {
        console.log("Image uploaded successfully:", response.data);
        onClose();
        fetchVaccines();
      } else {
        setError(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(`Error uploading image: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tải lên ảnh cho Vaccine {vaccinationName}</DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          padding={3}
        >
          <label htmlFor="icon-button-file">
            <Input
              accept="image/*"
              id="icon-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <PhotoCamera style={{ fontSize: 60 }} />
            </IconButton>
          </label>
          {selectedFile && (
            <Typography variant="subtitle1">
              Đã chọn: {selectedFile.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button color="primary" onClick={handleUpload} disabled={!selectedFile}>
          Tải lên
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadImageForm;