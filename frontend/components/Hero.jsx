"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Container, Grid, Stack, Typography, Button, Chip } from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import api, { imgUrl } from "@/lib/api";
import useProfile from "@/hooks/useProfile";
import { tokens } from "@/lib/theme";

const trades = ["Building Construction", "Civil Work", "Renovation", "Roads & Paving", "Painting", "Electrical"];

export default function Hero() {
  // a single orchestrated load-in sequence for the hero — not scattered
  // per-element animation, just one moment when the page opens.
  const [ready, setReady] = useState(false);
  const { profile } = useProfile();
  // show the newest featured project photo in the hero if one exists
  const { data: latest } = useQuery({
    queryKey: ["hero-work"],
    queryFn: async () => (await api.get("/works", { params: { limit: 6, featured: true } })).data.works,
  });
  const heroWork = latest?.find((w) => w.images?.length);
  const since = profile.gstRegisteredOn ? new Date(profile.gstRegisteredOn).getFullYear() : null;
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box component="section" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 16, color: `${tokens.olive} !important` }} />}
                label={`GST registered civil contractor · Delhi${since ? ` · Since ${since}` : ""}`}
                size="small"
                sx={{
                  backgroundColor: "transparent",
                  border: `1px solid ${tokens.line}`,
                  color: tokens.steel,
                  fontWeight: 600,
                  mb: 3,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.4rem", sm: "3.1rem", md: "3.8rem" },
                  color: tokens.ink,
                }}
              >
                Building Construction
                <br />
                you can trust.
              </Typography>
              <Typography sx={{ mt: 3, fontSize: "1.15rem", color: "#4A4740", maxWidth: 480 }}>
                {profile.businessName} is a Delhi civil contractor specialising in building
                construction — houses, commercial complexes and government works — plus
                renovation, roads, painting and electrical jobs, handled site to finish.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  component={Link}
                  href="/#contact"
                  endIcon={<ArrowOutwardIcon />}
                >
                  Get a Construction Quote
                </Button>
                <Button variant="outlined" size="large" component={Link} href="/works" sx={{ borderColor: tokens.ink, color: tokens.ink }}>
                  See Our Projects
                </Button>
              </Stack>

              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 4, rowGap: 1 }}>
                {trades.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ backgroundColor: tokens.white, border: `1px solid ${tokens.line}` }} />
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(28px)",
                transition: "opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s",
                position: "relative",
                aspectRatio: "4 / 5",
                border: `1px solid ${tokens.line}`,
                backgroundColor: tokens.white,
                p: 1.5,
              }}
            >
              <Box sx={{ height: "100%", width: "100%", backgroundColor: tokens.paperAlt, border: `1px dashed ${tokens.line}`, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {heroWork ? (
                  <Image src={imgUrl(heroWork.images[0])} alt={heroWork.title} fill priority sizes="(max-width: 900px) 100vw, 40vw" style={{ objectFit: "cover" }} />
                ) : (
                  <Box component="img" src="/logo.svg" alt="" sx={{ width: "42%", opacity: 0.9, borderRadius: "10px" }} />
                )}
                <Box sx={{ position: "absolute", top: 14, left: 14, px: 1, py: 0.4, backgroundColor: tokens.rust, color: tokens.white, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.03em" }}>
                  {heroWork ? "RECENT PROJECT" : "NAVNIRMAN CONSTRUCTION"}
                </Box>
                {heroWork && (
                  <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 1.5, background: "linear-gradient(transparent, rgba(28,35,33,0.85))", color: tokens.white, fontWeight: 600 }}>
                    {heroWork.title}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
