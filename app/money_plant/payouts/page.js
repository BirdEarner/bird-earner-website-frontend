"use client";

import { useState, useEffect } from "react";
import {
	Search,
	CheckCircle,
	XCircle,
	Eye,
	User,
	Building2,
	Filter,
	Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { adminWithdrawalApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAdminAuth } from "@/hooks/AdminAuthContext";
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

export default function PayoutsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [processingRequestId, setProcessingRequestId] = useState(null);
	const [withdrawalRequests, setWithdrawalRequests] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;
	const { toast } = useToast();
	const { getToken } = useAdminAuth();

	useEffect(() => {
		async function fetchData() {
			try {
				setIsLoading(true);
				const token = getToken();
				const res = await adminWithdrawalApi.getWithdrawalRequests({
					token,
					page: currentPage,
					pageSize: itemsPerPage,
					status: statusFilter,
					search: searchQuery,
				});
				setWithdrawalRequests(res.requests.map((request) => ({
					id: request.id,
					freelancer: request.freelancer,
					freelancerEmail: request.freelancerEmail,
					amount: request.amount,
					status: request.status,
					requestDate: request.requestDate,
					bankAccount: request.bankAccount,
				})));
			} catch (error) {
				console.error("Error fetching data:", error);
				toast({
					variant: "destructive",
					title: "Error",
					description: "Failed to fetch withdrawal requests. Please try again.",
				});
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, [currentPage, statusFilter, searchQuery, getToken]);

	const handleUpdateStatus = async (id, newStatus) => {
		try {
			setProcessingRequestId(id);
			const token = getToken();
			await adminWithdrawalApi.updateWithdrawalStatus(token, id, newStatus);

			// Update the local state to reflect the change
			setWithdrawalRequests(prev =>
				prev.map((request) =>
					request.id === id ? { ...request, status: newStatus } : request
				)
			);

			// If dialog is open and we're updating the selected request, update it too
			if (selectedRequest && selectedRequest.id === id) {
				setSelectedRequest(prev => ({ ...prev, status: newStatus }));
			}

			// Show appropriate success message based on status
			const statusMessages = {
				APPROVED: "Withdrawal request approved successfully",
				REJECTED: "Withdrawal request rejected",
				PROCESSED: "Withdrawal request marked as processed",
				PENDING: "Withdrawal request status updated"
			};

			toast({
				title: "Success",
				description: statusMessages[newStatus] || `Withdrawal request ${newStatus.toLowerCase()}`,
				variant: "default",
			});

			// Close dialog if it was open
			if (isDialogOpen) {
				setIsDialogOpen(false);
			}

			// Refresh the data to ensure consistency
			const res = await adminWithdrawalApi.getWithdrawalRequests({
				token,
				page: currentPage,
				pageSize: itemsPerPage,
				status: statusFilter,
				search: searchQuery,
			});
			setWithdrawalRequests(res.requests.map((request) => ({
				id: request.id,
				freelancer: request.freelancer,
				freelancerEmail: request.freelancerEmail,
				amount: request.amount,
				status: request.status,
				requestDate: request.requestDate,
				bankAccount: request.bankAccount,
			})));

		} catch (error) {
			console.error("Error updating status:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update status. Please try again.",
			});
		} finally {
			setProcessingRequestId(null);
		}
	};

	const filteredWithdrawals = withdrawalRequests;

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-100 text-yellow-700";
			case "approved":
				return "bg-green-100 text-green-700";
			case "processed":
				return "bg-blue-100 text-blue-700";
			case "rejected":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	// Pagination logic
	const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

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
					<p className="text-sm text-purple-600">Loading withdrawal requests...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 p-6 bg-purple-50/50">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight text-black">
						Withdrawal Requests
					</h1>
					<p className="text-black/70">
						Manage and process freelancer withdrawal requests.
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
					<Input
						placeholder="Search by freelancer name..."
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
									Freelancer
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
									Amount
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
									Request Date
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-purple-600 flex items-center gap-2">
									Status
									<Select
										value={statusFilter}
										onValueChange={setStatusFilter}
									>
										<SelectTrigger className="w-[120px] h-8 text-xs border-purple-200">
											<SelectValue placeholder="All Status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												<span className="flex items-center gap-2">
													<Filter className="h-3.5 w-3.5" />
													All Status
												</span>
											</SelectItem>
											<SelectItem value="pending">
												<span className="flex items-center gap-2 text-yellow-600">
													<Clock className="h-3.5 w-3.5" />
													Pending
												</span>
											</SelectItem>
											<SelectItem value="approved">
												<span className="flex items-center gap-2 text-green-600">
													<CheckCircle className="h-3.5 w-3.5" />
													Approved
												</span>
											</SelectItem>
											<SelectItem value="processed">
												<span className="flex items-center gap-2 text-blue-600">
													<CheckCircle className="h-3.5 w-3.5" />
													Processed
												</span>
											</SelectItem>
											<SelectItem value="rejected">
												<span className="flex items-center gap-2 text-red-600">
													<XCircle className="h-3.5 w-3.5" />
													Rejected
												</span>
											</SelectItem>
										</SelectContent>
									</Select>
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{currentWithdrawals.map((request) => (
								<tr
									key={request.id}
									className="border-b border-purple-100 last:border-0"
								>
									<td className="px-4 py-3">
										<div className="space-y-1">
											<p className="text-sm font-medium text-black">
												{request.freelancer}
											</p>
											<p className="text-xs text-gray-500">
												{request.freelancerEmail}
											</p>
										</div>
									</td>
									<td className="px-4 py-3 text-sm text-black">
										${request.amount}
									</td>
									<td className="px-4 py-3 text-sm text-black">
										{new Date(request.requestDate).toLocaleDateString()}
									</td>
									<td className="px-4 py-3 text-sm">
										<span
											className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
												request.status
											)}`}
										>
											{request.status}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-purple-600 hover:text-purple-700"
												onClick={() => {
													setSelectedRequest(request);
													setIsDialogOpen(true);
												}}
												title="View Details"
											>
												<Eye className="h-4 w-4" />
											</Button>
											{request.status.toLowerCase() === "pending" && (
												<>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
														onClick={() => handleUpdateStatus(request.id, "APPROVED")}
														disabled={processingRequestId === request.id}
														title="Approve Request"
													>
														{processingRequestId === request.id ? (
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
														) : (
															<CheckCircle className="h-4 w-4" />
														)}
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
														onClick={() => handleUpdateStatus(request.id, "REJECTED")}
														disabled={processingRequestId === request.id}
														title="Reject Request"
													>
														{processingRequestId === request.id ? (
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
														) : (
															<XCircle className="h-4 w-4" />
														)}
													</Button>
												</>
											)}
											{request.status.toLowerCase() === "approved" && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
													onClick={() => handleUpdateStatus(request.id, "PROCESSED")}
													disabled={processingRequestId === request.id}
													title="Mark as Processed"
												>
													{processingRequestId === request.id ? (
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
													) : (
														<CheckCircle className="h-4 w-4" />
													)}
												</Button>
											)}
										</div>
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

			{/* View Details Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Withdrawal Request Details</DialogTitle>
					</DialogHeader>
					{selectedRequest && (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-start gap-3">
									<User className="h-5 w-5 text-purple-600 mt-0.5" />
									<div>
										<p className="font-medium text-black">
											{selectedRequest.freelancer}
										</p>
										<p className="text-sm text-gray-500">
											{selectedRequest.freelancerEmail}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
									<div>
										<p className="font-medium text-black">Bank Details</p>
										<div className="text-sm text-gray-500 space-y-1">
											<p>Bank: {selectedRequest.bankAccount?.bankName || "-"}</p>
											<p>
												Account Holder: {selectedRequest.bankAccount?.accountHolderName || "-"}
											</p>
											<p>
												Account Number: {selectedRequest.bankAccount?.accountNumber || "-"}
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="flex items-center justify-between pt-4">
								<div>
									<p className="text-sm font-medium text-black">
										Requested Amount
									</p>
									<p className="text-lg font-semibold text-purple-600">
										${selectedRequest.amount}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										Requested: {new Date(selectedRequest.requestDate).toLocaleDateString()}
									</p>
									{selectedRequest.status?.toLowerCase() === "processed" && (
										<p className="text-xs text-blue-600 mt-1">
											Processed: {new Date().toLocaleDateString()}
										</p>
									)}
								</div>
								<div>
									<p className="text-sm font-medium text-black">Status</p>
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
											selectedRequest.status
										)}`}
									>
										{selectedRequest.status}
									</span>
								</div>
							</div>
						</div>
					)}
					<DialogFooter className="gap-2 sm:gap-0">
						{selectedRequest?.status?.toLowerCase() === "pending" && (
							<>
								<Button
									variant="destructive"
									onClick={() =>
										handleUpdateStatus(selectedRequest.id, "REJECTED")
									}
									disabled={processingRequestId === selectedRequest.id}
								>
									{processingRequestId === selectedRequest.id ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									) : (
										<XCircle className="h-4 w-4 mr-2" />
									)}
									Reject
								</Button>
								<Button
									onClick={() =>
										handleUpdateStatus(selectedRequest.id, "APPROVED")
									}
									disabled={processingRequestId === selectedRequest.id}
									className="bg-green-600 hover:bg-green-700"
								>
									{processingRequestId === selectedRequest.id ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									) : (
										<CheckCircle className="h-4 w-4 mr-2" />
									)}
									Approve
								</Button>
							</>
						)}
						{selectedRequest?.status?.toLowerCase() === "approved" && (
							<Button
								onClick={() =>
									handleUpdateStatus(selectedRequest.id, "PROCESSED")
								}
								disabled={processingRequestId === selectedRequest.id}
								className="bg-blue-600 hover:bg-blue-700"
							>
								{processingRequestId === selectedRequest.id ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								) : (
									<CheckCircle className="h-4 w-4 mr-2" />
								)}
								Mark as Processed
							</Button>
						)}
						{selectedRequest?.status?.toLowerCase() === "processed" && (
							<div className="text-sm text-gray-500 py-2">
								This withdrawal has been processed and completed.
							</div>
						)}
						{selectedRequest?.status?.toLowerCase() === "rejected" && (
							<div className="text-sm text-red-500 py-2">
								This withdrawal request has been rejected.
							</div>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
