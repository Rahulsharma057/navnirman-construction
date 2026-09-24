"use client";
import Link from "next/link";
import Image from "next/image";
import { Box, Typography, Chip } from "@mui/material";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import { imgUrl } from "@/lib/api";
import { tokens } from "@/lib/theme";

export default function WorkCard({ work }) {
  const cover = work.images?.[0];
  return (
    <Box
      component={Link}
      href={`/works/${work._id}`}
      sx={{
        display: "block",
        border: `1px solid ${tokens.line}`,
        backgroundColor: tokens.white,
        transition: "border-color 0.2s ease, transform 0.2s ease",
        "&:hover": { borderColor: tokens.rust, transform: "translateY(-3px)" },
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "4 / 3", backgroundColor: tokens.paperAlt }}>
        {cover ? (
          <Image
            src={imgUrl(cover)}
            alt={work.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : null}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            px: 1,
            py: 0.3,
            backgroundColor: work.status === "completed" ? tokens.olive : tokens.steel,
            color: tokens.white,
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
          }}
        >
          {work.status === "completed" ? "COMPLETED" : "IN PROGRESS"}
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Chip
          label={work.category?.name || "General"}
          size="small"
          sx={{ backgroundColor: tokens.paperAlt, fontWeight: 600, mb: 1 }}
        />
        <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem" }} noWrap>
          {work.title}
        </Typography>
        {work.location ? (
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#6b665c", fontSize: "0.85rem", mt: 0.5 }}>
            <PlaceIcon sx={{ fontSize: 16 }} /> {work.location}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
