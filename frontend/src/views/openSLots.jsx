import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box, CardHeader, Container, Divider, Skeleton } from "@mui/material";
import axiosClient from "./../axiosClient";
import { useNavigate } from "react-router-dom";
import { FormButton } from "../components/StyledComponents";

export default function OpenSlots() {
  const [loading, setLoading] = useState(true);
  const [openSlots, setOpenSlots] = useState([]);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("/surgery/open-slots", {
          withCredentials: true,
        });
        const { data } = response;

        setOpenSlots(data.surgeries);
      } catch (err) {
        
        setErr(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleButtonClick = (surgeryId) => {
    
    navigate("/surgeryDetails", {
      state: {
        surgeryId,
      },
    });
  };

  if (loading) {
    return (
      <Container>
        <Skeleton variant="rectangular" height={205} sx={{ marginY: "1rem" }} />
        <Skeleton variant="rectangular" height={205} sx={{ marginY: "1rem" }} />
        <Skeleton variant="rectangular" height={205} sx={{ marginY: "1rem" }} />
      </Container>
    );
  }

  if (err) {
    return (
      <Container
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          width: "auto",
        }}
      >
        {err && (
          <Typography
            variant="h4"
            sx={{
              marginBottom: "1rem",
              color: "red",
            }}
          >
            No surgeries found with open slots!
          </Typography>
        )}
      </Container>
    );
  }
  const handleRequestClick = (surgery) => {
    window.location.href = `/surgeriey-request?id=${surgery.id}&consultantId=${surgery.leadSurgeon}`;
  };
  return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {openSlots.length > 0 ? (
        openSlots.map((data) => {
          return (
            <Card
              key={data.id}
              sx={{ width: "100%", borderRadius: 3, boxShadow: 3, p: 2 }}
            >
              <CardHeader
                title={data.surgeryName}
                subheader={data.hospital}
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                subheaderTypographyProps={{ color: "text.secondary" }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="body1">
                      <strong>Available Slot:</strong> {data.availableSlot}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Department:</strong> {data.department}
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: "flex-end" }}>
                    <FormButton
                      type="button"
                      variant="contained"
                      className="btn btn-black btn-block"
                      onClick={() => handleRequestClick(data)}
                    >
                      Request Surgery
                    </FormButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Typography>No available slots</Typography>
      )}
    </Container>
  );
}
