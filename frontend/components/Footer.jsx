"use client";
import Link from "next/link";
import { Box, Container, Grid, Stack, Typography, Divider } from "@mui/material";
import Logo from "@/components/Logo";
import useProfile from "@/hooks/useProfile";
import { tokens } from "@/lib/theme";

export default function Footer() {
  const year = new Date().getFullYear();
  const { profile } = useProfile();

  return (
    <Box component="footer" sx={{ backgroundColor: tokens.ink, color: tokens.paper, mt: 10 }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Logo light size={48} />
            <Typography sx={{ mt: 1.5, color: "rgba(251,250,246,0.7)", maxWidth: 340 }}>
              {profile.tagline}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Quick links</Typography>
            <Stack spacing={1}>
              <Typography component={Link} href="/#services" sx={{ color: "rgba(251,250,246,0.75)", "&:hover": { color: tokens.rust } }}>
                Services
              </Typography>
              <Typography component={Link} href="/works" sx={{ color: "rgba(251,250,246,0.75)", "&:hover": { color: tokens.rust } }}>
                Our Projects
              </Typography>
              <Typography component={Link} href="/company-profile" sx={{ color: "rgba(251,250,246,0.75)", "&:hover": { color: tokens.rust } }}>
                Company Profile
              </Typography>
              <Typography component={Link} href="/#contact" sx={{ color: "rgba(251,250,246,0.75)", "&:hover": { color: tokens.rust } }}>
                Contact
              </Typography>
              <Typography component={Link} href="/admin/login" sx={{ color: "rgba(251,250,246,0.8)", fontWeight: 600, "&:hover": { color: tokens.rust } }}>
                Admin login
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Get in touch</Typography>
            <Stack spacing={1}>
              {profile.phone && <Typography sx={{ color: "rgba(251,250,246,0.75)" }}>{profile.phone}</Typography>}
              {profile.email && <Typography sx={{ color: "rgba(251,250,246,0.75)" }}>{profile.email}</Typography>}
              {profile.address && <Typography sx={{ color: "rgba(251,250,246,0.75)" }}>{profile.address}</Typography>}
              {profile.gstin && <Typography sx={{ color: "rgba(251,250,246,0.55)", fontSize: "0.85rem" }}>GSTIN: {profile.gstin}</Typography>}
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: "rgba(251,250,246,0.12)" }} />
        <Typography sx={{ color: "rgba(251,250,246,0.5)", fontSize: "0.85rem" }}>
          © {year} {profile.businessName}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
