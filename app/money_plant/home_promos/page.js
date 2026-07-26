"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import { adminHomePromoApi, adminServiceApi, loadImageURI } from "@/services/api";
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

const emptyForm = () => ({
  placement: "BANNER",
  title: "",
  subtitle: "",
  badge: "",
  ctaLabel: "Book now",
  imageUrl: "",
  backgroundColor: "#F3EAFF",
  textColor: "#101114",
  accentColor: "#7B2CFF",
  sortOrder: 0,
  isActive: true,
  startsAt: "",
  endsAt: "",
  serviceId: "",
  serviceType: "",
  prefillJobTitle: "",
  prefillJobDescription: "",
  prefillBudget: "",
  prefillJobType: "",
  prefillPaymentMethod: "",
  prefillSkills: "",
});

export default function HomePromosPage() {
  const { getToken } = useAdminAuth();
  const { toast } = useToast();
  const [promos, setPromos] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const filtered = useMemo(() => {
    if (filter === "ALL") return promos;
    return promos.filter((p) => p.placement === filter);
  }, [promos, filter]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const [promoRes, serviceRes] = await Promise.all([
        adminHomePromoApi.list(token),
        adminServiceApi.getAllServices({ token, page: 1, limit: 200 }),
      ]);
      setPromos(promoRes?.data?.promos || []);
      setServices(serviceRes?.data?.services || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load home promos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    setPreviewUrl("");
    setDialogOpen(true);
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setForm({
      placement: promo.placement || "BANNER",
      title: promo.title || "",
      subtitle: promo.subtitle || "",
      badge: promo.badge || "",
      ctaLabel: promo.ctaLabel || "",
      imageUrl: promo.imageUrl || "",
      backgroundColor: promo.backgroundColor || "#F3EAFF",
      textColor: promo.textColor || "#101114",
      accentColor: promo.accentColor || "#7B2CFF",
      sortOrder: promo.sortOrder ?? 0,
      isActive: promo.isActive !== false,
      startsAt: promo.startsAt ? String(promo.startsAt).slice(0, 16) : "",
      endsAt: promo.endsAt ? String(promo.endsAt).slice(0, 16) : "",
      serviceId: promo.serviceId || "",
      serviceType: promo.serviceType || "",
      prefillJobTitle: promo.prefillJobTitle || "",
      prefillJobDescription: promo.prefillJobDescription || "",
      prefillBudget: promo.prefillBudget || "",
      prefillJobType: promo.prefillJobType || "",
      prefillPaymentMethod: promo.prefillPaymentMethod || "",
      prefillSkills: Array.isArray(promo.prefillSkills)
        ? promo.prefillSkills.join(", ")
        : promo.prefillSkills || "",
    });
    setImageFile(null);
    setPreviewUrl(promo.imageUrl ? loadImageURI(promo.imageUrl) : "");
    setDialogOpen(true);
  };

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "serviceId") {
        const selected = services.find((s) => s.id === value);
        if (selected) {
          next.serviceType =
            selected.category === "HOUSEHOLD" ? "household" : "freelance";
          if (!next.prefillJobType) {
            next.prefillJobType =
              selected.category === "HOUSEHOLD" ? "On-site" : "Remote";
          }
        } else {
          next.serviceType = "";
        }
      }
      return next;
    });
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: "Validation",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      const token = getToken();
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        serviceId: form.serviceId || null,
        prefillSkills: form.prefillSkills
          ? form.prefillSkills.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
      };

      if (editing) {
        await adminHomePromoApi.update(token, editing.id, payload, imageFile);
        toast({ title: "Updated", description: "Home promo saved." });
      } else {
        await adminHomePromoApi.create(token, payload, imageFile);
        toast({ title: "Created", description: "Home promo created." });
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this promo?")) return;
    try {
      const token = getToken();
      await adminHomePromoApi.remove(token, id);
      toast({ title: "Deleted", description: "Home promo removed." });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Home Promos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Client Home banners (16:9 images) and Offers &amp; Discounts cards.
            Taps open Job Requirements with optional prefills.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-purple-700 hover:bg-purple-800">
          <Plus className="w-4 h-4 mr-2" />
          Add promo
        </Button>
      </div>

      <div className="flex gap-2">
        {["ALL", "BANNER", "OFFER_CARD"].map((key) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
            className={filter === key ? "bg-purple-700" : ""}
          >
            {key === "ALL" ? "All" : key === "BANNER" ? "Banners" : "Offer cards"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-purple-200 p-10 text-center text-muted-foreground">
          No promos yet. Add a banner or offer card to show on Client Home.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((promo) => (
            <div
              key={promo.id}
              className="rounded-xl border border-purple-100 bg-white overflow-hidden shadow-sm"
            >
              <div
                className="aspect-video bg-purple-50 relative"
                style={{ backgroundColor: promo.backgroundColor || "#F3EAFF" }}
              >
                {promo.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loadImageURI(promo.imageUrl)}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-purple-300">
                    <ImagePlus className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-black/60 text-white px-2 py-1 rounded">
                  {promo.placement === "BANNER" ? "Banner" : "Offer card"}
                </span>
                {!promo.isActive && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-purple-950">{promo.title}</h3>
                {promo.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{promo.subtitle}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Order {promo.sortOrder}
                  {promo.serviceName ? ` · Service: ${promo.serviceName}` : ""}
                  {promo.prefillJobTitle ? ` · Prefill title` : ""}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(promo)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200"
                    onClick={() => handleDelete(promo.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit home promo" : "Add home promo"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Placement</Label>
                <select
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  value={form.placement}
                  onChange={(e) => updateField("placement", e.target.value)}
                >
                  <option value="BANNER">Banner carousel (16:9)</option>
                  <option value="OFFER_CARD">Offers &amp; Discounts card</option>
                </select>
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => updateField("sortOrder", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div>
              <Label>Subtitle / description</Label>
              <Textarea
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Badge</Label>
                <Input
                  placeholder="e.g. 10 mins"
                  value={form.badge}
                  onChange={(e) => updateField("badge", e.target.value)}
                />
              </div>
              <div>
                <Label>CTA label</Label>
                <Input
                  placeholder="Book now"
                  value={form.ctaLabel}
                  onChange={(e) => updateField("ctaLabel", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>
                Image {form.placement === "BANNER" ? "(recommended 16:9)" : "(optional)"}
              </Label>
              <Input type="file" accept="image/*" onChange={onPickImage} className="mt-1" />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 w-full max-h-48 object-cover rounded-lg border"
                />
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Background</Label>
                <Input
                  type="color"
                  value={form.backgroundColor || "#F3EAFF"}
                  onChange={(e) => updateField("backgroundColor", e.target.value)}
                />
              </div>
              <div>
                <Label>Text</Label>
                <Input
                  type="color"
                  value={form.textColor || "#101114"}
                  onChange={(e) => updateField("textColor", e.target.value)}
                />
              </div>
              <div>
                <Label>Accent</Label>
                <Input
                  type="color"
                  value={form.accentColor || "#7B2CFF"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Starts at</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => updateField("startsAt", e.target.value)}
                />
              </div>
              <div>
                <Label>Ends at</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => updateField("endsAt", e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField("isActive", e.target.checked)}
              />
              Active on Client Home
            </label>

            <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4 space-y-3">
              <h4 className="font-semibold text-purple-900 text-sm">
                Job Requirements prefill (on tap)
              </h4>
              <div>
                <Label>Linked service</Label>
                <select
                  className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                  value={form.serviceId}
                  onChange={(e) => updateField("serviceId", e.target.value)}
                >
                  <option value="">None</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prefill job title</Label>
                  <Input
                    value={form.prefillJobTitle}
                    onChange={(e) => updateField("prefillJobTitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Prefill budget</Label>
                  <Input
                    value={form.prefillBudget}
                    onChange={(e) => updateField("prefillBudget", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Prefill description</Label>
                <Textarea
                  rows={2}
                  value={form.prefillJobDescription}
                  onChange={(e) => updateField("prefillJobDescription", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Job type</Label>
                  <select
                    className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                    value={form.prefillJobType}
                    onChange={(e) => updateField("prefillJobType", e.target.value)}
                  >
                    <option value="">Default from service</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <Label>Payment method</Label>
                  <select
                    className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                    value={form.prefillPaymentMethod}
                    onChange={(e) => updateField("prefillPaymentMethod", e.target.value)}
                  >
                    <option value="">No change</option>
                    <option value="PLATFORM">PLATFORM</option>
                    <option value="CASH">CASH</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input
                  placeholder="Cleaning, Plumbing"
                  value={form.prefillSkills}
                  onChange={(e) => updateField("prefillSkills", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
