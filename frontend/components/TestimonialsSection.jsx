"use client";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Grid, Typography, Stack, Skeleton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

function Stars({ rating }) {
  return (
    <Stack direction="row" spacing={0.25}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <StarIcon key={i} sx={{ fontSize: 18, color: tokens.rust }} />
        ) : (
          <StarBorderIcon key={i} sx={{ fontSize: 18, color: tokens.line }} />
        )
      )}
    </Stack>
  );
}

export default function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await api.get("/testimonials")).data.testimonials,
  });

  if (!isLoading && (!testimonials || testimonials.length === 0)) return null;

  return (
    <Box component="section" sx={{ py: { xs: 7, md: 9 }, backgroundColor: tokens.paperAlt }}>
      <Container maxWidth="lg">
        <ScrollReveal>
          <Typography sx={{ color: tokens.rust, fontWeight: 700, mb: 1 }}>What clients say</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.9rem", md: "2.4rem" }, mb: 5, maxWidth: 560 }}>
            Word of mouth is most of our business.
          </Typography>
        </ScrollReveal>

        <Grid container spacing={2.5}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={180} />
              </Grid>
            ))}

          {testimonials?.map((t, i) => (
            <Grid item xs={12} md={4} key={t._id}>
              <ScrollReveal delay={i * 80}>
                <Box sx={{ p: 3, height: "100%", border: `1px solid ${tokens.line}`, backgroundColor: tokens.white, position: "relative" }}>
                  <FormatQuoteIcon sx={{ color: tokens.line, fontSize: 34, position: "absolute", top: 14, right: 14 }} />
                  <Stars rating={t.rating} />
                  <Typography sx={{ mt: 2, color: "#3A362F", lineHeight: 1.7 }}>{t.message}</Typography>
                  <Typography sx={{ mt: 2.5, fontWeight: 700 }}>{t.clientName}</Typography>
                  {t.workLocation && <Typography sx={{ fontSize: "0.85rem", color: "#6b665c" }}>{t.workLocation}</Typography>}
                </Box>
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
