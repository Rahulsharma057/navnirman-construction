"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Grid, Typography, Skeleton } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import BoltIcon from "@mui/icons-material/Bolt";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import ApartmentIcon from "@mui/icons-material/Apartment";
import FenceIcon from "@mui/icons-material/Fence";
import HandymanIcon from "@mui/icons-material/Handyman";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import PlumbingIcon from "@mui/icons-material/Plumbing";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { sortCategories } from "@/lib/company";
import { tokens } from "@/lib/theme";

const iconMap = {
  fence: FenceIcon,
  paint: FormatPaintIcon,
  bolt: BoltIcon,
  road: AddRoadIcon,
  building: ApartmentIcon,
  tools: HandymanIcon,
  build: ConstructionIcon,
  home: HomeRepairServiceIcon,
  plumbing: PlumbingIcon,
};

export default function ServicesStrip() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });

  return (
    <Box id="services" component="section" sx={{ py: { xs: 7, md: 9 } }}>
      <Container maxWidth="lg">
        <ScrollReveal>
          <Typography sx={{ color: tokens.rust, fontWeight: 700, mb: 1 }}>Our core work: construction</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.9rem", md: "2.4rem" }, mb: 5, maxWidth: 560 }}>
            {data?.length ? `${data.length} services` : "Every service"}, one contractor you don&apos;t have to re-explain the job to.
          </Typography>
        </ScrollReveal>

        <Grid container spacing={2.5}>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: "2px" }} />
              </Grid>
            ))}

          {sortCategories(data)?.map((cat, i) => {
            const Icon = iconMap[cat.icon] || ConstructionIcon;
            return (
              <Grid item xs={12} sm={6} md={4} key={cat._id}>
                <ScrollReveal delay={i * 60}>
                  <Box
                    component={Link}
                    href={`/works?category=${cat._id}`}
                    sx={{
                      display: "block",
                      p: 3,
                      height: "100%",
                      border: `1px solid ${tokens.line}`,
                      backgroundColor: tokens.white,
                      transition: "border-color 0.2s ease, transform 0.2s ease",
                      "&:hover": { borderColor: tokens.rust, transform: "translateY(-2px)" },
                    }}
                  >
                    <Icon sx={{ color: tokens.rust, fontSize: 30 }} />
                    <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", mt: 1.5 }}>
                      {cat.name}
                    </Typography>
                    <Typography sx={{ color: "#5c584f", fontSize: "0.92rem", mt: 0.75 }}>{cat.description}</Typography>
                 {/*    <Typography sx={{ color: tokens.steel, fontWeight: 700, fontSize: "0.85rem", mt: 2 }}>
                      {cat.workCount} completed {cat.workCount === 1 ? "job" : "jobs"}
                    </Typography> */}
                  </Box>
                </ScrollReveal>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
