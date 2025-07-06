"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  FileText,
  Users,
  Clock,
  Shield,
  PlayCircle,
  Twitter,
  Instagram,
  Youtube,
  Map,
  MessagesSquare,
  Mail,
  User,
  Phone,
  Send,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { contactApi } from "@/services/api";
import birdyAnimation from "@/public/animations/birdy.json";
import clientAnimation from "@/public/animations/client.json";
import manAnimation from "@/public/animations/man.json";
import owlAnimation from "@/public/animations/owl.json";
import meditateAnimation from "@/public/animations/meditate.json";
import { useState, useEffect, Suspense } from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import Android from "@/components/ui/android";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { motion } from "framer-motion";
import { useCursorPosition } from "@/hooks/useCursorPosition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

function HomeContent() {
  const {
    smoothY,
    smoothAppY,
    smoothFeaturesY,
    smoothTestimonialsY,
    heroOpacity,
    appOpacity,
    featuresOpacity,
    testimonialsOpacity,
  } = useScrollAnimation();

  useSmoothScroll();

  const cursorPosition = useCursorPosition();
  const [birdPosition, setBirdPosition] = useState({ x: 0, y: 0 });
  const [isMovingRight, setIsMovingRight] = useState(false);
  const { toast } = useToast();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const animateBird = () => {
      const dx = (cursorPosition.x - birdPosition.x) * 0.1;
      const dy = (cursorPosition.y - birdPosition.y) * 0.1;

      if (dx !== 0) {
        setIsMovingRight(dx > 0);
      }

      setBirdPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    };

    const animationFrame = requestAnimationFrame(animateBird);
    return () => cancelAnimationFrame(animationFrame);
  }, [cursorPosition.x, cursorPosition.y, birdPosition.x, birdPosition.y]);

  // Validation functions
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!contactForm.name.trim()) {
      errors.name = 'Full name is required';
    } else if (contactForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s'-]+$/.test(contactForm.name)) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!contactForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (International format)
    if (!contactForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(contactForm.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Subject validation
    if (!contactForm.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (contactForm.subject.trim().length < 5) {
      errors.subject = 'Subject must be at least 5 characters long';
    } else if (contactForm.subject.trim().length > 500) {
      errors.subject = 'Subject cannot exceed 500 characters';
    }

    // Message validation
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (contactForm.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    } else if (contactForm.message.trim().length > 5000) {
      errors.message = 'Message cannot exceed 5000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Format phone number as user types (simplified for international use)
  const formatPhoneNumber = (value) => {
    // Remove all non-digit and non-plus characters
    const phoneNumber = value.replace(/[^\d\+]/g, '');
    
    // Limit to reasonable length (max 16 characters including +)
    if (phoneNumber.length <= 16) {
      return phoneNumber;
    }
    return contactForm.phone; // Return previous value if too long
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
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
        phone: contactForm.phone.replace(/\s+/g, '') // Remove spaces before sending
      });
      
      // Handle success response
      if (response.success && response.data) {
        toast({
          title: "Message sent successfully!",
          description: `Thank you for reaching out! Your ticket ID is ${response.data.ticket_id}. We'll get back to you soon.`,
        });
        
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setFormErrors({});
      }
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Handle API validation errors
      if (error.message && error.message.includes('Validation error')) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const newErrors = {};
            errorData.errors.forEach(err => {
              newErrors[err.field] = err.message;
            });
            setFormErrors(newErrors);
            
            toast({
              title: "Validation Error",
              description: "Please check the highlighted fields and try again.",
              variant: "destructive",
            });
            return;
          }
        } catch (parseError) {
          // If parsing fails, show generic error
        }
      }
      
      // Generic error handling
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly at support@birdearner.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number formatting
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setContactForm(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setContactForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
        staggerChildren: 0.3,
      },
    },
  };

  const slideIn = {
    initial: { x: -60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 1, ease: "easeOut" },
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Floating Bird Animation */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          transform: `translate(${birdPosition.x}px, ${birdPosition.y}px)`,
          transition: "transform 0.3s ease-out",
          width: "80px",
          height: "80px",
        }}
      >
        <div style={{ transform: `scaleX(${isMovingRight ? -1 : 1})` }}>
          <Lottie animationData={birdyAnimation} />
        </div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full bg-gradient-to-b from-white to-purple-50/90 backdrop-blur-md z-50 border-b border-purple-100"
      >
        <div className="container mx-auto px-10 sm:px-8 lg:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200">
              <Image
                src="/bird.png"
                alt="BirdEarner Logo"
                width={42}
                height={42}
                className="object-contain brightness-0 invert"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
              BirdEarner
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/faqs">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
              >
                FAQs
              </Button>
            </Link>
            <a href="#contact">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
              >
                Contact
              </Button>
            </a>
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ y: smoothY, opacity: heroOpacity }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="min-h-screen pt-32 pb-16 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-purple-50 via-white to-white flex items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex-1 space-y-8 text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Be BirdEARNER, Become Bread Earner!
              </span>
              <br />
              <span className="text-purple-950"></span>
            </h1>
            <p className="text-xl text-purple-700/70 max-w-2xl mx-auto lg:mx-0">
              BirdEarner connects freelancers with local businesses for both
              remote and physical job opportunities. Hire talent or offer your
              skills seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/sign-in">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            {/* Animated Tooltip */}
            <div className="flex items-center justify-center lg:justify-start gap-2 pt-8">
              <AnimatedTooltip
                items={[
                  {
                    id: 1,
                    name: "Sarah Johnson",
                    designation: "Freelance Graphic Designer",
                    image:
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                  },
                  {
                    id: 2,
                    name: "Michael Chen",
                    designation: "Software Developer",
                    image:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                  },
                  {
                    id: 3,
                    name: "Emily Rodriguez",
                    designation: "Content Writer",
                    image:
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                  },
                  {
                    id: 4,
                    name: "David Wilson",
                    designation: "Digital Marketer",
                    image:
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                  },
                  {
                    id: 5,
                    name: "Lisa Chang",
                    designation: "E-commerce Specialist",
                    image:
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                  },
                ]}
              />
              <p className="text-sm text-purple-600 font-medium p-3">
                Trusted by professionals worldwide
              </p>
            </div>
          </motion.div>
          <motion.div
            variants={{
              initial: { scale: 0.8, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { duration: 0.8, ease: "easeOut" },
            }}
            className="flex-1 relative"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 opacity-30">
              <Lottie animationData={owlAnimation} />
            </div>
            <div className="relative z-10">
              <Lottie
                animationData={manAnimation}
                className="w-full h-[400px]"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* App Download Section */}
      <motion.section
        style={{ y: smoothAppY, opacity: appOpacity }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-32 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-white via-purple-50 to-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            variants={{
              initial: { x: -50, opacity: 0 },
              animate: { x: 0, opacity: 1 },
              transition: { duration: 0.6 },
            }}
            className="flex-1 relative flex items-center justify-center order-2 lg:order-1"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
              <Android width={300} src="/dashboard-preview.png" />
            </div>
          </motion.div>
          <motion.div
            variants={fadeIn}
            className="flex-1 space-y-8 order-1 lg:order-2"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Get Our Mobile App
              </span>
            </h2>
            <p className="text-xl text-purple-700/70">
              Experience seamless file sharing on the go. Download our mobile
              app to manage your files and stay connected with clients anywhere,
              anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="#"
                className="flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-6 py-4 rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
              >
                <Image
                  src="/image.png"
                  alt="Google Play"
                  width={32}
                  height={32}
                  className="text-white invert"
                />
                <div>
                  <div className="text-xs opacity-80">GET IT ON</div>
                  <div className="text-xl font-semibold flex items-center gap-2">
                    Google Play
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl text-purple-600 font-bold">
                    4.8
                  </span>
                </div>
                <div>
                  <div className="text-purple-900 font-semibold">
                    User Rating
                  </div>
                  <div className="text-purple-600">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Deadline Protection & Penalties
                  </h3>
                  <p className="text-purple-700/70">
                    Ensure timely work with automated deadline tracking.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    In-app Chat & Job Management
                  </h3>
                  <p className="text-purple-700/70">
                    Stay connected with your clients on mobile
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        style={{ y: smoothFeaturesY, opacity: featuresOpacity }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
        className="py-32 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden"
      >
        <motion.div variants={fadeIn} className="container mx-auto">
          <motion.div
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-6">
              Why Professionals Choose Us
            </h2>
            <p className="text-xl text-purple-700/70">
              Join thousands of freelancers and clients who trust BirdEarner to
              connect, collaborate, and earn seamlessly! 🚀
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div
              variants={{
                initial: { x: -30, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { duration: 0.6, delay: 0.2 },
              }}
              className="space-y-6"
            >
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-8 bg-white ring-1 ring-purple-900/5 rounded-lg leading-none flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-900 mb-2">
                      Secure Payments via Wallet
                    </div>
                    <p className="text-purple-700/70">
                      Get paid instantly with our secure, hassle-free wallet
                      system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-8 bg-white ring-1 ring-purple-900/5 rounded-lg leading-none flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-900 mb-2">
                      Job Priority & Milestones
                    </div>
                    <p className="text-purple-700/70">
                      Set goals, track progress, and get rewarded for every
                      milestone.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              variants={{
                initial: { x: 30, opacity: 0 },
                animate: { x: 0, opacity: 1 },
                transition: { duration: 0.6, delay: 0.4 },
              }}
              className="space-y-6 lg:mt-12"
            >
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-8 bg-white ring-1 ring-purple-900/5 rounded-lg leading-none flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-900 mb-2">
                      Nests & Eggs (Reward System)
                    </div>
                    <p className="text-purple-700/70">
                      Earn exclusive rewards and level up with every successful
                      job.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-8 bg-white ring-1 ring-purple-900/5 rounded-lg leading-none flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Map className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-900 mb-2">
                      Location-based Physical Jobs
                    </div>
                    <p className="text-purple-700/70">
                      Find and complete jobs near you with real-time location
                      matching.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        style={{ y: smoothTestimonialsY, opacity: testimonialsOpacity }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-20%" }}
        variants={staggerContainer}
        className="min-h-screen py-32 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden flex items-center"
      >
        <motion.div variants={fadeIn} className="container mx-auto">
          <motion.div
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-4"
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-purple-700/70">
              Hear from professionals who have transformed their work experience
              with BirdEarner
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="mt-20">
            <AnimatedTestimonials
              autoplay={true}
              testimonials={[
                {
                  name: "Sarah Johnson",
                  designation: "Freelance Graphic Designer",
                  quote:
                    "BirdEarner has completely changed the way I find clients. The job management tools keep everything organized, and the secure payments give me peace of mind.",
                  src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                },
                {
                  name: "Michael Chen",
                  designation: "Software Developer",
                  quote:
                    "I love how easy it is to connect with clients worldwide. The in-app chat and milestone system ensure smooth project execution every time.",
                  src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                },
                {
                  name: "Emily Rodriguez",
                  designation: "Content Writer",
                  quote:
                    "The multilingual job descriptions are a game changer! I can now work with clients from different countries without language barriers.",
                  src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                },
                {
                  name: "David Wilson",
                  designation: "Digital Marketer",
                  quote:
                    "BirdEarner's reward system is a great motivator! Earning bonuses while working on projects keeps me engaged and excited.",
                  src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                },
                {
                  name: "Lisa Chang",
                  designation: "E-commerce Specialist",
                  quote:
                    "As someone who manages multiple clients, I appreciate the secure wallet payments. Getting paid on time without any hassle is a huge relief!",
                  src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3",
                },
              ]}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="py-24 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto relative z-10"
        >
          <div className="text-center mb-16">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-purple-700/70 max-w-2xl mx-auto"
            >
              Have questions or suggestions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Contact Info */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-6">Let's Connect</h3>
                <p className="text-lg text-purple-700/80 mb-8">
                  Ready to start your journey with BirdEarner? We're here to help you every step of the way.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200/50 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Email Us</p>
                    <p className="text-purple-700/70">support@birdearner.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200/50 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Call Us</p>
                    <p className="text-purple-700/70">+91 99213 18237</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200/50 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md">
                    <MessagesSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Live Chat</p>
                    <p className="text-purple-700/70">Available 24/7</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-8">
                <p className="text-lg font-semibold text-purple-900 mb-4">Follow Us</p>
                <div className="flex gap-4">
                  <Link
                    href="https://x.com/birdearner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/thebirdearner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </Link>
                  <Link
                    href="https://www.youtube.com/@birdearner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl border border-purple-200/50 p-8"
            >
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-purple-900 font-medium">
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
                          formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-purple-900 font-medium">
                      Email Address *
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
                          formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-purple-900 font-medium">
                    Phone Number *
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
                        formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                  <p className="text-xs text-purple-600">Please enter a valid phone number. It might be used for contacting you.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-purple-900 font-medium">
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
                    maxLength={500}
                    className={`border-purple-200 focus:border-purple-500 focus:ring-purple-500 ${
                      formErrors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {formErrors.subject && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.subject}</p>
                  )}
                  <p className="text-xs text-purple-600">{contactForm.subject.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-purple-900 font-medium">
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
                    maxLength={5000}
                    className={`border-purple-200 focus:border-purple-500 focus:ring-purple-500 resize-none ${
                      formErrors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {formErrors.message && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.message}</p>
                  )}
                  <p className="text-xs text-purple-600">{contactForm.message.length}/5000 characters</p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="bg-gradient-to-b from-purple-900 to-purple-950 text-white py-24 px-6 sm:px-8 lg:px-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(139,92,246,0.2),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
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
              <p className="text-purple-200/80 leading-relaxed">
                Be BirdEARNER, Become Bread Earner!
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://x.com/birdearner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-5 h-5 opacity-75 hover:opacity-100" />
                </Link>
                <Link
                  href="https://www.instagram.com/thebirdearner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5 opacity-75 hover:opacity-100" />
                </Link>
                <Link
                  href="https://www.youtube.com/@birdearner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-5 h-5 opacity-75 hover:opacity-100" />
                </Link>
                {/* <Link
                  href="#"
                  className="w-10 h-10 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 flex items-center justify-center transition-colors"
                >
                  <Github className="w-5 h-5 opacity-75 hover:opacity-100" />
                </Link> */}
              </div>
            </div>

            {/* Product Column */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Mobile App
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* Company Column */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-purple-200/70 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* Newsletter Column */}
            <div />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stay Updated</h3>
              <p className="text-purple-200/70">
                Subscribe to our newsletter for the latest updates and features.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-700 focus:outline-none focus:border-purple-500 text-white placeholder:text-purple-300/50"
                />
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-purple-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-purple-200/70">
              © {new Date().getFullYear()} BirdEarner. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="https://www.termsfeed.com/live/b92f614b-fad8-4a63-a6e6-3d87f8afc321"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-200/70 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="https://www.termsfeed.com/live/b92f614b-fad8-4a63-a6e6-3d87f8afc321"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-200/70 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              {/* <Link
                href="#"
                className="text-purple-200/70 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link> */}
            </div>
          </div>
        </motion.div>
      </motion.footer>
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
