"use client";

import { useState, useEffect } from "react";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { adminPaymentApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaymentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPaymentHistory() {
      try {
        setIsLoading(true);
        const res = await adminPaymentApi.getPaymentHistory({
          page: currentPage,
          pageSize: itemsPerPage,
          search: searchQuery,
        });
        setPaymentHistory(res.payments.map((payment) => ({
          id: payment.id,
          user: payment.userName,
          userEmail: payment.userEmail,
          paymentId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
          date: payment.date,
          paymentMethod: payment.paymentMethod,
          description: payment.description,
        })));
      } catch (error) {
        console.error("Error fetching payment history:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payment history. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentHistory();
  }, [currentPage, searchQuery]);

  const filteredPayments = paymentHistory;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Function to generate page numbers array
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-sm text-purple-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Payment History
          </h1>
          <p className="text-black/70">
            View and track all payment transactions.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search by user name or transaction ID..."
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-200 bg-purple-50/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-purple-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-black">
                        {payment.user}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.userEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-purple-600">
                    {payment.paymentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-black">
                    ₹{payment.amount}
                  </td>
                  <td className="px-4 py-3 text-sm text-black">
                    {payment.paymentMethod || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-black">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
              
              {getPageNumbers(currentPage, totalPages).map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
} 