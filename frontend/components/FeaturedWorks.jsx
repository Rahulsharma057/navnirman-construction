"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Grid, Typography, Button, Skeleton, Stack } from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ScrollReveal from "@/components/ScrollReveal";
import WorkCard from "@/components/WorkCard";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

export default function FeaturedWorks() {
  const { data, isLoading } = useQuery({
    queryKey: ["works", "featured"],
    queryFn: async () => (await api.get("/works", { params: { featured: true, limit: 6 } })).data.works,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["works", "recent"],
    queryFn: async () => (await api.get("/works", { params: { limit: 6 } })).data.works,
    enabled: !isLoading && (data?.length ?? 0) === 0,
  });

  const works = data?.length ? data : recent;
  const loading = isLoading || (data?.length === 0 && recentLoading);

  return (
    <Box sx={{ py: { xs: 7, md: 9 }, backgroundColor: tokens.paperAlt }}>
      <Container maxWidth="lg">
        <ScrollReveal>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-end" }} spacing={2} sx={{ mb: 5 }}>
            <Box>
              <Typography sx={{ color: tokens.rust, fontWeight: 700, mb: 1 }}>Recent jobs</Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.9rem", md: "2.4rem" } }}>
                A few we&apos;ve just wrapped up.
              </Typography>
            </Box>
            <Button component={Link} href="/works" endIcon={<ArrowOutwardIcon />} sx={{ color: tokens.ink, fontWeight: 700 }}>
              View all work
            </Button>
          </Stack>
        </ScrollReveal>

        <Grid container spacing={2.5}>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 3" }} />
              </Grid>
            ))}
          {!loading &&
            works?.map((w, i) => (
              <Grid item xs={12} sm={6} md={4} key={w._id}>
                <ScrollReveal delay={(i % 3) * 60}>
                  <WorkCard work={w} />
                </ScrollReveal>
              </Grid>
            ))}
          {!loading && works?.length === 0 && (
            <Grid item xs={12}>
              <Typography sx={{ color: "#6b665c" }}>
                No completed jobs added yet — add your first from the admin dashboard.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
