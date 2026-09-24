"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, Paper, Stack, Chip, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailReadOutlined";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => (await api.get("/contact")).data.messages,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["messages"] });

  const readMutation = useMutation({
    mutationFn: (id) => api.patch(`/contact/${id}/read`),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/contact/${id}`),
    onSuccess: invalidate,
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 3 }}>
        Enquiries
      </Typography>

      <Stack spacing={1.5}>
        {messages?.map((m) => (
          <Paper
            key={m._id}
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${m.isRead ? tokens.line : tokens.rust}`,
              backgroundColor: m.isRead ? tokens.white : tokens.paperAlt,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={1}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                  {!m.isRead && <Chip label="New" size="small" color="primary" />}
                  {m.category?.name && <Chip label={m.category.name} size="small" sx={{ backgroundColor: tokens.paper }} />}
                </Stack>
                <Typography sx={{ color: "#6b665c", fontSize: "0.9rem" }}>
                  {m.phone} {m.email ? `· ${m.email}` : ""}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                {!m.isRead && (
                  <IconButton size="small" onClick={() => readMutation.mutate(m._id)} title="Mark as read">
                    <MarkEmailReadIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => deleteMutation.mutate(m._id)} title="Delete">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
            <Typography sx={{ mt: 1.5 }}>{m.message}</Typography>
            <Typography sx={{ mt: 1, fontSize: "0.8rem", color: "#9a9587" }}>
              {new Date(m.createdAt).toLocaleString("en-IN")}
            </Typography>
          </Paper>
        ))}

        {messages?.length === 0 && (
          <Typography sx={{ color: "#6b665c" }}>No enquiries yet — they&apos;ll show up here as visitors submit the contact form.</Typography>
        )}
      </Stack>
    </Box>
  );
}
