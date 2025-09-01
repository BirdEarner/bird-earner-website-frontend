"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceDialog } from "@/components/services/service-dialog";
import { useToast } from "@/components/ui/use-toast";
import { adminServiceApi } from '@/services/api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = async () => {
    try {
      const response = await adminServiceApi.getAllServices({
        page,
        search: searchQuery
      });
      setServices(response.data.services);
      setTotalPages(response.data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowDialog(true);
  };

  const handleDelete = async (serviceId) => {
    try {
      await adminServiceApi.deleteService(serviceId);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingService) {
        await adminServiceApi.updateService(editingService.id, formData);
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        console.log({formData});
        
        await adminServiceApi.createService(formData);
        toast({
          title: "Success",
          description: "Service created successfully",
        });
      }
      setShowDialog(false);
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services Management</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEdit(service)}
                onDelete={() => handleDelete(service.id)}
              />
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No services found
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <ServiceDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        service={editingService}
        onSave={handleSave}
      />
    </div>
  );
}
