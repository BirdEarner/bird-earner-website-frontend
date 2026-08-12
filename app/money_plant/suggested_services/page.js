"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Sparkles, CheckCircle2, XCircle, Link2, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { adminSuggestedServiceApi, adminServiceApi } from '@/services/api';
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SuggestedServicesPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [matchModalSuggestion, setMatchModalSuggestion] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedMatchServiceId, setSelectedMatchServiceId] = useState('');
  const [matchSearch, setMatchSearch] = useState('');

  const [approveModalSuggestion, setApproveModalSuggestion] = useState(null);
  const [approveForm, setApproveForm] = useState({ category: 'FREELANCE', description: '', imageUrl: '' });

  const [previewImage, setPreviewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();
  const { getToken, logout } = useAdminAuth();

  const fetchSuggestions = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      const response = await adminSuggestedServiceApi.getSuggestedServices({
        token,
        page,
        limit: 10,
        status: statusFilter,
        search: searchQuery,
      });
      setSuggestions(response.data.suggestions || []);
      setTotalPages(response.data.pagination.totalPages || 1);
    } catch (error) {
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        logout();
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to fetch suggested services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingServices = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await adminServiceApi.getAllServices({ token, limit: 100, search: matchSearch });
      setAvailableServices(res.data.services || []);
    } catch (e) {
      console.error('Failed to load existing services', e);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    if (matchModalSuggestion) {
      fetchExistingServices();
    }
  }, [matchModalSuggestion, matchSearch]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleOpenMatch = (suggestion) => {
    setMatchModalSuggestion(suggestion);
    setSelectedMatchServiceId(suggestion.matchedServiceId || '');
  };

  const handleOpenApprove = (suggestion) => {
    setApproveModalSuggestion(suggestion);
    setApproveForm({
      category: 'FREELANCE',
      description: suggestion.description || '',
      imageUrl: suggestion.images && suggestion.images.length > 0 ? suggestion.images[0] : '',
    });
  };

  const handleConfirmMatch = async () => {
    if (!selectedMatchServiceId) {
      toast({ title: "Validation Error", description: "Please select an existing service to match", variant: "destructive" });
      return;
    }
    try {
      setActionLoading(true);
      const token = getToken();
      await adminSuggestedServiceApi.updateSuggestionStatus(token, {
        id: matchModalSuggestion.id,
        action: 'match',
        matchedServiceId: selectedMatchServiceId,
      });
      toast({ title: "Success", description: "Service suggestion matched successfully" });
      setMatchModalSuggestion(null);
      fetchSuggestions();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to match service", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmApprove = async () => {
    try {
      setActionLoading(true);
      const token = getToken();
      await adminSuggestedServiceApi.updateSuggestionStatus(token, {
        id: approveModalSuggestion.id,
        action: 'approve',
        category: approveForm.category,
        description: approveForm.description,
        imageUrl: approveForm.imageUrl,
      });
      toast({ title: "Success", description: "Suggestion approved and new service created successfully!" });
      setApproveModalSuggestion(null);
      fetchSuggestions();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to approve service", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (suggestion) => {
    if (!confirm(`Are you sure you want to reject the suggested service "${suggestion.serviceName}"?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const token = getToken();
      await adminSuggestedServiceApi.updateSuggestionStatus(token, {
        id: suggestion.id,
        action: 'reject',
      });
      toast({ title: "Success", description: "Service suggestion rejected" });
      fetchSuggestions();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to reject suggestion", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approve':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Approved</Badge>;
      case 'match':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Matched</Badge>;
      case 'reject':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-300">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Suggested Services Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review service requests suggested by freelancers during registration.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by service name, freelancer name or email..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'match', 'approve', 'reject'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "default" : "outline"}
              size="sm"
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`capitalize text-xs font-medium ${statusFilter === st ? "bg-purple-700 hover:bg-purple-800" : ""}`}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No Service Suggestions Found</h3>
          <p className="text-sm text-gray-500">No freelancer suggestions match the current criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-purple-50/80 border-b border-purple-100 text-xs font-semibold uppercase text-purple-900">
                <tr>
                  <th className="px-4 py-3">Suggested Service</th>
                  <th className="px-4 py-3">Freelancer</th>
                  <th className="px-4 py-3">Images</th>
                  <th className="px-4 py-3">Status / Match Info</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900">{item.serviceName}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{item.userFullName || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{item.userEmail}</div>
                      {item.userMobile && <div className="text-xs text-slate-400">{item.userMobile}</div>}
                    </td>
                    <td className="px-4 py-4">
                      {item.images && item.images.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {item.images.slice(0, 3).map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt="Sample"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                              onClick={() => setPreviewImage(imgUrl)}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No images</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(item.status)}
                        {item.matchedServiceName && (
                          <div className="text-xs text-purple-700 font-medium flex items-center gap-1 mt-1">
                            <Link2 className="w-3 h-3" />
                            Matched: {item.matchedServiceName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenMatch(item)}
                          className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Link2 className="w-3.5 h-3.5 mr-1" />
                          Match
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenApprove(item)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(item)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Match with Existing Service */}
      <Dialog open={!!matchModalSuggestion} onOpenChange={() => setMatchModalSuggestion(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Link2 className="w-5 h-5 text-blue-600" />
              Match with Existing Service
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              Pair suggestion <strong>&quot;{matchModalSuggestion?.serviceName}&quot;</strong> with an existing platform service.
            </p>

            <Input
              placeholder="Search existing services..."
              value={matchSearch}
              onChange={(e) => setMatchSearch(e.target.value)}
              className="text-sm"
            />

            <div className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-2">
              {availableServices.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedMatchServiceId(svc.id)}
                  className={`p-2.5 rounded-md text-sm cursor-pointer transition flex justify-between items-center ${
                    selectedMatchServiceId === svc.id ? 'bg-purple-100 text-purple-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div>{svc.name}</div>
                    <div className="text-xs text-slate-400">{svc.category}</div>
                  </div>
                  {selectedMatchServiceId === svc.id && <CheckCircle2 className="w-4 h-4 text-purple-700" />}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchModalSuggestion(null)}>Cancel</Button>
            <Button onClick={handleConfirmMatch} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Match"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Approve & Create Service */}
      <Dialog open={!!approveModalSuggestion} onOpenChange={() => setApproveModalSuggestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Approve & Create Service
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              Approving will create a new service available to all users.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Service Name</label>
              <Input value={approveModalSuggestion?.serviceName || ''} disabled className="bg-slate-100" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
              <select
                value={approveForm.category}
                onChange={(e) => setApproveForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="FREELANCE">FREELANCE</option>
                <option value="HOUSEHOLD">HOUSEHOLD</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <textarea
                value={approveForm.description}
                onChange={(e) => setApproveForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-purple-500"
                placeholder="Service description..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL</label>
              <Input
                value={approveForm.imageUrl}
                onChange={(e) => setApproveForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalSuggestion(null)}>Cancel</Button>
            <Button onClick={handleConfirmApprove} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Image Preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-xl p-2 bg-black/90 border-none">
          {previewImage && (
            <img src={previewImage} alt="Sample Full Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
