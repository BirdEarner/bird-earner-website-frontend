"use client";

import { useState, useEffect } from "react";
import { Search, Mail, CheckCircle, Trash2, Calendar, User, MessageCircle } from "lucide-react";
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

export default function ContactSubmissionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { getToken } = useAdminAuth();
    const [selectedContact, setSelectedContact] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        async function fetchContacts() {
            try {
                setIsLoading(true);
                const token = getToken();
                const response = await contactApi.getAllContacts(token);

                if (response.success) {
                    setContacts(response.data.contacts);
                } else {
                    throw new Error(response.message || 'Failed to fetch contacts');
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
        }

        fetchContacts();
    }, [getToken, toast]);

    const handleMarkAsRead = async (id) => {
        try {
            const token = getToken();
            const response = await contactApi.markAsRead(token, id);

            if (response.success) {
                setContacts(contacts.map(contact =>
                    contact.id === id ? { ...contact, status: 'READ' } : contact
                ));
                toast({
                    title: "Success",
                    description: "Marked as read",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update status",
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this submission?")) return;
        try {
            const token = getToken();
            const response = await contactApi.deleteContact(token, id);

            if (response.success) {
                setContacts(contacts.filter(contact => contact.id !== id));
                toast({
                    title: "Success",
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

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex-1 p-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="text-sm text-purple-600">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-black">Contact Submissions</h1>
                    <p className="text-black/70">
                        Manage inquiries and messages from the contact form.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
                    <Input
                        placeholder="Search by name, email or subject..."
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">Contact Details</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">Subject</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-purple-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className={`border-b border-purple-100 last:border-0 ${contact.status === 'PENDING' ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${contact.status === 'PENDING' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-black">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-0.5">
                                            <p className="text-sm text-black">{contact.email}</p>
                                            {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-black">{contact.subject}</td>
                                    <td className="px-4 py-3 text-sm text-black">
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${contact.status === 'PENDING'
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-purple-600"
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setIsDetailOpen(true);
                                                    if (contact.status === 'PENDING') handleMarkAsRead(contact.id);
                                                }}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600"
                                                onClick={() => handleDelete(contact.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredContacts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No submissions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-purple-600" />
                            <span>Message from {selectedContact?.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <User className="h-3 w-3" /> Name
                                    </p>
                                    <p className="text-sm font-medium">{selectedContact.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date
                                    </p>
                                    <p className="text-sm font-medium">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> Email
                                    </p>
                                    <p className="text-sm font-medium">{selectedContact.email}</p>
                                </div>
                                {selectedContact.phone && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            Phone
                                        </p>
                                        <p className="text-sm font-medium">{selectedContact.phone}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 border-t pt-2">
                                <p className="text-xs text-gray-500">Subject</p>
                                <p className="text-sm font-bold">{selectedContact.subject}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Message</p>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap min-h-[100px]">
                                    {selectedContact.message}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                        {selectedContact?.status === 'PENDING' && (
                            <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => {
                                    handleMarkAsRead(selectedContact.id);
                                    setIsDetailOpen(false);
                                }}
                            >
                                Mark Read
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
