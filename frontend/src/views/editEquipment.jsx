import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosClient from "../axiosClient";
import {
  FormButton,
  FormContainer,
  FormTextField,
} from "../components/StyledComponents";
import { Alert, AlertTitle } from "@mui/material";
import { Box } from "@mui/system";
import { convertImage } from "../utils/convertImage";

export default function EditEquipment() {
  const query = new URLSearchParams(useLocation().search);
  const id = query.get("id");

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [picture, setPicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // 👈 for Avatar preview
  const [msg, setMsg] = useState(null);
  const [redirect, setRedirect] = useState(null);

  const nameRef = useRef();

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/surgery-equipments/${id}`, { withCredentials: true })
      .then((res) => {
        const data = res.data;
        setEquipment(data);
        setPicture(null); // don't set the photo as a File
        setImagePreview(convertImage(data?.photo?.data)); // 👈 use base64 preview
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        setError(error?.response?.data?.message || "Failed to load equipment.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (picture instanceof File) {
      const objectUrl = URL.createObjectURL(picture);
      setImagePreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl); // cleanup on unmount
    }
  }, [picture]);

  const submit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", nameRef.current.value);

    if (picture instanceof File) {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(picture);
      });

      formData.append("photo", base64Image);
    }

    axiosClient
      .put(`/surgery-equipments/${id}`, formData, { withCredentials: true })
      .then(({ data }) => {
        setMsg(data.message);
      })
      .catch((err) => {
        const response = err.response;
        if (response) {
          setError(response.data.message);
        }
      })
      .finally(() => {
        setLoading(false);
        setRedirect(true);
      });
  };
  if (redirect) {
    setTimeout(() => {
      window.location.href = "/equipments";
    }, 2000); // Redirect after 2 seconds
  }
  return (
    <FormContainer
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ marginBottom: "1rem" }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      {msg && (
        <Alert severity="success" sx={{ marginBottom: "1rem" }}>
          <AlertTitle>Success</AlertTitle>
          {msg}
        </Alert>
      )}
      <form onSubmit={submit} style={{ width: "100%" }}>
        <FormTextField
          sx={{ width: "100%" }}
          inputRef={nameRef}
          type="text"
          label="Equipment Name"
          variant="outlined"
          placeholder={equipment?.equipment_name}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            my: 2,
          }}
        >
          <img
            style={{ width: 200, height: 200, borderRadius: 20 }}
            src={imagePreview}
          />
          <input
            id="picture-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                setPicture(e.target.files[0]);
              }
            }}
          />
        </Box>
        <FormButton
          type="submit"
          variant="contained"
          color="primary"
          loading={loading}
        >
          Save Equipment
        </FormButton>
      </form>
    </FormContainer>
  );
}
