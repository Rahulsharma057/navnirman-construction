"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Box, Container, Grid, Typography, Stack, Skeleton } from "@mui/material";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import CallIcon from "@mui/icons-material/Call";
import WorkHistoryIcon from "@mui/icons-material/WorkHistoryOutlined";
import ScrollReveal from "@/components/ScrollReveal";
import api, { imgUrl } from "@/lib/api";
import { tokens } from "@/lib/theme";

export default function AboutSection() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data.profile,
  });

  if (isLoading) {
    return (
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={320} />
        </Container>
      </Box>
    );
  }

  if (!profile) return null;

  const gallery = profile.gallery || [];

  return (
    <Box id="about" component="section" sx={{ py: { xs: 7, md: 9 }, backgroundColor: tokens.white }}>
      <Container maxWidth="lg">
        <ScrollReveal>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={5}>
              {profile.logo?.url ? (
                <Box sx={{ position: "relative", width: 96, height: 96, mb: 3, border: `1px solid ${tokens.line}`, backgroundColor: tokens.paper }}>
                  <Image src={imgUrl(profile.logo)} alt={profile.businessName} fill sizes="96px" style={{ objectFit: "cover" }} />
                </Box>
              ) : null}

              <Typography sx={{ color: tokens.rust, fontWeight: 700, mb: 1 }}>Who we are</Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.9rem", md: "2.3rem" }, mb: 2 }}>
                {profile.businessName}
              </Typography>
              {profile.ownerName ? (
                <Typography sx={{ color: tokens.steel, fontWeight: 600, mb: 1 }}>Run by {profile.ownerName}</Typography>
              ) : null}
              <Typography sx={{ color: "#4A4740", mb: 3, lineHeight: 1.7 }}>{profile.about}</Typography>

              <Stack spacing={1.5}>
                {profile.yearsExperience > 0 && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WorkHistoryIcon sx={{ color: tokens.steel }} />
                    <Typography sx={{ fontWeight: 600 }}>{profile.yearsExperience}+ years in the trade</Typography>
                  </Stack>
                )}
                {profile.address && (
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <PlaceIcon sx={{ color: tokens.steel, mt: 0.3 }} />
                    <Typography sx={{ fontWeight: 600 }}>{profile.address}</Typography>
                  </Stack>
                )}
                {profile.phone && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CallIcon sx={{ color: tokens.steel }} />
                    <Typography sx={{ fontWeight: 600 }}>{profile.phone}</Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={7}>
              {profile.cover?.url ? (
                <Box sx={{ position: "relative", aspectRatio: "16 / 10", border: `1px solid ${tokens.line}`, mb: gallery.length ? 1.5 : 0 }}>
                  <Image src={imgUrl(profile.cover)} alt={profile.businessName} fill sizes="(max-width: 900px) 100vw, 55vw" style={{ objectFit: "cover" }} />
                </Box>
              ) : null}

              {gallery.length > 0 && (
                <Grid container spacing={1.5}>
                  {gallery.slice(0, 6).map((img) => (
                    <Grid item xs={4} key={img.publicId}>
                      <Box sx={{ position: "relative", aspectRatio: "1 / 1", border: `1px solid ${tokens.line}` }}>
                        <Image src={imgUrl(img)} alt="" fill sizes="200px" style={{ objectFit: "cover" }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {!profile.cover?.url && gallery.length === 0 && (
                <Box
                  sx={{
                    aspectRatio: "16 / 10",
                    border: `1px dashed ${tokens.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9a9587",
                    backgroundColor: tokens.paperAlt,
                  }}
                >
                  Add a cover photo and team/site photos from /admin/profile
                </Box>
              )}
            </Grid>
          </Grid>
        </ScrollReveal>
      </Container>
    </Box>
  );
}
