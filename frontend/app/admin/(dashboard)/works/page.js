"use client";
import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Grid,
  MenuItem,
  IconButton,
  Alert,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import api, { imgUrl } from "@/lib/api";
import { tokens } from "@/lib/theme";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  completedOn: "",
  clientType: "residential",
  status: "completed",
  featured: false,
};

export default function AdminWorksPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.categories,
  });

  const { data } = useQuery({
    queryKey: ["admin-works"],
    queryFn: async () => (await api.get("/works", { params: { limit: 50 } })).data.works,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-works"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFiles([]);
    setExistingImages([]);
    setRemoveIds([]);
    setEditingId(null);
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    files.forEach((f) => fd.append("images", f));
    if (removeIds.length > 0) fd.append("removeImages", JSON.stringify(removeIds));
    return fd;
  };

  const createMutation = useMutation({
    mutationFn: (fd) => api.post("/works", fd, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      invalidate();
      resetForm();
      setError("");
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not save this work item"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => api.put(`/works/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      invalidate();
      resetForm();
      setError("");
    },
    onError: (err) => setError(err?.response?.data?.message || "Could not update this work item"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/works/${id}`),
    onSuccess: invalidate,
    onError: (err) => setError(err?.response?.data?.message || "Could not delete this work item"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingId && files.length === 0) {
      setError("Add at least one photo of the completed job");
      return;
    }
    if (editingId && existingImages.length === 0 && files.length === 0) {
      setError("A work item needs at least one photo");
      return;
    }
    const fd = buildFormData();
    if (editingId) {
      updateMutation.mutate({ id: editingId, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const startEdit = (w) => {
    setEditingId(w._id);
    setForm({
      title: w.title,
      description: w.description,
      category: w.category?._id || "",
      location: w.location || "",
      completedOn: w.completedOn ? w.completedOn.slice(0, 10) : "",
      clientType: w.clientType || "residential",
      status: w.status || "completed",
      featured: !!w.featured,
    });
    setExistingImages(w.images || []);
    setRemoveIds([]);
    setFiles([]);
  };

  const removeExistingImage = (publicId) => {
    setExistingImages((imgs) => imgs.filter((img) => img.publicId !== publicId));
    setRemoveIds((ids) => [...ids, publicId]);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 3 }}>
        Work Gallery
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.line}`, mb: 4 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>{editingId ? "Edit work item" : "Add a completed job"}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                required
                fullWidth
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Category"
                required
                fullWidth
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories?.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                required
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Location"
                fullWidth
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Completed on"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.completedOn}
                onChange={(e) => setForm({ ...form, completedOn: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Status"
                fullWidth
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in-progress">In progress</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Client type"
                fullWidth
                value={form.clientType}
                onChange={(e) => setForm({ ...form, clientType: e.target.value })}
              >
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="government">Government</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ height: "100%", borderColor: tokens.line, color: tokens.ink }}
              >
                {files.length > 0 ? `${files.length} photo(s) selected` : editingId ? "Add more photos (optional)" : "Upload photos"}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </Button>
            </Grid>
            {editingId && existingImages.length > 0 && (
              <Grid item xs={12}>
                <Typography sx={{ fontSize: "0.85rem", color: "#6b665c", mb: 1 }}>Current photos (click × to remove)</Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ rowGap: 1.5 }}>
                  {existingImages.map((img) => (
                    <Box key={img.publicId} sx={{ position: "relative", width: 84, height: 64 }}>
                      <Image src={imgUrl(img)} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
                      <IconButton
                        size="small"
                        onClick={() => removeExistingImage(img.publicId)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: tokens.ink,
                          color: tokens.white,
                          width: 22,
                          height: 22,
                          "&:hover": { backgroundColor: tokens.rust },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button type="submit" variant="contained" color="primary" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Work Item"}
                </Button>
                {editingId && (
                  <Button onClick={resetForm} startIcon={<CloseIcon />}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {data?.map((w) => (
          <Grid item xs={12} sm={6} md={4} key={w._id}>
            <Paper elevation={0} sx={{ border: `1px solid ${tokens.line}`, overflow: "hidden" }}>
              <Box sx={{ position: "relative", aspectRatio: "4 / 3", backgroundColor: tokens.paperAlt }}>
                {w.images?.[0] && (
                  <Image src={imgUrl(w.images[0])} alt={w.title} fill sizes="300px" style={{ objectFit: "cover" }} />
                )}
              </Box>
              <Box sx={{ p: 2 }}>
                <Chip label={w.category?.name} size="small" sx={{ backgroundColor: tokens.paperAlt, fontWeight: 600, mb: 1 }} />
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {w.title}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#6b665c" }}>{w.status}</Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => startEdit(w)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(w._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
