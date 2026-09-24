"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box, Typography, Button, Stack, Paper, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Checkbox, FormControlLabel, LinearProgress, Alert, Tabs, Tab, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import api from "@/lib/api";
import { fmtDate, fmtMoney } from "@/lib/company";
import { tokens } from "@/lib/theme";

const STATUSES = [
  { value: "identified", label: "Identified", color: tokens.steel },
  { value: "preparing", label: "Preparing", color: "#B7791F" },
  { value: "submitted", label: "Submitted", color: "#6B4FA0" },
  { value: "won", label: "Won 🏆", color: tokens.olive },
  { value: "lost", label: "Lost", color: "#8a8578" },
  { value: "cancelled", label: "Cancelled", color: "#8a8578" },
];
const statusMeta = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

const empty = {
  title: "", tenderNo: "", authority: "", location: "", estimatedValue: "", emd: "", quotedAmount: "",
  submissionDate: "", openingDate: "", status: "identified", link: "", notes: "", checklist: [],
};

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const daysLeft = (d) => {
  if (!d) return null;
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
};

export default function AdminTendersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {_id} = edit
  const [form, setForm] = useState(empty);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState("");

  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ["tenders"],
    queryFn: async () => (await api.get("/tenders")).data.tenders,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["tenders"] });
    qc.invalidateQueries({ queryKey: ["tender-stats"] });
  };

  const save = useMutation({
    mutationFn: (payload) => (editing?._id ? api.put(`/tenders/${editing._id}`, payload) : api.post("/tenders", payload)),
    onSuccess: () => { refresh(); setEditing(null); setError(""); },
    onError: (e) => setError(e?.response?.data?.message || "Could not save tender"),
  });
  const remove = useMutation({ mutationFn: (id) => api.delete(`/tenders/${id}`), onSuccess: refresh });
  const patch = useMutation({ mutationFn: ({ id, data }) => api.put(`/tenders/${id}`, data), onSuccess: refresh });

  const openEditor = (t) => {
    setError("");
    setNewItem("");
    setEditing(t || {});
    setForm(t ? { ...empty, ...t, submissionDate: toInputDate(t.submissionDate), openingDate: toInputDate(t.openingDate), estimatedValue: t.estimatedValue ?? "", emd: t.emd ?? "", quotedAmount: t.quotedAmount ?? "" } : empty);
  };

  const shown = tab === "all" ? tenders : tenders.filter((t) => t.status === tab);
  const counts = tenders.reduce((a, t) => ({ ...a, [t.status]: (a[t.status] || 0) + 1 }), {});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const toggleItem = (tender, idx) => {
    const checklist = tender.checklist.map((c, i) => (i === idx ? { ...c, done: !c.done } : c));
    patch.mutate({ id: tender._id, data: { checklist } });
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: "1.6rem" }}>Tenders</Typography>
          <Typography sx={{ color: "#6b665c" }}>Track every tender from first sight to result — deadlines, EMD and the documents you still need.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditor(null)}>New tender</Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ my: 2, borderBottom: `1px solid ${tokens.line}` }}>
        <Tab value="all" label={`All (${tenders.length})`} />
        {STATUSES.map((s) => <Tab key={s.value} value={s.value} label={`${s.label} (${counts[s.value] || 0})`} />)}
      </Tabs>

      {isLoading && <LinearProgress />}
      {!isLoading && shown.length === 0 && (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: `1px dashed ${tokens.line}` }}>
          <Typography sx={{ fontWeight: 700 }}>No tenders here yet</Typography>
          <Typography sx={{ color: "#6b665c", mb: 2 }}>Add a tender you plan to bid for — a document checklist is created for you.</Typography>
          <Button variant="outlined" onClick={() => openEditor(null)} sx={{ borderColor: tokens.ink, color: tokens.ink }}>Add your first tender</Button>
        </Paper>
      )}

      <Grid container spacing={2}>
        {shown.map((t) => {
          const dl = ["identified", "preparing"].includes(t.status) ? daysLeft(t.submissionDate) : null;
          const done = t.checklist?.filter((c) => c.done).length || 0;
          const total = t.checklist?.length || 0;
          return (
            <Grid item xs={12} lg={6} key={t._id}>
              <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${dl !== null && dl <= 3 ? tokens.rust : tokens.line}`, height: "100%" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.5, mb: 0.5 }}>
                      <Chip size="small" label={statusMeta[t.status]?.label} sx={{ backgroundColor: statusMeta[t.status]?.color, color: "#fff" }} />
                      {dl !== null && (
                        <Chip size="small" variant="outlined"
                          color={dl < 0 ? "error" : dl <= 3 ? "warning" : "default"}
                          label={dl < 0 ? `Deadline passed ${-dl}d ago` : dl === 0 ? "Due today" : `${dl} day${dl === 1 ? "" : "s"} left`} />
                      )}
                    </Stack>
                    <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>{t.title}</Typography>
                    <Typography sx={{ color: "#6b665c", fontSize: "0.88rem" }}>
                      {[t.authority, t.location, t.tenderNo && `No. ${t.tenderNo}`].filter(Boolean).join(" · ")}
                    </Typography>
                  </Box>
                  <Stack direction="row">
                    {t.link && <IconButton size="small" component="a" href={t.link} target="_blank" rel="noopener noreferrer" aria-label="Open tender link"><OpenInNewIcon fontSize="small" /></IconButton>}
                    <IconButton size="small" onClick={() => openEditor(t)} aria-label="Edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => window.confirm("Delete this tender?") && remove.mutate(t._id)} aria-label="Delete"><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </Stack>

                <Grid container spacing={1} sx={{ mt: 1.5, mb: 1.5 }}>
                  {[
                    ["Submit by", fmtDate(t.submissionDate)],
                    ["Estimated value", fmtMoney(t.estimatedValue)],
                    ["EMD", fmtMoney(t.emd)],
                    ["Our quote", fmtMoney(t.quotedAmount)],
                  ].map(([k, v]) => (
                    <Grid item xs={6} sm={3} key={k}>
                      <Typography sx={{ fontSize: "0.72rem", color: "#8a8578", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }}>{v}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {total > 0 && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>Documents ready: {done}/{total}</Typography>
                      <TextField select size="small" value={t.status} onChange={(e) => patch.mutate({ id: t._id, data: { status: e.target.value } })} sx={{ minWidth: 130 }}>
                        {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                      </TextField>
                    </Stack>
                    <LinearProgress variant="determinate" value={(done / total) * 100} sx={{ my: 1, height: 6, backgroundColor: tokens.paperAlt, "& .MuiLinearProgress-bar": { backgroundColor: tokens.olive } }} />
                    <Box sx={{ columnCount: { xs: 1, sm: 2 }, columnGap: 2 }}>
                      {t.checklist.map((c, i) => (
                        <FormControlLabel key={`${c.label}-${i}`} sx={{ display: "flex", m: 0, breakInside: "avoid" }}
                          control={<Checkbox size="small" checked={c.done} onChange={() => toggleItem(t, i)} sx={{ py: 0.3, "&.Mui-checked": { color: tokens.olive } }} />}
                          label={<Typography sx={{ fontSize: "0.85rem", textDecoration: c.done ? "line-through" : "none", color: c.done ? "#8a8578" : "inherit" }}>{c.label}</Typography>} />
                      ))}
                    </Box>
                  </Box>
                )}
                {t.notes && <Typography sx={{ mt: 1.5, fontSize: "0.85rem", color: "#4A4740", whiteSpace: "pre-wrap" }}>{t.notes}</Typography>}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* create / edit dialog */}
      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>{editing?._id ? "Edit tender" : "New tender"}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}><TextField label="Tender title / work name" required fullWidth value={form.title} onChange={set("title")} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Issuing authority / department" fullWidth value={form.authority} onChange={set("authority")} placeholder="e.g. MCD, PWD, DDA" /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Tender number" fullWidth value={form.tenderNo} onChange={set("tenderNo")} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Work location" fullWidth value={form.location} onChange={set("location")} /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Status" fullWidth value={form.status} onChange={set("status")}>{STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField type="date" label="Submission deadline" fullWidth InputLabelProps={{ shrink: true }} value={form.submissionDate} onChange={set("submissionDate")} /></Grid>
            <Grid item xs={12} sm={6}><TextField type="date" label="Bid opening date" fullWidth InputLabelProps={{ shrink: true }} value={form.openingDate} onChange={set("openingDate")} /></Grid>
            <Grid item xs={12} sm={4}><TextField type="number" label="Estimated value (₹)" fullWidth value={form.estimatedValue} onChange={set("estimatedValue")} /></Grid>
            <Grid item xs={12} sm={4}><TextField type="number" label="EMD (₹)" fullWidth value={form.emd} onChange={set("emd")} /></Grid>
            <Grid item xs={12} sm={4}><TextField type="number" label="Our quoted amount (₹)" fullWidth value={form.quotedAmount} onChange={set("quotedAmount")} /></Grid>
            <Grid item xs={12}><TextField label="Tender link (optional)" fullWidth value={form.link} onChange={set("link")} placeholder="https://" /></Grid>
            <Grid item xs={12}><TextField label="Notes" fullWidth multiline minRows={2} value={form.notes} onChange={set("notes")} /></Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 1 }}>Documents checklist {!editing?._id && <span style={{ fontWeight: 400, color: "#8a8578" }}>(a standard list is added automatically — you can edit it after saving)</span>}</Typography>
              {form.checklist.map((c, i) => (
                <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Checkbox size="small" checked={c.done} onChange={() => setForm({ ...form, checklist: form.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} />
                  <Typography sx={{ flexGrow: 1, fontSize: "0.9rem" }}>{c.label}</Typography>
                  <IconButton size="small" onClick={() => setForm({ ...form, checklist: form.checklist.filter((_, j) => j !== i) })}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
              ))}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField size="small" fullWidth placeholder="Add a document / task" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setForm({ ...form, checklist: [...form.checklist, { label: newItem.trim(), done: false }] }); setNewItem(""); } } }} />
                <Button variant="outlined" sx={{ borderColor: tokens.ink, color: tokens.ink }} onClick={() => { if (newItem.trim()) { setForm({ ...form, checklist: [...form.checklist, { label: newItem.trim(), done: false }] }); setNewItem(""); } }}>Add</Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditing(null)} sx={{ color: tokens.ink }}>Cancel</Button>
          <Button variant="contained" disabled={save.isPending || !form.title.trim()} onClick={() => save.mutate({ ...form, checklist: form.checklist.map(({ label, done }) => ({ label, done })) })}>
            {save.isPending ? "Saving..." : "Save tender"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
