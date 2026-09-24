"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Stack, Typography, Button, Snackbar, CircularProgress } from "@mui/material";
import PdfIcon from "@mui/icons-material/PictureAsPdfOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailIcon from "@mui/icons-material/MailOutline";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Logo from "@/components/Logo";
import useProfile from "@/hooks/useProfile";
import api, { imgUrl } from "@/lib/api";
import { fmtDate, COMPANY } from "@/lib/company";
import { OWNER_PHOTO } from "@/lib/ownerPhoto";
import { tokens } from "@/lib/theme";
import "./company-profile.css";

const Info = ({ label, value, span }) =>
  value ? (
    <div className={span ? "cp-span" : undefined}>
      <div className="cp-l">{label}</div>
      <div className="cp-v">{value}</div>
    </div>
  ) : null;

// the API returns max 50 projects per call — fetch every page
const fetchAllWorks = async () => {
  let page = 1;
  let all = [];
  for (;;) {
    const { data } = await api.get("/works", { params: { page, limit: 50 } });
    all = all.concat(data.works);
    if (page >= (data.pagination?.pages || 1)) break;
    page += 1;
  }
  return all;
};

export default function CompanyProfilePage() {
  const { profile } = useProfile();
  const [toast, setToast] = useState("");
  const [photoOk, setPhotoOk] = useState(true);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });
  const { data: works = [], isLoading } = useQuery({ queryKey: ["all-works"], queryFn: fetchAllWorks });

  const owner = profile.ownerName || COMPANY.ownerName;
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setToast("Link copied");
    } catch {
      setToast("Copy the address from the browser");
    }
  };

  return (
    <div className="cp-wrap">
      {/* buttons — not printed */}
      <div className="cp-bar no-print">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: "center" }}>
          <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ color: tokens.ink, alignSelf: "flex-start" }}>Back to website</Button>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
            <Button variant="contained" disabled={isLoading} onClick={() => window.print()} startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <PdfIcon />}>Download PDF</Button>
            <Button variant="outlined" startIcon={<WhatsAppIcon />} component="a" target="_blank" rel="noopener noreferrer" sx={{ borderColor: "#25D366", color: "#1a8f47", bgcolor: "#fff" }}
              href={`https://wa.me/?text=${encodeURIComponent(`${profile.businessName} — Company Profile & Projects\n${pageUrl}`)}`}>WhatsApp</Button>
            <Button variant="outlined" startIcon={<MailIcon />} component="a" sx={{ borderColor: tokens.ink, color: tokens.ink, bgcolor: "#fff" }}
              href={`mailto:?subject=${encodeURIComponent(`${profile.businessName} — Company Profile`)}&body=${encodeURIComponent(`Please find our company profile and projects here:\n${pageUrl}\n\nRegards,\n${owner}\n${profile.businessName}`)}`}>Email</Button>
            <Button variant="outlined" startIcon={<LinkIcon />} onClick={copyLink} sx={{ borderColor: tokens.ink, color: tokens.ink, bgcolor: "#fff" }}>Copy link</Button>
          </Stack>
        </Stack>
        <Typography sx={{ fontSize: "0.82rem", color: "#6b665c", mt: 1, mb: 1 }}>
          &quot;Download PDF&quot; dabao → printer mein <b>Save as PDF</b> chuno. Jo yahan A4 pages dikh rahe hain wahi PDF mein aayenge.
        </Typography>
      </div>

      {/* ============ PAGE 1 — COMPANY PROFILE ============ */}
      <section className="cp-page cp-first">
        <header className="cp-band">
          <Logo light href="" size={54} />
          <div className="cp-band-right">
            <div className="cp-tag">COMPANY PROFILE</div>
            {profile.gstin && <span className="cp-gst">✔ GST Registered</span>}
          </div>
        </header>

        <div className="cp-hero">
          {photoOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cp-owner" src={OWNER_PHOTO} alt={owner} onError={() => setPhotoOk(false)} />
          ) : (
            <div className="cp-owner-fallback">{owner.charAt(0)}</div>
          )}
          <div>
            <h1 className="cp-name">{profile.businessName}</h1>
            <p className="cp-tagline">{profile.tagline}</p>
            <div className="cp-owner-line">{owner}<span>Proprietor</span></div>
          </div>
        </div>

        <h2 className="cp-h">Business details</h2>
        <div className="cp-grid3">
          <Info label="Trade name" value={profile.tradeName || profile.businessName} />
          <Info label="Proprietor" value={owner} />
          <Info label="Constitution" value={profile.constitution} />
          <Info label="GSTIN" value={profile.gstin} />
          <Info label="PAN" value={profile.pan} />
          <Info label="GST registration" value={profile.gstRegistrationType && `${profile.gstRegistrationType} · since ${fmtDate(profile.gstRegisteredOn, { month: "short", year: "numeric" })}`} />
          <Info label="Udyam / MSME" value={profile.udyam} />
          <Info label="Contractor class" value={profile.contractorClass} />
          <Info label="Experience" value={profile.yearsExperience ? `${profile.yearsExperience}+ years` : ""} />
          <Info label="Registered office" value={profile.address} span />
        </div>

        <h2 className="cp-h">About us</h2>
        <p className="cp-about">{profile.about}</p>

        {categories.length > 0 && (
          <>
            <h2 className="cp-h">Services</h2>
            <div className="cp-grid2">
              {categories.map((c) => (
                <div key={c._id}>
                  <div className="cp-svc-name">{c.name}</div>
                  <div className="cp-svc-desc">{c.description}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="cp-h">Contact</h2>
        <div className="cp-grid3">
          <Info label="Contact person" value={owner} />
          <Info label="Phone" value={profile.phone} />
          <Info label="Email" value={profile.email} />
        </div>

        <div className="cp-foot">{profile.businessName} · GSTIN {profile.gstin} · {fmtDate(new Date())}</div>
      </section>

      {/* ============ PAGE 2+ — PROJECTS ============ */}
      <section className="cp-page">
        <div className="cp-ph">
          <h2>Our Projects</h2>
          <span style={{ fontWeight: 700, color: "#6b665c" }}>{works.length} project{works.length === 1 ? "" : "s"}</span>
        </div>

        {isLoading && <p>Loading projects…</p>}
        {!isLoading && works.length === 0 && <p style={{ color: "#6b665c" }}>Projects will be listed here.</p>}

        {works.map((w, i) => {
          const photos = (w.images || []).slice(0, 3);
          return (
            <article className="cp-proj" key={w._id}>
              <div className="cp-pk">PROJECT {String(i + 1).padStart(2, "0")}{w.category?.name ? ` · ${w.category.name.toUpperCase()}` : ""}</div>
              <h3 className="cp-pt">{w.title}</h3>

              {photos.length > 0 ? (
                <div className={`cp-photos n${photos.length}`}>
                  {photos.map((img, k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} src={imgUrl(img)} alt={`${w.title} ${k + 1}`} loading="eager" />
                  ))}
                </div>
              ) : (
                <div className="cp-nophoto">Photos coming soon</div>
              )}

              <div className="cp-facts">
                <Info label="Location" value={w.location} />
                <Info label="Client" value={w.clientType && w.clientType[0].toUpperCase() + w.clientType.slice(1)} />
                <Info label="Completed" value={w.completedOn ? fmtDate(w.completedOn, { month: "short", year: "numeric" }) : ""} />
                <Info label="Duration" value={w.durationDays ? `${w.durationDays} days` : ""} />
              </div>
              <p className="cp-pdesc">{w.description}</p>
            </article>
          );
        })}

        <div className="cp-foot">{profile.businessName} · GSTIN {profile.gstin}</div>
      </section>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast("")} message={toast} />
    </div>
  );
}