import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ServicePriorityConfig } from "./service-priority-config";
import { loadImageURI } from "@/services/api";

export function ServiceDialog({ open, onClose, service, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: null,
    priorityConfig: {
      immediate: 172800,    // 2 days in seconds
      high: 345600,         // 4 days in seconds
      standard: 999999999   // > 4 days
    },
    birdFee: {
      base: 0,
      percentage: 0
    }
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        category: service.category || "",
        description: service.description || "",
        priorityConfig: service.priorityConfig || {
          immediate: 172800,
          high: 345600,
          standard: 999999999
        },
        birdFee: service.birdFee || {
          base: 0,
          percentage: 0
        }
      });
      setImagePreview(service.imageUrl || null);
    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        image: null,
        priorityConfig: {
          immediate: 172800,
          high: 345600,
          standard: 999999999
        },
        birdFee: {
          base: 0,
          percentage: 0
        }
      });
      setImagePreview(null);
    }
  }, [service]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriorityConfigChange = (config) => {
    setFormData((prev) => ({
      ...prev,
      priorityConfig: config,
    }));
  };

  const handleBirdFeeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      birdFee: {
        ...prev.birdFee,
        [name]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("category", formData.category);
    submitData.append("description", formData.description);
    submitData.append("priorityConfig", JSON.stringify(formData.priorityConfig));
    submitData.append("birdFee", JSON.stringify(formData.birdFee));
    if (formData.image) {
      submitData.append("image", formData.image);
    }
    console.log(submitData.getAll("image"));

    onSave(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 z-10 pt-4">
          <DialogTitle>
            {service ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  handleInputChange({ target: { name: "category", value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREELANCE">Remote job</SelectItem>
                  <SelectItem value="HOUSEHOLD">On-site job</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Service Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={loadImageURI(imagePreview)}
                  alt="Preview"
                  className="max-h-40 rounded"
                />
              </div>
            )}
          </div>

          <ServicePriorityConfig
            config={formData.priorityConfig}
            onChange={handlePriorityConfigChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFee">Base Fee</Label>
              <Input
                id="baseFee"
                name="base"
                type="number"
                value={formData.birdFee.base}
                onChange={handleBirdFeeChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentageFee">Percentage Fee</Label>
              <Input
                id="percentageFee"
                name="percentage"
                type="number"
                value={formData.birdFee.percentage}
                onChange={handleBirdFeeChange}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
