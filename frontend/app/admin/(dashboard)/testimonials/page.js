"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  IconButton,
  Alert,
  Rating,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

const emptyForm = { clientName: "", workLocation: "", message: "", rating: 5 };

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await api.get("/testimonials")).data.testimonials,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["testimonials"] });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/testimonials", payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      setError("");
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not add testimonial"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/testimonials/${id}`, payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      setEditingId(null);
      setError("");
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not update testimonial"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/testimonials/${id}`),
    onSuccess: invalidate,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({ clientName: t.clientName, workLocation: t.workLocation || "", message: t.message, rating: t.rating });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 1 }}>
        Testimonials
      </Typography>
      <Typography sx={{ color: "#6b665c", mb: 3 }}>
        Add real feedback from your clients — this shows up in the &quot;What clients say&quot; section on your site.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 4, maxWidth: 520 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>{editingId ? "Edit testimonial" : "Add a testimonial"}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Client name"
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
            <TextField
              label="Location (optional)"
              value={form.workLocation}
              onChange={(e) => setForm({ ...form, workLocation: e.target.value })}
            />
            <TextField
              label="What they said"
              required
              multiline
              minRows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <Box>
              <Typography sx={{ fontSize: "0.85rem", color: "#6b665c", mb: 0.5 }}>Rating</Typography>
              <Rating
                value={form.rating}
                onChange={(e, v) => setForm({ ...form, rating: v || 5 })}
                sx={{ color: tokens.rust }}
              />
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" color="primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Save Changes" : "Add Testimonial"}
              </Button>
              {editingId && (
                <Button onClick={cancelEdit} startIcon={<CloseIcon />}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Stack spacing={1.5}>
        {testimonials?.map((t) => (
          <Paper
            key={t._id}
            elevation={0}
            sx={{ p: 2, border: `1px solid ${tokens.line}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 700 }}>{t.clientName}</Typography>
                <Rating value={t.rating} readOnly size="small" sx={{ color: tokens.rust }} />
              </Stack>
              {t.workLocation && <Typography sx={{ fontSize: "0.85rem", color: "#6b665c" }}>{t.workLocation}</Typography>}
              <Typography sx={{ mt: 0.5 }}>{t.message}</Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <IconButton onClick={() => startEdit(t)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => deleteMutation.mutate(t._id)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
