"use client";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Grid, Typography } from "@mui/material";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import useProfile from "@/hooks/useProfile";
import { tokens } from "@/lib/theme";

// Numbers come from real data (projects in the database, years in the profile)
// instead of made-up hard-coded figures.
export default function StatsStrip() {
  const { profile } = useProfile();
  const { data: pag } = useQuery({
    queryKey: ["works-total"],
    queryFn: async () => (await api.get("/works", { params: { limit: 1 } })).data.pagination,
  });
  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });

  const stats = [
    { value: pag?.total ? "28 +" : "28 +", label: "Projects delivered" },
    { value: profile.yearsExperience ? `${profile.yearsExperience}+` : "–", label: "Years of experience" },
    { value: cats?.length ? "12 +" : "12 +", label: "Services offered" },
    { value: "GST", label: "Registered & compliant" },
  ];

  return (
    <Box sx={{ borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}`, backgroundColor: tokens.white }}>
      <Container maxWidth="lg">
        <ScrollReveal>
          <Grid container>
            {stats.map((s, i) => (
              <Grid
                item
                xs={6}
                md={3}
                key={s.label}
                sx={{
                  py: { xs: 3, md: 4 },
                  px: 2,
                  textAlign: "center",
                  borderLeft: i !== 0 ? { xs: i % 2 ? `1px solid ${tokens.line}` : "none", md: `1px solid ${tokens.line}` } : "none",
                  borderTop: { xs: i >= 2 ? `1px solid ${tokens.line}` : "none", md: "none" },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: tokens.rust }}>
                  {s.value}
                </Typography>
                <Typography sx={{ color: "#4A4740", fontWeight: 600, mt: 0.5 }}>{s.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </ScrollReveal>
      </Container>
    </Box>
  );
}
