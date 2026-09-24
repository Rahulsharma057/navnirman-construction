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
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import api from "@/lib/api";
import { tokens } from "@/lib/theme";

const emptyForm = { name: "", description: "" };

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/categories", payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      setError("");
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/categories/${id}`, payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      setEditingId(null);
      setError("");
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: invalidate,
    onError: (err) => setError(err?.response?.data?.message || "Could not delete category"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 3 }}>
        Categories
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 4, maxWidth: 480 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>{editingId ? "Edit category" : "Add a category"}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" color="primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Save Changes" : "Add Category"}
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
        {categories?.map((cat) => (
          <Paper
            key={cat._id}
            elevation={0}
            sx={{ p: 2, border: `1px solid ${tokens.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                {cat.name} <span style={{ color: "#9a9587", fontWeight: 500 }}>· {cat.workCount} jobs</span>
              </Typography>
              <Typography sx={{ color: "#6b665c", fontSize: "0.9rem" }}>{cat.description}</Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <IconButton onClick={() => startEdit(cat)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => deleteMutation.mutate(cat._id)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
