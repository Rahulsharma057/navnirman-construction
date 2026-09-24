"use client";
import { useQuery } from "@tanstack/react-query";
import { Box, Tooltip } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

// Floating quick-contact button, shown site-wide once the vendor has set a
// WhatsApp number in their business profile.
export default function WhatsAppButton() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data.profile,
  });

  const number = profile?.whatsapp?.replace(/[^0-9]/g, "");
  if (!number) return null;

  const message = encodeURIComponent(`Hi, I'd like to enquire about a job with ${profile?.businessName || "you"}.`);

  return (
    <Tooltip title="Chat on WhatsApp" placement="left">
      <Box
        component="a"
        className="no-print"
        href={`https://wa.me/${number}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#25D366",
          color: tokens.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.07)" },
        }}
      >
        <WhatsAppIcon sx={{ fontSize: 30 }} />
      </Box>
    </Tooltip>
  );
}
