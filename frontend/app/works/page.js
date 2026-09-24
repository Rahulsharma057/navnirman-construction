"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Grid, Typography, Skeleton, Pagination, Stack } from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchFilterBar from "@/components/SearchFilterBar";
import WorkCard from "@/components/WorkCard";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

function WorksContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [page, setPage] = useState(1);

  const queryKey = useMemo(() => ["works", { search, category, page }], [search, category, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await api.get("/works", {
          params: { search: search || undefined, category: category || undefined, page, limit: 9 },
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  return (
    <>
      <Navbar />
      <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography sx={{ color: tokens.rust, fontWeight: 700, mb: 1 }}>Our Work</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, mb: 4, maxWidth: 620 }}>
              Every job on this page has been completed for a real client.
            </Typography>
          </ScrollReveal>

          <SearchFilterBar
            search={search}
            setSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            category={category}
            setCategory={(v) => {
              setCategory(v);
              setPage(1);
            }}
          />

          <Grid container spacing={2.5}>
            {(isLoading || isFetching) &&
              Array.from({ length: 9 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 3" }} />
                </Grid>
              ))}
            {!isLoading &&
              !isFetching &&
              data?.works?.map((w, i) => (
                <Grid item xs={12} sm={6} md={4} key={w._id}>
                  <ScrollReveal delay={(i % 3) * 60}>
                    <WorkCard work={w} />
                  </ScrollReveal>
                </Grid>
              ))}
            {!isLoading && !isFetching && data?.works?.length === 0 && (
              <Grid item xs={12}>
                <Typography sx={{ color: "#6b665c" }}>
                  No jobs match that search yet. Try a different keyword or category.
                </Typography>
              </Grid>
            )}
          </Grid>

          {data?.pagination?.pages > 1 && (
            <Stack alignItems="center" sx={{ mt: 5 }}>
              <Pagination
                count={data.pagination.pages}
                page={page}
                onChange={(e, v) => setPage(v)}
                shape="rounded"
              />
            </Stack>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default function WorksPage() {
  return (
    <Suspense fallback={null}>
      <WorksContent />
    </Suspense>
  );
}
