"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, TextField, Button, Stack, Paper, Grid, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import api, { imgUrl } from "@/lib/api";
import { tokens } from "@/lib/theme";

const emptyForm = {
  businessName: "",
  ownerName: "",
  tagline: "",
  about: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  yearsExperience: "",
  gstin: "",
  legalName: "",
  tradeName: "",
  constitution: "",
  gstRegistrationType: "",
  gstRegisteredOn: "",
  gstJurisdiction: "",
  pan: "",
  udyam: "",
  contractorClass: "",
};

export default function AdminProfilePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removeGallery, setRemoveGallery] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data.profile,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      businessName: profile.businessName || "",
      ownerName: profile.ownerName || "",
      tagline: profile.tagline || "",
      about: profile.about || "",
      phone: profile.phone || "",
      whatsapp: profile.whatsapp || "",
      email: profile.email || "",
      address: profile.address || "",
      yearsExperience: profile.yearsExperience ?? "",
      gstin: profile.gstin || "",
      legalName: profile.legalName || "",
      tradeName: profile.tradeName || "",
      constitution: profile.constitution || "",
      gstRegistrationType: profile.gstRegistrationType || "",
      gstRegisteredOn: profile.gstRegisteredOn ? String(profile.gstRegisteredOn).slice(0, 10) : "",
      gstJurisdiction: profile.gstJurisdiction || "",
      pan: profile.pan || "",
      udyam: profile.udyam || "",
      contractorClass: profile.contractorClass || "",
    });
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (fd) => api.put("/profile", fd, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setLogoFile(null);
      setCoverFile(null);
      setGalleryFiles([]);
      setRemoveGallery([]);
      setError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not save the profile"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(form.gstin)) {
      setError("GSTIN format looks wrong — it should be 15 characters like 07AJBPR2279N1ZO");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile) fd.append("logo", logoFile);
    if (coverFile) fd.append("cover", coverFile);
    galleryFiles.forEach((f) => fd.append("gallery", f));
    if (removeGallery.length > 0) fd.append("removeGallery", JSON.stringify(removeGallery));
    mutation.mutate(fd);
  };

  const markGalleryForRemoval = (publicId) => setRemoveGallery((ids) => [...ids, publicId]);

  const visibleGallery = (profile?.gallery || []).filter((img) => !removeGallery.includes(img.publicId));

  if (isLoading) return null;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 1 }}>
        Company Profile
      </Typography>
      <Typography sx={{ color: "#6b665c", mb: 3 }}>
        This appears in the &quot;Who we are&quot; section, the footer, the contact card and your printable Company Profile page.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile saved.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Business details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Business name"
                fullWidth
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Owner name"
                fullWidth
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Tagline"
                fullWidth
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About your business"
                fullWidth
                multiline
                minRows={3}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="WhatsApp number"
                fullWidth
                helperText="Include country code, digits only — e.g. 919876543210"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Years of experience"
                type="number"
                fullWidth
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Business address"
                fullWidth
                multiline
                minRows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>GST & registration details</Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#6b665c", mb: 2 }}>
            Shown on your public Company Profile page and the PDF you send with tenders. Copy these from your GST certificate.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="GSTIN" fullWidth inputProps={{ maxLength: 15 }} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase().trim() })} helperText="15 characters" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PAN"
                fullWidth
                inputProps={{ maxLength: 10 }}
                value={form.pan}
                onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase().trim() })}
                helperText={form.gstin.length === 15 && !form.pan ? `Usually ${form.gstin.slice(2, 12)} (taken from GSTIN) — check before using` : " "}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Legal name (as on GST certificate)" fullWidth value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Trade name" fullWidth value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Constitution of business" fullWidth value={form.constitution} onChange={(e) => setForm({ ...form, constitution: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Registration type" fullWidth value={form.gstRegistrationType} onChange={(e) => setForm({ ...form, gstRegistrationType: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Registered since" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.gstRegisteredOn} onChange={(e) => setForm({ ...form, gstRegisteredOn: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="GST jurisdiction office" fullWidth value={form.gstJurisdiction} onChange={(e) => setForm({ ...form, gstJurisdiction: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Udyam / MSME number (optional)" fullWidth value={form.udyam} onChange={(e) => setForm({ ...form, udyam: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Contractor class / enlistment (optional)" fullWidth value={form.contractorClass} onChange={(e) => setForm({ ...form, contractorClass: e.target.value })} placeholder="e.g. Class C, MCD" />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Logo & cover photo</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: "0.85rem", color: "#6b665c", mb: 1 }}>Logo</Typography>
              {!logoFile && (
                <Box sx={{ position: "relative", width: 80, height: 80, mb: 1.5, border: `1px solid ${tokens.line}` }}>
                  {profile?.logo?.url ? (
                    <Image src={imgUrl(profile.logo)} alt="Logo" fill sizes="80px" style={{ objectFit: "cover" }} />
                  ) : (
                    <Box component="img" src="/logo.svg" alt="Default Navnirman logo" sx={{ width: "100%", height: "100%" }} />
                  )}
                </Box>
              )}
              <Button component="label" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: tokens.line, color: tokens.ink }}>
                {logoFile ? logoFile.name : profile?.logo?.url ? "Replace logo" : "Upload your own logo"}
                <input type="file" hidden accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: "0.85rem", color: "#6b665c", mb: 1 }}>Cover photo</Typography>
              {profile?.cover?.url && !coverFile && (
                <Box sx={{ position: "relative", width: 140, height: 80, mb: 1.5, border: `1px solid ${tokens.line}` }}>
                  <Image src={imgUrl(profile.cover)} alt="Cover" fill sizes="140px" style={{ objectFit: "cover" }} />
                </Box>
              )}
              <Button component="label" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: tokens.line, color: tokens.ink }}>
                {coverFile ? coverFile.name : profile?.cover?.url ? "Replace cover" : "Upload cover"}
                <input type="file" hidden accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Your photos</Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#6b665c", mb: 2 }}>
            Team, workshop, vehicle, owner-at-work — these show up as a small gallery next to your &quot;Who we are&quot; section.
          </Typography>

          {visibleGallery.length > 0 && (
            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ rowGap: 1.5, mb: 2 }}>
              {visibleGallery.map((img) => (
                <Box key={img.publicId} sx={{ position: "relative", width: 84, height: 84 }}>
                  <Image src={imgUrl(img)} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
                  <IconButton
                    size="small"
                    onClick={() => markGalleryForRemoval(img.publicId)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: tokens.ink,
                      color: tokens.white,
                      width: 22,
                      height: 22,
                      "&:hover": { backgroundColor: tokens.rust },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}

          <Button component="label" variant="outlined" startIcon={<UploadIcon />} sx={{ borderColor: tokens.line, color: tokens.ink }}>
            {galleryFiles.length > 0 ? `${galleryFiles.length} photo(s) selected` : "Add photos"}
            <input type="file" hidden multiple accept="image/*" onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} />
          </Button>
        </Paper>

        <Button type="submit" variant="contained" color="primary" size="large" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </Box>
    </Box>
  );
}
