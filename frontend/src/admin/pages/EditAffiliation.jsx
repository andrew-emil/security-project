import {
  FormCard,
  FormContainer,
  FormTitle,
  FormTextField,
  FormButton,
} from "../../components/StyledComponents";
import {
  Alert,
  AlertTitle,
  Skeleton,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { useState } from "react";
import axiosClient from "../../axiosClient";
import { PropTypes } from "prop-types";

const institutionTypes = {
  HOSPITAL: "Hospital",
  CLINIC: "Clinic",
  RESEARCH_CENTER: "Research Center",
  UNIVERSITY: "University",
  MEDICAL_SCHOOL: "Medical School",
  PRIVATE_PRACTICE: "Private Practice",
};

const EditAffiliation = ({ affiliationId }) => {
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [affiliation, setAffiliation] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const nameRef = useRef();
  const countryRef = useRef();
  const cityRef = useRef();
  const addressRef = useRef();

  useEffect(() => {
    const fetchAffiliationData = async () => {
      try {
        const response = await axiosClient.get(
          `/affiliation/${affiliationId}`,
          { withCredentials: true }
        );
        const { data } = response;
        setAffiliation(data);
        setSelectedType(
          institutionTypes[`${data.institution_type.toUpperCase()}`]
        );
      } catch (err) {
        setErr(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliationData();
  }, [affiliationId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const payload = {
        id: affiliationId,
        name: nameRef.current.value,
        country: countryRef.current.value,
        city: cityRef.current.value,
        address: addressRef.current.value,
        institution_type: selectedType,
      };
      const response = await axiosClient.patch("affiliation", payload, {
        withCredentials: true,
      });
      const { data } = response;
      setMsg(data.message);
    } catch (err) {
      setErr(err.response.data.message);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleChange = (event) => {
    setSelectedType(event.target.value);
  };

  if (loading) {
    return (
      <FormContainer>
        <Skeleton variant="rounded" height={300} />
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormCard sx={{ width: "400px", padding: "2rem" }}>
        {err && (
          <Alert severity="error" sx={{ marginBottom: "1rem" }}>
            <AlertTitle>Error</AlertTitle>
            {err}
          </Alert>
        )}
        {msg && (
          <Alert severity="success" sx={{ marginBottom: "1rem" }}>
            <AlertTitle>Success</AlertTitle>
            {msg}
          </Alert>
        )}
        <FormTitle>Edit Affiliation</FormTitle>
        <form onSubmit={onSubmit}>
          <FormTextField
            inputRef={nameRef}
            type="text"
            label="Affiliation Name"
            variant="outlined"
            fullWidth
            required
            defaultValue={affiliation.name}
          />
          <FormTextField
            inputRef={countryRef}
            type="text"
            label="Country"
            variant="outlined"
            fullWidth
            required
            defaultValue={affiliation.country}
          />
          <FormTextField
            inputRef={cityRef}
            type="text"
            label="City"
            variant="outlined"
            fullWidth
            required
            defaultValue={affiliation.city}
          />
          <FormTextField
            inputRef={addressRef}
            type="text"
            label="Address"
            variant="outlined"
            fullWidth
            required
            defaultValue={affiliation.address}
          />
          <FormControl fullWidth sx={{ marginBottom: "1rem" }}>
            <InputLabel id="institution-type-label">
              Institution Type
            </InputLabel>
            <Select
              labelId="institution-type-label"
              id="institution-type"
              value={selectedType}
              label="Institution Type"
              onChange={handleChange}
              defaultValue={selectedType}
              required
            >
              {Object.values(institutionTypes).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormButton
            type="submit"
            variant="contained"
            color="primary"
            loading={buttonLoading}
          >
            Edit Affiliation
          </FormButton>
        </form>
      </FormCard>
    </FormContainer>
  );
};
EditAffiliation.propTypes = {
  affiliationId: PropTypes.string,
};

export default EditAffiliation;
