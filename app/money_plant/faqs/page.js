"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Youtube, Filter, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { faqApi } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Categories for FAQs
const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account & Profile" },
  { value: "jobs", label: "Jobs & Projects" },
  { value: "payment", label: "Payments & Billing" },
  { value: "technical", label: "Technical Support" },
];

export default function FAQsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general", // Default category
    keywords: "",
    youtubeLink: "",
  });
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  // Fetch FAQs from backend
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        const data = await faqApi.getAllFaqs();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch FAQs. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (faq.category && faq.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || "general";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {});

  const handleOpenDialog = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || "general",
        keywords: faq.keywords || "",
        youtubeLink: faq.youtubeLink || "",
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        category: "general",
        keywords: "",
        youtubeLink: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "general",
      keywords: "",
      youtubeLink: "",
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const faqDataToSubmit = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        keywords: formData.keywords,
        youtubeLink: formData.youtubeLink,
      };

      if (editingFaq) {
        // Update existing FAQ
        const updatedFaq = await faqApi.updateFaq(editingFaq.id, faqDataToSubmit);
        setFaqs(faqs.map(faq =>
          faq.id === editingFaq.id ? updatedFaq : faq
        ));
        toast({
          variant: "success",
          title: "FAQ Updated",
          description: "The FAQ has been updated successfully.",
        });
      } else {
        // Add new FAQ
        const newFaq = await faqApi.createFaq(faqDataToSubmit);
        setFaqs([newFaq, ...faqs]);
        toast({
          variant: "success",
          title: "FAQ Added",
          description: "New FAQ has been added successfully.",
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingFaq ? 'update' : 'create'} FAQ. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await faqApi.deleteFaq(id);
      setFaqs(faqs.filter(faq => faq.id !== id));
      toast({
        variant: "success",
        title: "FAQ Deleted",
        description: "The FAQ has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete FAQ. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to handle video link click
  const handleVideoClick = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      setSelectedVideo({
        url: videoUrl,
        id: videoId
      });
      setShowVideoDialog(true);
    } else {
      window.open(videoUrl, '_blank');
    }
  };

  // Function to handle redirect to YouTube
  const handleRedirectToYouTube = () => {
    if (selectedVideo) {
      window.open(selectedVideo.url, '_blank');
      setShowVideoDialog(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 bg-gradient-to-b from-purple-50/50 to-white">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
            FAQs Management
          </h1>
          <p className="text-purple-600">
            Organize and manage your frequently asked questions
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New FAQ
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
          <Input
            placeholder="Search questions, answers..."
            className="pl-10 h-11 border-purple-200 focus-visible:ring-purple-500 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 border-purple-200 rounded-xl">
            <Filter className="mr-2 h-4 w-4 text-purple-500" />
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="focus:bg-purple-50">All Categories</SelectItem>
            {FAQ_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value} className="focus:bg-purple-50">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* FAQs Display Section */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-purple-100">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-current border-t-transparent text-purple-600"></div>
            <p className="mt-4 text-base font-medium text-purple-600">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-purple-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Search className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-lg font-medium text-purple-900">
              {searchQuery ? "No FAQs found matching your search." : "No FAQs available."}
            </p>
            <p className="mt-2 text-purple-600">
              {searchQuery ? "Try adjusting your search terms." : "Add your first FAQ to get started."}
            </p>
          </div>
        ) : (
          Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-purple-900">
                  {FAQ_CATEGORIES.find(cat => cat.value === category)?.label || category}
                </h2>
                <div className="h-6 px-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium flex items-center">
                  {categoryFaqs.length} {categoryFaqs.length === 1 ? 'FAQ' : 'FAQs'}
                </div>
              </div>
              <div className="grid gap-4">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="group rounded-2xl border border-purple-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-purple-900 group-hover:text-purple-700 transition-colors">
                            {faq.question}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {faq.keywords && faq.keywords.split(',').map((keyword, index) => (
                            <span key={index} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-xs font-medium">
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                        {faq.youtubeLink && (
                          <button
                            onClick={() => handleVideoClick(faq.youtubeLink)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-600 transition-all duration-300 group/btn"
                          >
                            <Youtube className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                            <span className="font-medium">Watch Video Tutorial</span>
                            <div className="h-5 w-5 rounded-full bg-red-100 group-hover/btn:bg-red-200 flex items-center justify-center transition-colors">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="transition-transform group-hover/btn:translate-x-0.5"
                              >
                                <path
                                  d="M5 12h14M12 5l7 7-7 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                      <div className="flex items-start gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(faq)}
                          disabled={isLoading}
                          className="hover:bg-purple-100 rounded-lg"
                        >
                          <Pencil className="h-4 w-4 text-purple-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                          disabled={isLoading}
                          className="hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAQ Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
              {editingFaq ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-900">Question</label>
              <Input
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter the question"
                disabled={isLoading}
                className="focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-900">Answer</label>
              <Textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Enter the answer"
                rows={4}
                disabled={isLoading}
                className="focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-900">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-full focus:ring-purple-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="focus:bg-purple-50">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-900">Keywords (comma separated)</label>
              <Input
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder="e.g. payment, withdrawal, birds"
                disabled={isLoading}
                className="focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-900">YouTube Tutorial Link</label>
              <Input
                value={formData.youtubeLink}
                onChange={(e) =>
                  setFormData({ ...formData, youtubeLink: e.target.value })
                }
                placeholder="Enter YouTube video URL (optional)"
                disabled={isLoading}
                className="focus-visible:ring-purple-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isLoading}
              className="border-purple-200 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  {editingFaq ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{editingFaq ? "Update" : "Add"} FAQ</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Preview Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-2xl">
          <div className="relative bg-gradient-to-b from-red-50 to-white">
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Youtube className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    Video Tutorial
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Watch and learn how it works
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="relative px-6">
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo?.id}?autoplay=1&rel=0&modestbranding=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>

            <div className="p-6 pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-sm">
                    Watching tutorial video
                  </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowVideoDialog(false)}
                    variant="outline"
                    className="flex-1 sm:flex-initial border-red-200 hover:bg-red-50 text-red-600"
                  >
                    Close Preview
                  </Button>
                  <Button
                    onClick={handleRedirectToYouTube}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in YouTube
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 