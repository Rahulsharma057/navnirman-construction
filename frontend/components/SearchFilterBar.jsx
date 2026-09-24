"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, InputBase, Stack, Chip, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

export default function SearchFilterBar({ search, setSearch, category, setCategory }) {
  const [localSearch, setLocalSearch] = useState(search);

  // debounce typing so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });

  return (
    <Stack spacing={2.5} sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${tokens.line}`,
          backgroundColor: tokens.white,
          px: 2,
          py: 0.5,
          maxWidth: 480,
        }}
      >
        <InputBase
          fullWidth
          placeholder="Search jobs by title, area, description..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#8a8578" }} />
            </InputAdornment>
          }
        />
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
        <Chip
          label="All"
          onClick={() => setCategory("")}
          sx={{
            backgroundColor: category === "" ? tokens.rust : tokens.white,
            color: category === "" ? tokens.white : tokens.ink,
            border: `1px solid ${category === "" ? tokens.rust : tokens.line}`,
            fontWeight: 600,
          }}
        />
        {[...(categories || [])].sort((a, b) => Number(/construction|building|civil/i.test(b.name)) - Number(/construction|building|civil/i.test(a.name))).map((c) => (
          <Chip
            key={c._id}
            label={c.name}
            onClick={() => setCategory(c._id)}
            sx={{
              backgroundColor: category === c._id ? tokens.rust : tokens.white,
              color: category === c._id ? tokens.white : tokens.ink,
              border: `1px solid ${category === c._id ? tokens.rust : tokens.line}`,
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
