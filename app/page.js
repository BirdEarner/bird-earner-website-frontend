"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Users,
  Clock,
  Shield,
  Map,
  Mail,
  User,
  Phone,
  Send,
  CheckCircle,
  Twitter,
  Instagram,
  Youtube,
  Briefcase,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { contactApi } from "@/services/api";
import { useState, Suspense } from "react";
import Android from "@/components/ui/android";
import { motion } from "framer-motion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.birdearner";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/birdearner/id6741027618";
const SUPPORT_EMAIL = "support@birdearner.com";
const SUPPORT_PHONE = "+91 84597 23322";
const SUPPORT_PHONE_TEL = "+918459723322";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
    </div>
  );
}

function StoreBadge({ href, store, subtitle, title }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-5 py-3.5 rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl min-w-[180px]"
    >
      {store === "play" ? (
        <Image
          src="/image.png"
          alt=""
          width={28}
          height={28}
          className="invert shrink-0"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 shrink-0 fill-white"
          aria-hidden
        >
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.45 2.93 10.85 4.7 7.13C5.57 5.28 7.5 4.15 9.4 4.12C10.69 4.09 11.9 4.98 12.71 4.98C13.5 4.98 14.96 3.92 16.54 4.1C17.21 4.13 18.99 4.37 20.16 6.05C20.06 6.11 17.73 7.5 17.76 10.24C17.8 13.5 20.6 14.56 20.64 14.58C20.61 14.66 20.17 16.16 19.15 17.69L18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
        </svg>
      )}
      <div className="text-left leading-tight">
        <div className="text-[10px] uppercase tracking-wide opacity-80">
          {subtitle}
        </div>
        <div className="text-base sm:text-lg font-semibold">{title}</div>
      </div>
    </a>
  );
}

function HomeContent() {
  useSmoothScroll();

  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const validateForm = () => {
    const errors = {};

    if (!contactForm.name.trim()) {
      errors.name = "Full name is required";
    } else if (contactForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s'-]+$/.test(contactForm.name)) {
      errors.name =
        "Name can only contain letters, spaces, hyphens, and apostrophes";
    }

    if (!contactForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!contactForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (
      !/^[\+]?[1-9][\d]{0,15}$/.test(contactForm.phone.replace(/\s+/g, ""))
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!contactForm.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (contactForm.subject.trim().length < 5) {
      errors.subject = "Subject must be at least 5 characters long";
    } else if (contactForm.subject.trim().length > 500) {
      errors.subject = "Subject cannot exceed 500 characters";
    }

    if (!contactForm.message.trim()) {
      errors.message = "Message is required";
    } else if (contactForm.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long";
    } else if (contactForm.message.trim().length > 5000) {
      errors.message = "Message cannot exceed 5000 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d\+]/g, "");
    if (phoneNumber.length <= 16) return phoneNumber;
    return contactForm.phone;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Check all required fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contactApi.submitContactForm({
        ...contactForm,
        phone: contactForm.phone.replace(/\s+/g, ""),
      });

      if (response.success && response.data) {
        setSubmissionSuccess(true);
        setTicketId(response.data.ticket_id);

        toast({
          title: "Message sent successfully!",
          description: `Thank you for reaching out! Your ticket ID is ${response.data.ticket_id}. We'll get back to you soon.`,
        });

        setContactForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setFormErrors({});
      }
    } catch (error) {
      console.error("Contact form error:", error);

      if (error.message && error.message.includes("Validation error")) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const newErrors = {};
            errorData.errors.forEach((err) => {
              newErrors[err.field] = err.message;
            });
            setFormErrors(newErrors);
            toast({
              title: "Please check your input",
              description:
                "Some fields need your attention. Please review and try again.",
              variant: "destructive",
            });
            return;
          }
        } catch {
          toast({
            title: "Validation Error",
            description: "Please check all fields and try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Failed to send message",
        description: `We couldn't send your message right now. Please try again or email ${SUPPORT_EMAIL}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setContactForm((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setContactForm((prev) => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full bg-gradient-to-b from-white to-purple-50/90 backdrop-blur-md z-50 border-b border-purple-100"
      >
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200 shrink-0">
              <Image
                src="/bird.png"
                alt="BirdEarner Logo"
                width={42}
                height={42}
                className="object-contain brightness-0 invert w-7 h-7 sm:w-[42px] sm:h-[42px]"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent truncate">
              BirdEarner
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <Link href="/faqs" className="hidden sm:block">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
              >
                FAQs
              </Button>
            </Link>
            <a href="#contact" className="hidden md:block">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
              >
                Contact
              </Button>
            </a>
            <a href="#download">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base px-3 sm:px-4">
                Download App
              </Button>
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="min-h-[100svh] pt-28 sm:pt-32 pb-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-purple-50 via-white to-white flex items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-10 lg:gap-12">
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex-1 space-y-6 sm:space-y-8 text-center md:text-left"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-3 py-1 text-xs sm:text-sm font-medium text-purple-700">
              <Smartphone className="h-3.5 w-3.5" />
              Live on App Store &amp; Google Play
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Hire locally. Earn locally.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-purple-700/70 max-w-2xl mx-auto lg:mx-0">
              BirdEarner connects clients with skilled freelancers for on-site
              and remote work — with in-app chat, secure wallet payments, and
              milestone tracking built in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <StoreBadge
                href={PLAY_STORE_URL}
                store="play"
                subtitle="Get it on"
                title="Google Play"
              />
              <StoreBadge
                href={APP_STORE_URL}
                store="apple"
                subtitle="Download on the"
                title="App Store"
              />
            </div>
            <p className="text-sm text-purple-600/80">
              Free to download · Built for clients &amp; freelancers in India
            </p>
          </motion.div>

          <motion.div
            variants={{
              initial: { scale: 0.92, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative flex justify-center md:justify-end"
          >
            <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
              <Android width={240} src="/app-preview-2.png" />
            </div>
            <div className="hidden lg:block absolute right-0 top-20 opacity-95 scale-[0.85] rotate-6 translate-x-6">
              <Android width={200} src="/app-preview-3.png" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* App Download */}
      <motion.section
        id="download"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-white via-purple-50 to-white relative overflow-hidden scroll-mt-24"
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            variants={fadeIn}
            className="flex-1 relative flex items-center justify-center order-2 lg:order-1"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30" />
            <div className="relative z-10 flex items-end gap-4">
              <Android width={200} src="/app-preview-2.png" />
              <div className="hidden sm:block mb-8">
                <Android width={200} src="/app-preview-3.png" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="flex-1 space-y-6 sm:space-y-8 order-1 lg:order-2"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                The BirdEarner app is live
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-purple-700/70">
              Post jobs, chat with freelancers, track milestones, and get paid
              securely — all from your phone. Available now on iOS and Android.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <StoreBadge
                href={PLAY_STORE_URL}
                store="play"
                subtitle="Get it on"
                title="Google Play"
              />
              <StoreBadge
                href={APP_STORE_URL}
                store="apple"
                subtitle="Download on the"
                title="App Store"
              />
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    In-app chat &amp; job management
                  </h3>
                  <p className="text-purple-700/70 text-sm sm:text-base">
                    Negotiate, share updates, and manage work in one place.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Deadlines &amp; milestone tracking
                  </h3>
                  <p className="text-purple-700/70 text-sm sm:text-base">
                    Keep projects on schedule with clear progress and protection.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden"
      >
        <motion.div variants={fadeIn} className="container mx-auto">
          <motion.div
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-4">
              Built for real work
            </h2>
            <p className="text-lg sm:text-xl text-purple-700/70">
              Whether you need on-site help or remote skills, BirdEarner keeps
              hiring and earning simple, transparent, and secure.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              {
                icon: Shield,
                title: "Secure wallet payments",
                body: "Pay and get paid through the in-app wallet with clear status at every step.",
              },
              {
                icon: Clock,
                title: "Job priority & milestones",
                body: "Set goals, track progress, and move work forward without messy follow-ups.",
              },
              {
                icon: Users,
                title: "Nests & Eggs rewards",
                body: "Earn cashback and discounts through BirdEarner’s exclusive rewards system.",
              },
              {
                icon: Map,
                title: "Location-based jobs",
                body: "Find nearby physical jobs or post local work that freelancers can reach.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative p-6 sm:p-8 bg-white ring-1 ring-purple-900/5 rounded-2xl flex items-start gap-4 sm:gap-6 shadow-sm"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-purple-900 mb-1.5">
                    {item.title}
                  </div>
                  <p className="text-purple-700/70 text-sm sm:text-base">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* How it works */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden"
      >
        <motion.div variants={fadeIn} className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-4">
              How BirdEarner works
            </h2>
            <p className="text-lg sm:text-xl text-purple-700/70">
              Three clear steps — no fluff, just the flow that gets work done.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                step: "01",
                title: "Post or find a job",
                body: "Clients post detailed requirements. Freelancers browse remote and nearby on-site work.",
              },
              {
                icon: MessageCircle,
                step: "02",
                title: "Chat & agree",
                body: "Talk in-app, negotiate terms, and lock milestones before work begins.",
              },
              {
                icon: CheckCircle,
                step: "03",
                title: "Deliver & get paid",
                body: "Track progress, complete the job, and settle securely through the wallet.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-purple-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-purple-900">
                  {item.title}
                </h3>
                <p className="text-purple-700/70 text-sm sm:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <StoreBadge
              href={PLAY_STORE_URL}
              store="play"
              subtitle="Get it on"
              title="Google Play"
            />
            <StoreBadge
              href={APP_STORE_URL}
              store="apple"
              subtitle="Download on the"
              title="App Store"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Contact */}
      <motion.section
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-20 sm:py-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden scroll-mt-24"
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-purple-700/70 max-w-2xl mx-auto">
              Questions, feedback, or support — send a message and we’ll respond
              as soon as we can.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-3">
                  Let&apos;s Connect
                </h3>
                <p className="text-purple-700/80">
                  Prefer email or a call? Reach BirdEarner support directly.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-purple-200/50 shadow-sm hover:border-purple-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Email Us</p>
                    <p className="text-purple-700/70 break-all">
                      {SUPPORT_EMAIL}
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${SUPPORT_PHONE_TEL}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-purple-200/50 shadow-sm hover:border-purple-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Call Us</p>
                    <p className="text-purple-700/70">{SUPPORT_PHONE}</p>
                  </div>
                </a>
              </div>

              <div className="pt-2">
                <p className="text-lg font-semibold text-purple-900 mb-4">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  <Link
                    href="https://x.com/birdearner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center transition-all shadow-md"
                    aria-label="BirdEarner on X"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/thebirdearner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center transition-all shadow-md"
                    aria-label="BirdEarner on Instagram"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </Link>
                  <Link
                    href="https://www.youtube.com/@birdearner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center transition-all shadow-md"
                    aria-label="BirdEarner on YouTube"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-purple-200/50 p-6 sm:p-8">
              {!submissionSuccess ? (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-purple-900 font-medium"
                      >
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          value={contactForm.name}
                          onChange={handleInputChange}
                          required
                          className={`pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 ${
                            formErrors.name
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-sm text-red-500">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-purple-900 font-medium"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={contactForm.email}
                          onChange={handleInputChange}
                          required
                          className={`pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 ${
                            formErrors.email
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-500">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-purple-900 font-medium"
                    >
                      Phone *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={contactForm.phone}
                        onChange={handleInputChange}
                        required
                        className={`pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 ${
                          formErrors.phone
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className="text-purple-900 font-medium"
                    >
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                      className={`border-purple-200 focus:border-purple-500 focus:ring-purple-500 ${
                        formErrors.subject
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {formErrors.subject && (
                      <p className="text-sm text-red-500">
                        {formErrors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-purple-900 font-medium"
                    >
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className={`border-purple-200 focus:border-purple-500 focus:ring-purple-500 resize-none ${
                        formErrors.message
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {formErrors.message && (
                      <p className="text-sm text-red-500">
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-purple-700/70">
                      We&apos;ve received your message and will get back to you
                      soon.
                    </p>
                  </div>
                  {ticketId && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">
                        Your Ticket ID
                      </p>
                      <p className="text-lg font-mono font-bold text-purple-900">
                        {ticketId}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      setSubmissionSuccess(false);
                      setTicketId("");
                      setFormErrors({});
                    }}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Another Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-purple-900 to-purple-950 text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Image
                    src="/bird.png"
                    alt="BirdEarner Logo"
                    width={28}
                    height={28}
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-2xl font-bold">BirdEarner</span>
              </div>
              <p className="text-purple-200/80 leading-relaxed max-w-md">
                Your platform to connect with skilled freelancers or local jobs —
                simple, secure, and rewarding.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white bg-purple-700/60 hover:bg-purple-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Google Play
                </a>
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white bg-purple-700/60 hover:bg-purple-600 px-3 py-2 rounded-lg transition-colors"
                >
                  App Store
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-2 text-purple-200/80">
                <li>
                  <a href="#download" className="hover:text-white transition-colors">
                    Download App
                  </a>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-white transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Contact</h3>
              <ul className="space-y-2 text-purple-200/80 text-sm">
                <li>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="hover:text-white transition-colors break-all"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${SUPPORT_PHONE_TEL}`}
                    className="hover:text-white transition-colors"
                  >
                    {SUPPORT_PHONE}
                  </a>
                </li>
                <li className="text-purple-200/60 pt-1">
                  BCF BIRDEARNER SOLUTIONS (OPC) PRIVATE LIMITED
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-purple-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-purple-200/70">
              © {new Date().getFullYear()} BirdEarner. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-purple-200/70 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-purple-200/70 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}
