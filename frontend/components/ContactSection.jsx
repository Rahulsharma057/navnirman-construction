"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import MailIcon from "@mui/icons-material/MailOutline";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { sortCategories } from "@/lib/company";
import { tokens } from "@/lib/theme";

const emptyForm = { name: "", phone: "", email: "", category: "", message: "" };

export default function ContactSection() {
  const [form, setForm] = useState(emptyForm);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data.profile,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });

  const mutation = useMutation({
    mutationFn: (payload) => api.post("/contact", payload),
    onSuccess: () => setForm(emptyForm),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Box id="contact" component="section" sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <ScrollReveal>
          <Grid container spacing={5}>
            <Grid item xs={12} md={5}>
              <Typography sx={{ color: tokens.rust, fontWeight: 700, mb: 1 }}>Get in touch</Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.9rem", md: "2.3rem" }, mb: 2 }}>
                Planning a build? Tell us the job — we&apos;ll call you back the same day.
              </Typography>
              <Typography sx={{ color: "#4A4740", mb: 4, maxWidth: 400 }}>
                Share what needs doing and where — a rough description is enough to
                start. No job is too small or too big.
              </Typography>

              <Stack spacing={2.5}>
                {profile?.phone && (
                  <Stack direction="row" spacing={1.5} alignItems="center" component="a" href={`tel:${profile.phone.replace(/[^0-9+]/g, "")}`}>
                    <CallIcon sx={{ color: tokens.steel }} />
                    <Typography sx={{ fontWeight: 600 }}>{profile.phone}</Typography>
                  </Stack>
                )}
                {profile?.email && (
                  <Stack direction="row" spacing={1.5} alignItems="center" component="a" href={`mailto:${profile.email}`}>
                    <MailIcon sx={{ color: tokens.steel }} />
                    <Typography sx={{ fontWeight: 600 }}>{profile.email}</Typography>
                  </Stack>
                )}
                {profile?.address && (
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <PlaceIcon sx={{ color: tokens.steel, mt: 0.3 }} />
                    <Typography sx={{ fontWeight: 600 }}>{profile.address}</Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ p: { xs: 3, md: 4 }, border: `1px solid ${tokens.line}`, backgroundColor: tokens.white }}
              >
                {mutation.isSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thanks — your message is in. We&apos;ll reach out shortly.
                  </Alert>
                )}
                {mutation.isError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {mutation.error?.response?.data?.message || "Something went wrong sending that. Please try again or call us directly."}
                  </Alert>
                )}

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Your name"
                      fullWidth
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone number"
                      fullWidth
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email (optional)"
                      fullWidth
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Type of work"
                      fullWidth
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <MenuItem value="">Not sure yet</MenuItem>
                      {sortCategories(categories).map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Describe the job"
                      fullWidth
                      required
                      multiline
                      minRows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" size="large" disabled={mutation.isPending}>
                      {mutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </ScrollReveal>
      </Container>
    </Box>
  );
}
