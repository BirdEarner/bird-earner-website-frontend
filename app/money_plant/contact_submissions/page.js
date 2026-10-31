"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Mail,
  Phone,
  Trash2,
  Calendar,
  User,
  MessageCircle,
  Ticket,
  Tag,
  Eye,
  CheckCircle2,
  Briefcase,
  MessagesSquare,
  AlertTriangle,
  Loader2,
  Inbox,
  Clock,
  Flag,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { contactApi } from "@/services/api";
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function getSubmissionType(subject = "") {
  const s = String(subject);
  if (/\[chat report\]/i.test(s)) return "Chat Report";
  if (/\[job report\]/i.test(s)) return "Job Report";
  if (/\[user report\]/i.test(s)) return "User Report";
  if (s.toLowerCase().startsWith("support:")) return "Support";
  if (s.toLowerCase().startsWith("feedback:")) return "Feedback";
  return "Contact";
}

function isReportType(type) {
  return type === "Chat Report" || type === "Job Report" || type === "User Report";
}

function getCleanSubject(subject = "") {
  return (
    String(subject)
      .replace(/^\[Chat Report\]\s*/i, "")
      .replace(/^\[Job Report\]\s*/i, "")
      .replace(/^\[User Report\]\s*/i, "")
      .replace(/^Reason:\s*/i, "")
      .replace(/^Support:\s*/i, "")
      .replace(/^Feedback:\s*/i, "")
      .trim() || "—"
  );
}

function statusBadgeClass(status = "") {
  switch (String(status).toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function typeBadgeClass(type) {
  if (type === "Chat Report") return "bg-rose-100 text-rose-800";
  if (type === "Job Report") return "bg-orange-100 text-orange-800";
  if (type === "User Report") return "bg-fuchsia-100 text-fuchsia-800";
  if (type === "Support") return "bg-violet-100 text-violet-800";
  if (type === "Feedback") return "bg-sky-100 text-sky-800";
  return "bg-gray-100 text-gray-700";
}

function formatStatus(status = "") {
  return String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMoney(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function getPageNumbers(currentPage, totalPages) {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) rangeWithDots.push(l + 1);
      else if (i - l !== 1) rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

function TypeBadge({ subject, type: typeProp }) {
  const type = typeProp || getSubmissionType(subject);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${typeBadgeClass(
        type
      )}`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize whitespace-nowrap ${statusBadgeClass(
        status
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}

const TYPE_FILTERS = [
  { key: "all", label: "All types" },
  { key: "reports", label: "All reports" },
  { key: "Chat Report", label: "Chat Reports" },
  { key: "Job Report", label: "Job Reports" },
  { key: "User Report", label: "User Reports" },
  { key: "Support", label: "Support" },
  { key: "Feedback", label: "Feedback" },
  { key: "Contact", label: "Other" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All statuses" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const READ_FILTERS = [
  { key: "all", label: "All read states" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Viewed" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;
const TYPE_KEYS = new Set(TYPE_FILTERS.map((o) => o.key));
const STATUS_KEYS = new Set(STATUS_FILTERS.map((o) => o.key));
const READ_KEYS = new Set(READ_FILTERS.map((o) => o.key));

function parsePageSize(value) {
  const n = Number(value);
  return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
}

function parsePage(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function ContactSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            <p className="text-sm text-purple-600">Loading submissions...</p>
          </div>
        </div>
      }
    >
      <ContactSubmissionsContent />
    </Suspense>
  );
}

function ContactSubmissionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const typeFilter = TYPE_KEYS.has(searchParams.get("type") || "")
    ? searchParams.get("type")
    : "all";
  const statusFilter = STATUS_KEYS.has(searchParams.get("status") || "")
    ? searchParams.get("status")
    : "all";
  const readFilter = READ_KEYS.has(searchParams.get("read") || "")
    ? searchParams.get("read")
    : "all";
  const currentPage = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const urlSearch = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef(null);
  const { toast } = useToast();
  const { getToken } = useAdminAuth();
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [reportContext, setReportContext] = useState(null);

  const updateQuery = useCallback(
    (updates, { resetPage = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      const apply = (key, value, defaultValue) => {
        if (
          value == null ||
          value === "" ||
          value === defaultValue ||
          (typeof value === "number" && value === defaultValue)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      };

      if ("q" in updates) apply("q", updates.q, "");
      if ("type" in updates) apply("type", updates.type, "all");
      if ("status" in updates) apply("status", updates.status, "all");
      if ("read" in updates) apply("read", updates.read, "all");
      if ("pageSize" in updates) {
        apply("pageSize", updates.pageSize, DEFAULT_PAGE_SIZE);
      }
      if ("page" in updates) apply("page", updates.page, 1);
      else if (resetPage) apply("page", 1, 1);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Keep local search input in sync when URL changes (back/forward)
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  // Debounce search → query param
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed === urlSearch) return;
    const timer = setTimeout(() => {
      updateQuery({ q: trimmed }, { resetPage: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, urlSearch, updateQuery]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onPointerDown = (e) => {
      const target = e.target;
      if (filterRef.current?.contains(target)) return;
      // Radix Select portals menu to body — don't close when picking an option
      if (
        target?.closest?.(
          "[data-radix-select-content], [data-radix-popper-content-wrapper]"
        )
      ) {
        return;
      }
      setFiltersOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await contactApi.getAllContacts(token);

      if (response.success) {
        setContacts(response.data.contacts || []);
      } else {
        throw new Error(response.message || "Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch contact submissions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const patchLocalContact = (id, patch) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    setSelectedContact((prev) =>
      prev && prev.id === id ? { ...prev, ...patch } : prev
    );
  };

  const handleMarkAsViewed = async (id, { silent = false } = {}) => {
    try {
      const token = getToken();
      const response = await contactApi.markAsRead(token, id);

      if (response.success) {
        patchLocalContact(id, {
          isRead: true,
          status: response.data?.status,
          adminId: response.data?.adminId,
          updatedAt: response.data?.updatedAt,
        });
        if (!silent) {
          toast({
            title: "Marked as viewed",
            description: "Submission marked as viewed. Status is unchanged.",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark as viewed",
      });
    }
  };

  const handleMarkAsResolved = async (id) => {
    try {
      const token = getToken();
      const response = await contactApi.markAsResolved(token, id);

      if (response.success) {
        patchLocalContact(id, {
          isRead: true,
          status: "resolved",
          adminId: response.data?.adminId,
          updatedAt: response.data?.updatedAt,
        });
        toast({
          title: "Resolved",
          description: "Submission marked as resolved.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resolve submission",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const token = getToken();
      const response = await contactApi.deleteContact(token, id);

      if (response.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (selectedContact?.id === id) {
          setIsDetailOpen(false);
          setSelectedContact(null);
          setReportContext(null);
        }
        toast({
          title: "Deleted",
          description: "Submission deleted",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submission",
      });
    }
  };

  const openDetails = async (contact) => {
    setSelectedContact(contact);
    setReportContext(null);
    setIsDetailOpen(true);

    if (!contact.isRead) {
      await handleMarkAsViewed(contact.id, { silent: true });
    }

    const type = getSubmissionType(contact.subject);
    if (!isReportType(type)) return;

    try {
      setContextLoading(true);
      const token = getToken();
      const response = await contactApi.getContactContext(token, contact.id);
      if (response.success) {
        if (response.data?.contact) {
          setSelectedContact((prev) => ({
            ...prev,
            ...response.data.contact,
            isRead: true,
          }));
        }
        setReportContext(response.data);
      }
    } catch (error) {
      console.error("Failed to load report context:", error);
      toast({
        variant: "destructive",
        title: "Context unavailable",
        description: "Could not load full chat/job details for this report.",
      });
    } finally {
      setContextLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    let unread = 0;
    let pending = 0;
    let reports = 0;
    let support = 0;
    let feedback = 0;
    let resolved = 0;
    let thisWeek = 0;

    for (const contact of contacts) {
      const type = getSubmissionType(contact.subject);
      const status = String(contact.status || "pending").toLowerCase();
      if (!contact.isRead) unread += 1;
      if (status === "pending" || status === "in_progress") pending += 1;
      if (status === "resolved" || status === "closed") resolved += 1;
      if (isReportType(type)) reports += 1;
      if (type === "Support") support += 1;
      if (type === "Feedback") feedback += 1;
      if (contact.createdAt && new Date(contact.createdAt).getTime() >= weekAgo) {
        thisWeek += 1;
      }
    }

    return {
      total: contacts.length,
      unread,
      pending,
      reports,
      support,
      feedback,
      resolved,
      thisWeek,
    };
  }, [contacts]);

  const typeCounts = useMemo(
    () =>
      contacts.reduce((acc, contact) => {
        const type = getSubmissionType(contact.subject);
        acc[type] = (acc[type] || 0) + 1;
        acc.all = (acc.all || 0) + 1;
        if (isReportType(type)) acc.reports = (acc.reports || 0) + 1;
        return acc;
      }, {}),
    [contacts]
  );

  const statusCounts = useMemo(
    () =>
      contacts.reduce((acc, contact) => {
        const status = String(contact.status || "pending").toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        acc.all = (acc.all || 0) + 1;
        return acc;
      }, {}),
    [contacts]
  );

  const readCounts = useMemo(
    () =>
      contacts.reduce(
        (acc, contact) => {
          acc.all += 1;
          if (contact.isRead) acc.read += 1;
          else acc.unread += 1;
          return acc;
        },
        { all: 0, read: 0, unread: 0 }
      ),
    [contacts]
  );

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const type = getSubmissionType(contact.subject);
      const status = String(contact.status || "pending").toLowerCase();

      if (typeFilter === "reports") {
        if (!isReportType(type)) return false;
      } else if (typeFilter !== "all" && type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (readFilter === "unread" && contact.isRead) return false;
      if (readFilter === "read" && !contact.isRead) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (contact.name || "").toLowerCase().includes(q) ||
        (contact.email || "").toLowerCase().includes(q) ||
        (contact.subject || "").toLowerCase().includes(q) ||
        (contact.ticketId || "").toLowerCase().includes(q) ||
        (contact.phone || "").toLowerCase().includes(q) ||
        (contact.message || "").toLowerCase().includes(q)
      );
    });
  }, [contacts, typeFilter, statusFilter, readFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedContacts = filteredContacts.slice(
    pageStart,
    pageStart + pageSize
  );

  const activeFilterCount = [
    typeFilter !== "all",
    statusFilter !== "all",
    readFilter !== "all",
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          <p className="text-sm text-purple-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const selectedType = getSubmissionType(selectedContact?.subject);
  const report = reportContext?.report;
  const meta = reportContext?.meta;

  return (
    <div className="flex-1 w-full min-w-0 overflow-x-hidden space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 bg-purple-50/50">
      <div className="space-y-1 min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-black">
          Contact Submissions
        </h1>
        <p className="text-sm text-black/70">
          Support tickets, feedback, and chat/job reports from the app.
        </p>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
        <StatCard
          label="Total"
          value={analytics.total}
          icon={<Inbox className="h-4 w-4" />}
          tone="purple"
        />
        <StatCard
          label="Unread"
          value={analytics.unread}
          icon={<Eye className="h-4 w-4" />}
          tone="amber"
          onClick={() =>
            updateQuery(
              { read: "unread", status: "all", type: "all" },
              { resetPage: true }
            )
          }
        />
        <StatCard
          label="Open"
          value={analytics.pending}
          icon={<Clock className="h-4 w-4" />}
          tone="blue"
          onClick={() =>
            updateQuery(
              { status: "pending", read: "all" },
              { resetPage: true }
            )
          }
        />
        <StatCard
          label="Reports"
          value={analytics.reports}
          icon={<Flag className="h-4 w-4" />}
          tone="rose"
          onClick={() =>
            updateQuery(
              { type: "reports", status: "all", read: "all" },
              { resetPage: true }
            )
          }
        />
        <StatCard
          label="Resolved"
          value={analytics.resolved}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          onClick={() =>
            updateQuery(
              { status: "resolved", read: "all" },
              { resetPage: true }
            )
          }
        />
        <StatCard
          label="This week"
          value={analytics.thisWeek}
          icon={<Calendar className="h-4 w-4" />}
          tone="violet"
        />
      </div>

      {/* Search + Filter */}
      <div className="rounded-xl border border-purple-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500 pointer-events-none" />
            <Input
              placeholder="Search ticket, name, email, reason..."
              className="pl-8 h-10 w-full border-purple-200 focus-visible:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative shrink-0" ref={filterRef}>
            <Button
              type="button"
              variant="outline"
              className={`h-10 px-3 sm:px-4 border-purple-200 text-purple-800 gap-1.5 ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-purple-50 border-purple-300"
                  : "bg-white"
              }`}
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-haspopup="dialog"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 opacity-60 transition-transform ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {filtersOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(calc(100vw-1.5rem),20rem)] sm:w-80 rounded-xl border border-purple-200 bg-white p-3.5 sm:p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-black">Filter by</p>
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:bg-purple-50 hover:text-purple-700"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <FilterSelect
                  label="Type"
                  value={typeFilter}
                  onChange={(v) =>
                    updateQuery({ type: v }, { resetPage: true })
                  }
                  options={TYPE_FILTERS}
                  counts={typeCounts}
                />
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(v) =>
                    updateQuery({ status: v }, { resetPage: true })
                  }
                  options={STATUS_FILTERS}
                  counts={statusCounts}
                />
                <FilterSelect
                  label="Read"
                  value={readFilter}
                  onChange={(v) =>
                    updateQuery({ read: v }, { resetPage: true })
                  }
                  options={READ_FILTERS}
                  counts={readCounts}
                />

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Per page
                  </p>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) =>
                      updateQuery(
                        { pageSize: Number(v) },
                        { resetPage: true }
                      )
                    }
                  >
                    <SelectTrigger className="h-10 w-full border-purple-200 focus:ring-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} rows
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 border-purple-200 text-purple-700"
                    onClick={() =>
                      updateQuery(
                        { type: "all", status: "all", read: "all" },
                        { resetPage: true }
                      )
                    }
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="xl:hidden space-y-3">
        {paginatedContacts.length === 0 ? (
          <div className="rounded-xl border border-purple-200 bg-white px-4 py-10 text-center text-gray-500 shadow-sm">
            No submissions found.
          </div>
        ) : (
          paginatedContacts.map((contact) => {
            const type = getSubmissionType(contact.subject);
            const status = (contact.status || "pending").toLowerCase();
            return (
              <article
                key={contact.id}
                className={`rounded-xl border border-purple-200 bg-white p-3.5 sm:p-4 shadow-sm space-y-3 min-w-0 ${
                  !contact.isRead ? "ring-1 ring-purple-200 bg-purple-50/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                        !contact.isRead
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isReportType(type) ? (
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        (contact.name || "?").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black truncate">
                        {contact.name || "—"}
                      </p>
                      <p className="text-xs font-mono text-purple-700 truncate">
                        {contact.ticketId || "No ticket"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <TypeBadge type={type} />
                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className="space-y-1 text-sm min-w-0">
                  <p className="font-medium text-black break-words">
                    {getCleanSubject(contact.subject)}
                  </p>
                  <p className="text-gray-600 break-all text-xs sm:text-sm">
                    {contact.email || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {contact.phone || "No phone"} ·{" "}
                    {contact.createdAt
                      ? new Date(contact.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-purple-700 border-purple-200"
                    onClick={() => openDetails(contact)}
                  >
                    {isReportType(type) ? "Investigate" : "View details"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-600 border-red-100 shrink-0"
                    onClick={() => handleDelete(contact.id)}
                    aria-label="Delete submission"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden xl:block rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[900px]">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-purple-200 bg-purple-50/50">
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Ticket
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  From
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Subject
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.map((contact) => {
                const type = getSubmissionType(contact.subject);
                const status = (contact.status || "pending").toLowerCase();
                return (
                  <tr
                    key={contact.id}
                    className={`border-b border-purple-100 last:border-0 ${
                      !contact.isRead ? "bg-purple-50/40" : ""
                    }`}
                  >
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!contact.isRead && (
                          <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" />
                        )}
                        <span className="text-xs font-mono font-semibold text-purple-700 truncate">
                          {contact.ticketId || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <TypeBadge type={type} />
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            !contact.isRead
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {(contact.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-black truncate">
                          {contact.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm text-black truncate">
                          {contact.email || "—"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {contact.phone || "No phone"}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <p
                        className="text-sm text-black truncate"
                        title={contact.subject}
                      >
                        {getCleanSubject(contact.subject)}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-middle text-sm text-black whitespace-nowrap">
                      {contact.createdAt
                        ? new Date(contact.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-3 py-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-purple-600"
                          onClick={() => openDetails(contact)}
                        >
                          {isReportType(type) ? "Investigate" : "View"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedContacts.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredContacts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            Page {safePage} of {totalPages}
          </p>
          {totalPages > 1 && (
            <Pagination className="order-1 sm:order-2 mx-0 w-auto">
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (safePage <= 1) return;
                      updateQuery({ page: safePage - 1 });
                    }}
                    className={`cursor-pointer ${
                      safePage <= 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  />
                </PaginationItem>

                {getPageNumbers(safePage, totalPages).map((page, index) => (
                  <PaginationItem key={`${page}-${index}`} className="hidden sm:list-item">
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuery({ page });
                        }}
                        isActive={page === safePage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (safePage >= totalPages) return;
                      updateQuery({ page: safePage + 1 });
                    }}
                    className={`cursor-pointer ${
                      safePage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setSelectedContact(null);
            setReportContext(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-[920px] max-h-[92dvh] overflow-y-auto p-4 sm:p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8 text-left text-base sm:text-lg">
              {isReportType(selectedType) ? (
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              ) : (
                <MessageCircle className="h-5 w-5 text-purple-600 shrink-0" />
              )}
              <span className="break-words">
                {selectedType} · {selectedContact?.name || "Unknown"}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={selectedType} />
                <StatusBadge status={selectedContact.status} />
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    selectedContact.isRead
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  {selectedContact.isRead ? "Viewed" : "Unread"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <DetailField
                  icon={<Ticket className="h-3.5 w-3.5" />}
                  label="Ticket ID"
                  value={selectedContact.ticketId || "—"}
                  mono
                />
                <DetailField
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Submitted"
                  value={
                    selectedContact.createdAt
                      ? new Date(selectedContact.createdAt).toLocaleString()
                      : "—"
                  }
                />
                <DetailField
                  icon={<Tag className="h-3.5 w-3.5" />}
                  label="Reason / Subject"
                  value={getCleanSubject(selectedContact.subject)}
                />
                <DetailField
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Reporter name"
                  value={selectedContact.name || "—"}
                />
                <DetailField
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Reporter email"
                  value={selectedContact.email || "—"}
                />
                <DetailField
                  icon={<Phone className="h-3.5 w-3.5" />}
                  label="Reporter phone"
                  value={selectedContact.phone || "Not provided"}
                />
              </div>

              <div className="space-y-1.5 border-t border-purple-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Report summary
                </p>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap break-words min-h-[80px] leading-relaxed border border-gray-100">
                  {selectedContact.message || "No message provided."}
                </div>
              </div>

              {isReportType(selectedType) && (
                <div className="space-y-4 border-t border-purple-100 pt-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <h3 className="text-sm font-semibold text-black">
                      Investigation details
                    </h3>
                  </div>

                  {contextLoading ? (
                    <div className="flex items-center gap-2 text-sm text-purple-700 py-6 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading chat &amp; job context…
                    </div>
                  ) : (
                    <>
                      {(report?.reporter || report?.reported) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <PartyCard
                            title="Reporter"
                            user={report?.reporter}
                            fallbackName={selectedContact.name}
                            fallbackEmail={selectedContact.email}
                          />
                          <PartyCard
                            title="Reported user"
                            user={report?.reported}
                            tone="danger"
                          />
                        </div>
                      )}

                      {report?.job && (
                        <section className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-orange-700" />
                            <h4 className="text-sm font-semibold text-orange-900">
                              Job details
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <DetailField label="Job ID" value={report.job.id} mono />
                            <DetailField label="Title" value={report.job.jobTitle} />
                            <DetailField label="Status" value={report.job.jobStatus} />
                            <DetailField
                              label="Type"
                              value={report.job.projectType}
                            />
                            <DetailField
                              label="Category"
                              value={`${report.job.jobCategory || "—"} / ${
                                report.job.jobSubCategory || "—"
                              }`}
                            />
                            <DetailField
                              label="Budget"
                              value={`${formatMoney(report.job.budgetAmount)} (${
                                report.job.budgetType || "—"
                              })`}
                            />
                            <DetailField
                              label="Negotiated"
                              value={formatMoney(report.job.negotiatedAmount)}
                            />
                            <DetailField
                              label="Payment"
                              value={`${report.job.paymentMethod || "—"} / ${
                                report.job.paymentStatus || "—"
                              }`}
                            />
                            <DetailField
                              label="Location"
                              value={report.job.location || "—"}
                            />
                            <DetailField
                              label="Client"
                              value={`${report.job.clientName || "—"} (${
                                report.job.clientEmail || "—"
                              })`}
                            />
                            <DetailField
                              label="Assigned freelancer"
                              value={
                                report.job.freelancerName
                                  ? `${report.job.freelancerName} (${
                                      report.job.freelancerEmail || "—"
                                    })`
                                  : "Unassigned"
                              }
                            />
                            <DetailField
                              label="Created"
                              value={
                                report.job.createdAt
                                  ? new Date(report.job.createdAt).toLocaleString()
                                  : "—"
                              }
                            />
                          </div>
                          {report.job.jobDescription ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-orange-800/80 uppercase tracking-wide">
                                Description
                              </p>
                              <p className="text-sm text-orange-950/90 whitespace-pre-wrap break-words bg-white/70 rounded-lg border border-orange-100 p-3 max-h-40 overflow-y-auto">
                                {report.job.jobDescription}
                              </p>
                            </div>
                          ) : null}
                        </section>
                      )}

                      {report?.thread && (
                        <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <MessagesSquare className="h-4 w-4 text-violet-700" />
                            <h4 className="text-sm font-semibold text-violet-900">
                              Chat thread
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <DetailField label="Thread ID" value={report.thread.id} mono />
                            <DetailField label="Status" value={report.thread.status} />
                            <DetailField
                              label="Accepted"
                              value={report.thread.isAccepted ? "Yes" : "No"}
                            />
                            <DetailField
                              label="Agreed amount"
                              value={formatMoney(report.thread.agreedAmount)}
                            />
                            <DetailField
                              label="Client"
                              value={`${report.thread.clientName || "—"} · ${
                                report.thread.clientEmail || "—"
                              }`}
                            />
                            <DetailField
                              label="Freelancer"
                              value={`${report.thread.freelancerName || "—"} · ${
                                report.thread.freelancerEmail || "—"
                              }`}
                            />
                          </div>
                        </section>
                      )}

                      <section className="rounded-xl border border-purple-200 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-purple-700" />
                            <h4 className="text-sm font-semibold text-black">
                              Chat transcript
                            </h4>
                          </div>
                          <span className="text-xs text-gray-500">
                            {report?.messages?.length || 0} messages
                            {meta?.threadId ? ` · ${meta.threadId.slice(0, 8)}…` : ""}
                          </span>
                        </div>

                        {!report?.messages?.length ? (
                          <p className="text-sm text-gray-500 py-6 text-center">
                            {meta?.threadId || meta?.jobId
                              ? "No messages found for this thread."
                              : "No linked chat thread on this report."}
                          </p>
                        ) : (
                          <div className="max-h-[360px] overflow-y-auto space-y-2 rounded-lg border border-purple-100 bg-purple-50/30 p-3">
                            {report.messages.map((msg) => {
                              const isSystem =
                                String(msg.senderType || "").toUpperCase() ===
                                "SYSTEM";
                              const isReported =
                                meta?.reportedUserId &&
                                msg.senderId === meta.reportedUserId;
                              return (
                                <div
                                  key={msg.id}
                                  className={`rounded-lg px-3 py-2 text-sm border ${
                                    isSystem
                                      ? "bg-gray-100 border-gray-200 text-gray-700"
                                      : isReported
                                        ? "bg-rose-50 border-rose-200"
                                        : "bg-white border-purple-100"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-xs font-semibold text-purple-900 truncate">
                                      {msg.senderName || msg.senderType || "User"}
                                      {isReported ? " · reported" : ""}
                                      {msg.messageType &&
                                      msg.messageType !== "text"
                                        ? ` · ${msg.messageType}`
                                        : ""}
                                    </p>
                                    <p className="text-[11px] text-gray-500 whitespace-nowrap">
                                      {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleString()
                                        : ""}
                                    </p>
                                  </div>
                                  <p className="whitespace-pre-wrap break-words text-gray-800">
                                    {msg.messageContent || "(empty)"}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-purple-100">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
                {(selectedContact.status || "").toLowerCase() !== "resolved" &&
                  (selectedContact.status || "").toLowerCase() !== "closed" && (
                    <Button
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleMarkAsResolved(selectedContact.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Mark as Resolved
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon, tone = "purple", onClick }) {
  const tones = {
    purple: "border-purple-200 bg-white text-purple-700",
    amber: "border-amber-200 bg-amber-50/60 text-amber-800",
    blue: "border-blue-200 bg-blue-50/60 text-blue-800",
    rose: "border-rose-200 bg-rose-50/60 text-rose-800",
    green: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
    violet: "border-violet-200 bg-violet-50/60 text-violet-800",
  };
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-xl border p-3 sm:p-3.5 shadow-sm text-left transition-shadow hover:shadow-md min-w-0 ${tones[tone]} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide opacity-80 truncate">
          {label}
        </p>
        <span className="opacity-70 shrink-0">{icon}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-black tabular-nums">
        {value}
      </p>
    </Comp>
  );
}

function FilterSelect({ label, value, onChange, options, counts = {} }) {
  return (
    <div className="space-y-1.5 min-w-0">
      {label ? (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
      ) : null}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full border-purple-200 focus:ring-purple-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => {
            const count =
              opt.key === "all" ? counts.all ?? 0 : counts[opt.key] ?? 0;
            return (
              <SelectItem key={opt.key} value={opt.key}>
                <span className="flex items-center justify-between gap-3 w-full">
                  <span>{opt.label}</span>
                  <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 rounded-full px-1.5 py-0.5">
                    {count}
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function DetailField({ icon, label, value, mono = false }) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p
        className={`text-sm font-medium text-black break-words ${
          mono ? "font-mono text-purple-700 text-xs sm:text-sm" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PartyCard({ title, user, fallbackName, fallbackEmail, tone = "default" }) {
  const border =
    tone === "danger"
      ? "border-rose-200 bg-rose-50/50"
      : "border-emerald-200 bg-emerald-50/40";
  return (
    <div className={`rounded-xl border p-3 sm:p-4 space-y-2 ${border}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {title}
      </p>
      <p className="text-sm font-semibold text-black">
        {user?.fullName || fallbackName || "—"}
      </p>
      <p className="text-xs text-gray-600 break-all">
        {user?.email || fallbackEmail || "—"}
      </p>
      <p className="text-xs text-gray-500">{user?.mobile || "No phone"}</p>
      {user?.id ? (
        <p className="text-[11px] font-mono text-gray-400 break-all">{user.id}</p>
      ) : null}
    </div>
  );
}
