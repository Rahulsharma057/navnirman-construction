"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Grid, Stack, Typography, Button, Chip, Divider, Snackbar } from "@mui/material";
import PrintIcon from "@mui/icons-material/PictureAsPdfOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailIcon from "@mui/icons-material/MailOutline";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import Logo from "@/components/Logo";
import useProfile from "@/hooks/useProfile";
import api from "@/lib/api";
import { fmtDate, sortCategories } from "@/lib/company";
import { tokens } from "@/lib/theme";

const Field = ({ label, value }) =>
  value ? (
    <Grid item xs={6} md={4} className="avoid-break">
      <Typography sx={{ fontSize: "0.7rem", color: "#8a8578", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, wordBreak: "break-word" }}>{value}</Typography>
    </Grid>
  ) : null;

const Section = ({ title, children }) => (
  <Box sx={{ mt: 4 }}>
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
      <Box sx={{ width: 28, height: 4, backgroundColor: tokens.rust }} />
      <Typography variant="h5" sx={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</Typography>
    </Stack>
    {children}
  </Box>
);

export default function CompanyProfilePage() {
  const { profile } = useProfile();
  const [toast, setToast] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });
  const { data: works = [] } = useQuery({
    queryKey: ["profile-works"],
    queryFn: async () => (await api.get("/works", { params: { limit: 12, status: "completed" } })).data.works,
  });

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${profile.businessName} — Company Profile (GSTIN ${profile.gstin || "-"})\n${pageUrl}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setToast("Link copied");
    } catch {
      setToast("Could not copy — copy the address from your browser");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        {/* action bar — hidden when printing */}
        <Stack className="no-print" direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
          <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ color: tokens.ink, alignSelf: "flex-start" }}>Back to website</Button>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Download PDF</Button>
            <Button variant="outlined" startIcon={<WhatsAppIcon />} component="a" target="_blank" rel="noopener noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} sx={{ borderColor: "#25D366", color: "#1a8f47" }}>WhatsApp</Button>
            <Button variant="outlined" startIcon={<MailIcon />} component="a"
              href={`mailto:?subject=${encodeURIComponent(`${profile.businessName} — Company Profile`)}&body=${encodeURIComponent(`Please find our company profile here:\n${pageUrl}\n\nRegards,\n${profile.ownerName}\n${profile.businessName}`)}`}
              sx={{ borderColor: tokens.ink, color: tokens.ink }}>Email</Button>
            <Button variant="outlined" startIcon={<LinkIcon />} onClick={copyLink} sx={{ borderColor: tokens.ink, color: tokens.ink }}>Copy link</Button>
          </Stack>
        </Stack>
        <Typography className="no-print" sx={{ fontSize: "0.82rem", color: "#6b665c", mb: 2 }}>
          Tip: click <b>Download PDF</b>, then choose &quot;Save as PDF&quot; as the printer. Attach that PDF to your tender or email — or just share the link.
        </Typography>

        {/* the printable sheet */}
        <Box className="print-sheet" sx={{ backgroundColor: tokens.white, border: `1px solid ${tokens.line}`, p: { xs: 3, md: 5 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
            <Logo href="" size={64} />
            <Box sx={{ textAlign: { sm: "right" } }}>
              <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.2em", color: tokens.rust }}>COMPANY PROFILE</Typography>
              {profile.gstin && (
                <Chip size="small" icon={<VerifiedIcon />} label="GST Registered" sx={{ mt: 0.5, backgroundColor: "#E6EEE6", color: tokens.olive, "& .MuiChip-icon": { color: tokens.olive } }} />
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 3, borderColor: tokens.ink, borderBottomWidth: 2 }} />

          <Typography variant="h1" sx={{ fontSize: { xs: "1.9rem", md: "2.4rem" } }}>{profile.businessName}</Typography>
          <Typography sx={{ color: tokens.steel, fontWeight: 600, mt: 1 }}>{profile.tagline}</Typography>

          <Section title="Business details">
            <Grid container spacing={2.5}>
              <Field label="Trade name" value={profile.tradeName || profile.businessName} />
              <Field label="Proprietor / owner" value={profile.ownerName} />
              <Field label="Constitution" value={profile.constitution} />
              <Field label="GSTIN" value={profile.gstin} />
              <Field label="PAN" value={profile.pan} />
              <Field label="GST registration" value={profile.gstRegistrationType && `${profile.gstRegistrationType} · since ${fmtDate(profile.gstRegisteredOn, { month: "short", year: "numeric" })}`} />
              <Field label="Udyam / MSME" value={profile.udyam} />
              <Field label="Contractor class" value={profile.contractorClass} />
              <Field label="Experience" value={profile.yearsExperience ? `${profile.yearsExperience}+ years` : ""} />
              <Grid item xs={12}><Field label="Registered office" value={profile.address} /></Grid>
            </Grid>
          </Section>

          <Section title="About us">
            <Typography sx={{ lineHeight: 1.75, color: "#3a3832" }}>{profile.about}</Typography>
          </Section>

          {categories.length > 0 && (
            <Section title="Services we offer">
              <Grid container spacing={1.5}>
                {sortCategories(categories).map((c) => (
                  <Grid item xs={12} sm={6} key={c._id} className="avoid-break">
                    <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>
                    <Typography sx={{ fontSize: "0.88rem", color: "#5c584f" }}>{c.description}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Section>
          )}

          {works.length > 0 && (
            <Section title="Selected projects">
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr>
                    {["Project", "Location", "Client", "Year"].map((h) => (
                      <Box component="th" key={h} sx={{ textAlign: "left", py: 1, borderBottom: `2px solid ${tokens.ink}`, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</Box>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {works.map((w) => (
                    <Box component="tr" key={w._id} sx={{ breakInside: "avoid" }}>
                      <Box component="td" sx={{ py: 1, borderBottom: `1px solid ${tokens.line}`, fontWeight: 700 }}>{w.title}</Box>
                      <Box component="td" sx={{ py: 1, borderBottom: `1px solid ${tokens.line}` }}>{w.location || "—"}</Box>
                      <Box component="td" sx={{ py: 1, borderBottom: `1px solid ${tokens.line}`, textTransform: "capitalize" }}>{w.clientType}</Box>
                      <Box component="td" sx={{ py: 1, borderBottom: `1px solid ${tokens.line}` }}>{w.completedOn ? new Date(w.completedOn).getFullYear() : "—"}</Box>
                    </Box>
                  ))}
                </tbody>
              </Box>
            </Section>
          )}

          <Section title="Contact">
            <Grid container spacing={2.5}>
              <Field label="Contact person" value={profile.ownerName} />
              <Field label="Phone" value={profile.phone} />
              <Field label="Email" value={profile.email} />
            </Grid>
          </Section>

          <Typography sx={{ mt: 5, pt: 2, borderTop: `1px solid ${tokens.line}`, fontSize: "0.72rem", color: "#8a8578" }}>
            {profile.businessName} · GSTIN {profile.gstin} · Generated {fmtDate(new Date())}
          </Typography>
        </Box>
      </Container>
      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
