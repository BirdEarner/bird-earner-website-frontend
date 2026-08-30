"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  FileText,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  Ban
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { adminDisputesApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAdminAuth } from "@/hooks/AdminAuthContext";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("DISPUTE_OPEN");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState("REFUND_CLIENT");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { getToken, loading: authLoading } = useAdminAuth();

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const token = getToken() || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (!token) {
        console.warn("No admin token found yet, skipping fetch");
        setIsLoading(false);
        return;
      }
      const res = await adminDisputesApi.getDisputes({ token });
      if (res.success && res.disputes) {
        setDisputes(res.disputes);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Disputes",
        description: error.message || "Failed to fetch disputes from server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchDisputes();
    }
  }, [authLoading]);

  const handleOpenResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionAction("REFUND_CLIENT");
    setResolutionNotes("");
    setIsResolveModalOpen(true);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    if (!resolutionNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide resolution notes explaining the decision.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      await adminDisputesApi.resolveDispute({
        token,
        id: selectedDispute.id,
        action: resolutionAction,
        resolutionNotes,
      });

      toast({
        title: "Dispute Resolved Successfully",
        description: `Dispute for "${selectedDispute.title}" resolved with action: ${resolutionAction}`,
      });

      setIsResolveModalOpen(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast({
        variant: "destructive",
        title: "Resolution Failed",
        description: error.message || "Failed to submit dispute resolution.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "DISPUTE_OPEN"
        ? d.jobStatus === "DISPUTE_OPEN"
        : d.jobStatus !== "DISPUTE_OPEN";

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchLower) ||
      d.client?.name?.toLowerCase().includes(searchLower) ||
      d.client?.email?.toLowerCase().includes(searchLower) ||
      d.freelancer?.name?.toLowerCase().includes(searchLower) ||
      d.freelancer?.email?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const openCount = disputes.filter((d) => d.jobStatus === "DISPUTE_OPEN").length;
  const resolvedCount = disputes.filter((d) => d.jobStatus !== "DISPUTE_OPEN").length;

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-purple-600" />
            <h1 className="text-2xl font-bold tracking-tight text-purple-950">
              Dispute Resolution Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-purple-700/80">
            Review escalated job disputes between Clients and Freelancers, inspect audit trails, and execute resolutions.
          </p>
        </div>
        <Button
          onClick={fetchDisputes}
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Disputes
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Total Disputes</p>
              <h3 className="mt-1 text-3xl font-extrabold text-purple-950">{disputes.length}</h3>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Open Disputes</p>
              <h3 className="mt-1 text-3xl font-extrabold text-amber-900">{openCount}</h3>
            </div>
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Resolved Disputes</p>
              <h3 className="mt-1 text-3xl font-extrabold text-emerald-950">{resolvedCount}</h3>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-purple-200 bg-card p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title, client or freelancer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-purple-200 focus:border-purple-500"
          />
        </div>

        <div className="flex rounded-lg bg-purple-100/60 p-1">
          <button
            onClick={() => setStatusFilter("DISPUTE_OPEN")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "DISPUTE_OPEN"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-purple-700 hover:text-purple-950"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Active Disputes ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "resolved"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-purple-700 hover:text-purple-950"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-purple-700 hover:text-purple-950"
            }`}
          >
            All History ({disputes.length})
          </button>
        </div>
      </div>

      {/* Disputes Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-purple-100 bg-card p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mb-3" />
          <p className="text-sm font-medium text-purple-800">Loading disputes data...</p>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-purple-200 bg-card p-12 text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-purple-300 mb-3" />
          <h3 className="text-lg font-bold text-purple-950">No Disputes Found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {statusFilter === "DISPUTE_OPEN"
              ? "There are currently no active open disputes requiring admin intervention."
              : "No disputes match your current filter or search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className={`rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
                dispute.jobStatus === "DISPUTE_OPEN"
                  ? "border-amber-300/80 bg-gradient-to-r from-amber-50/20 to-white"
                  : "border-purple-200"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-purple-950">{dispute.title}</h2>
                    <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-800">
                      {dispute.category || "General"}
                    </span>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {dispute.projectType || "Standard"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        dispute.jobStatus === "DISPUTE_OPEN"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : dispute.jobStatus === "REFUNDED"
                          ? "bg-rose-100 text-rose-900 border border-rose-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {dispute.jobStatus}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {dispute.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t border-purple-100 pt-4 md:border-t-0 md:pt-0 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Budget</p>
                    <p className="text-2xl font-extrabold text-purple-950">₹{dispute.budgetAmount}</p>
                  </div>
                  {dispute.jobStatus === "DISPUTE_OPEN" && (
                    <Button
                      onClick={() => handleOpenResolveModal(dispute)}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-sm"
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Resolve Dispute
                    </Button>
                  )}
                </div>
              </div>

              {/* Dispute Reason Highlight Box */}
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Dispute Reason / What Happened
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Raised by: {dispute.raisedBy || "USER"}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-amber-950">
                  "{dispute.disputeReason || dispute.cancellationReason || "Dispute raised by user"}"
                </p>
                {dispute.disputeRaisedAt && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    Raised on: {new Date(dispute.disputeRaisedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Client & Freelancer Info Grid */}
              <div className="mt-5 grid gap-4 rounded-xl border border-purple-100 bg-purple-50/40 p-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase">Client</p>
                    <p className="text-sm font-bold text-purple-950">{dispute.client?.name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{dispute.client?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase">Freelancer</p>
                    <p className="text-sm font-bold text-purple-950">{dispute.freelancer?.name || "Unassigned"}</p>
                    <p className="text-xs text-muted-foreground">{dispute.freelancer?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Status History Timeline Snippet */}
              {dispute.history && dispute.history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-2">Dispute Audit Log Timeline:</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                    {dispute.history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-xs rounded bg-white p-2 border border-purple-100">
                        <span className="font-semibold text-purple-900">{h.status} ({h.action})</span>
                        <span className="text-muted-foreground text-[11px] truncate max-w-xs">{h.reason}</span>
                        <span className="text-purple-500 text-[10px]">{new Date(h.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolve Dispute Modal */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="sm:max-w-lg border-purple-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-950">
              <ShieldAlert className="h-6 w-6 text-purple-700" />
              Resolve Dispute
            </DialogTitle>
            <DialogDescription>
              Execute admin resolution for job: <span className="font-bold text-purple-900">{selectedDispute?.title}</span> (Budget: ₹{selectedDispute?.budgetAmount})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-2">
                Select Resolution Action
              </label>
              <div className="grid gap-3">
                <label
                  onClick={() => setResolutionAction("REFUND_CLIENT")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    resolutionAction === "REFUND_CLIENT"
                      ? "border-rose-500 bg-rose-50/50 shadow-sm"
                      : "border-purple-200 hover:bg-purple-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="resolutionAction"
                    value="REFUND_CLIENT"
                    checked={resolutionAction === "REFUND_CLIENT"}
                    onChange={() => setResolutionAction("REFUND_CLIENT")}
                    className="mt-1 text-rose-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-rose-600" />
                      In Favor of Client (Cancel Booking)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Resolves dispute with 0% penalty for client. Client does not need to pay cash to freelancer.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setResolutionAction("PAY_FREELANCER")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    resolutionAction === "PAY_FREELANCER"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                      : "border-purple-200 hover:bg-purple-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="resolutionAction"
                    value="PAY_FREELANCER"
                    checked={resolutionAction === "PAY_FREELANCER"}
                    onChange={() => setResolutionAction("PAY_FREELANCER")}
                    className="mt-1 text-emerald-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      In Favor of Freelancer (Cash Payment)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Resolves dispute in favor of freelancer. Client must pay ₹{selectedDispute?.budgetAmount} in cash directly to freelancer.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setResolutionAction("CLOSE_DISPUTE")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    resolutionAction === "CLOSE_DISPUTE"
                      ? "border-purple-500 bg-purple-50/50 shadow-sm"
                      : "border-purple-200 hover:bg-purple-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="resolutionAction"
                    value="CLOSE_DISPUTE"
                    checked={resolutionAction === "CLOSE_DISPUTE"}
                    onChange={() => setResolutionAction("CLOSE_DISPUTE")}
                    className="mt-1 text-purple-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-purple-600" />
                      Close Dispute (Mutual Settlement)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Closes the dispute status without requiring further cash payment.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Resolution Notes / Explanation (Required)
              </label>
              <Textarea
                placeholder="Explain the reasoning behind this decision for the audit log..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="border-purple-200 focus:border-purple-500 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResolveModalOpen(false)}
              disabled={isSubmitting}
              className="border-purple-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResolveDispute}
              disabled={isSubmitting}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Confirm & Submit Resolution"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
