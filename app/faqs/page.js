"use client";
import { useState, useEffect, Suspense } from "react";
import { Search, HelpCircle, Youtube, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { faqApi } from "@/services/api";

// Categories for FAQs
const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account & Profile" },
  { value: "jobs", label: "Jobs & Projects" },
  { value: "payment", label: "Payments & Billing" },
  { value: "technical", label: "Technical Support" },
];

function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-100/50 to-white border-b border-purple-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
              How can we help you?
            </h1>
            <p className="text-lg sm:text-xl text-purple-600/90">
              Find answers to common questions about BirdEarner and get the support you need
            </p>
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
              <Input
                placeholder="Search for answers..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-purple-200 focus-visible:ring-purple-500 focus-visible:border-purple-500 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 p-1.5 bg-purple-100/50 rounded-xl border border-purple-200 shadow-sm">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === "all"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-purple-600 hover:text-purple-700 hover:bg-white/50"
                }`}
            >
              All FAQs
            </button>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category.value
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-purple-600 hover:text-purple-700 hover:bg-white/50"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium text-purple-600">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
              <Search className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold text-purple-900 mb-2">
              {searchQuery ? "No results found" : "No FAQs available"}
            </h3>
            <p className="text-lg text-purple-600">
              {searchQuery
                ? "Try adjusting your search terms or browse all categories"
                : "Please check back later for updates"}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 max-w-4xl mx-auto">
            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-purple-900">
                    {FAQ_CATEGORIES.find(cat => cat.value === category)?.label || category}
                  </h2>
                  <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                    {categoryFaqs.length} {categoryFaqs.length === 1 ? 'Question' : 'Questions'}
                  </div>
                </div>
                <div className="grid gap-4">
                  {categoryFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="group bg-white rounded-2xl border border-purple-200/70 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <HelpCircle className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <h3 className="text-lg font-semibold text-purple-900 group-hover:text-purple-700 transition-colors">
                              {faq.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                        {faq.youtube_link && (
                          <div className="pl-12">
                            <button
                              onClick={() => handleVideoClick(faq.youtube_link)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-600 transition-all duration-300 group/btn"
                            >
                              <Youtube className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                              <span className="font-medium">Watch Video Tutorial</span>
                              <div className="h-5 w-5 rounded-full bg-red-100 group-hover/btn:bg-red-200 flex items-center justify-center transition-colors">
                                <ExternalLink className="h-3 w-3" />
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Dialog - Keep existing dialog code */}
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
                    onClick={() => window.open(selectedVideo?.url, '_blank')}
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

export default function PublicFAQsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-purple-600">Loading FAQs...</p>
        </div>
      </div>
    }>
      <FAQContent />
    </Suspense>
  );
} 