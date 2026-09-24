"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Box, Container, Grid, Typography, Chip, Skeleton, Stack, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import api, { imgUrl } from "@/lib/api";
import { tokens } from "@/lib/theme";

export default function WorkDetailPage() {
  const { id } = useParams();
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["work", id],
    queryFn: async () => (await api.get(`/works/${id}`)).data.work,
    enabled: !!id,
  });

  return (
    <>
      <Navbar />
      <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Button component={Link} href="/works" startIcon={<ArrowBackIcon />} sx={{ mb: 3, color: tokens.ink, fontWeight: 600 }}>
            Back to all projects
          </Button>

          {isLoading && <Skeleton variant="rectangular" height={420} />}

          {!isLoading && data && (
            <ScrollReveal>
              <Grid container spacing={5}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ position: "relative", aspectRatio: "4 / 3", border: `1px solid ${tokens.line}`, backgroundColor: tokens.white }}>
                    {data.images?.[activeImg] ? (
                      <Image
                        src={imgUrl(data.images[activeImg])}
                        alt={data.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 60vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#9a9587" }}>
                        Photos coming soon
                      </Box>
                    )}
                  </Box>
                  {data.images?.length > 1 && (
                    <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, overflowX: "auto" }}>
                      {data.images.map((img, i) => (
                        <Box
                          key={img.publicId || i}
                          onClick={() => setActiveImg(i)}
                          sx={{
                            position: "relative",
                            width: 84,
                            height: 64,
                            flexShrink: 0,
                            cursor: "pointer",
                            border: `2px solid ${i === activeImg ? tokens.rust : tokens.line}`,
                          }}
                        >
                          <Image src={imgUrl(img)} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Grid>

                <Grid item xs={12} md={5}>
                  <Chip label={data.category?.name} size="small" sx={{ backgroundColor: tokens.paperAlt, fontWeight: 600, mb: 2 }} />
                  <Typography variant="h1" sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" }, mb: 2 }}>
                    {data.title}
                  </Typography>
                  <Typography sx={{ color: "#4A4740", mb: 3, lineHeight: 1.7 }}>{data.description}</Typography>

                  <Stack spacing={1.5}>
                    {data.location && (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <PlaceIcon sx={{ color: tokens.steel }} />
                        <Typography sx={{ fontWeight: 600 }}>{data.location}</Typography>
                      </Stack>
                    )}
                    {data.completedOn && (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CalendarMonthIcon sx={{ color: tokens.steel }} />
                        <Typography sx={{ fontWeight: 600 }}>
                          Completed {new Date(data.completedOn).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Button variant="contained" color="primary" size="large" component={Link} href="/#contact" sx={{ mt: 4 }}>
                    Get a Similar Job Done
                  </Button>
                </Grid>
              </Grid>
            </ScrollReveal>
          )}

          {!isLoading && !data && <Typography>Work item not found.</Typography>}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
