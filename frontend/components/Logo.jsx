"use client";
import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import { tokens } from "@/lib/theme";
import { COMPANY } from "@/lib/company";
import useProfile from "@/hooks/useProfile";

// Brand mark + name. `light` is for dark backgrounds (footer).
// The name shown is the company name — if the saved profile name is missing or
// is just the owner's name, we fall back to "Navnirman Construction".
export default function Logo({ light = false, size = 42, href = "/" }) {
  const { profile, raw } = useProfile();
  const logoSrc = raw?.logo?.url || "/logo.svg";

  const saved = (profile.businessName || "").trim();
  const ownerish = [profile.ownerName, profile.legalName].filter(Boolean).map((n) => n.toLowerCase());
  const name = !saved || ownerish.includes(saved.toLowerCase()) || !/\s/.test(saved) ? COMPANY.businessName : saved;
  const [first, ...rest] = name.split(" ");

  const inner = (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box component="img" src={logoSrc} alt="" width={size} height={size} sx={{ borderRadius: "6px", objectFit: "cover", display: "block", flexShrink: 0 }} />
      <Box sx={{ lineHeight: 1 }}>
        <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size > 40 ? "1.2rem" : "1.05rem", letterSpacing: "0.03em", color: light ? tokens.paper : tokens.ink, lineHeight: 1.1, textTransform: "uppercase" }}>
          {first}
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.2em", color: tokens.rust, textTransform: "uppercase", lineHeight: 1.3 }}>
          {rest.join(" ")}
        </Typography>
      </Box>
    </Stack>
  );
  return href ? <Link href={href} aria-label={name}>{inner}</Link> : inner;
}
