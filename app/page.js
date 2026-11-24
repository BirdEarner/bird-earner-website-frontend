"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, Fragment } from "react";
import { API_BASE_URL } from "@/services/api";
import { useRouter } from "next/navigation";
import birdyAnimation from "@/public/animations/birdy.json";
import manAnimation from "@/public/animations/man.json";
import { useCursorPosition } from "@/hooks/useCursorPosition";
import {
  Laptop,
  SquarePlay,
  PenTool,
  CodeXml,
  Headphones,
  FileText,
  Image as ImageIcon,
  House,
  Wrench,
  Zap,
  Hammer,
  Brush,
  PaintRoller,
  AirVent,
  Users,
  BriefcaseBusiness,
  MessageCircle,
  ShieldCheck,
  Truck,
  Star,
  Search,
  Send,
  Settings,
  Wallet,
  ArrowRight,
  CircleCheck,
  Upload,
  ChevronDown,
  Download,
  Mail,
  Phone,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const serviceCategories = [
  { name: "Remote Services", description: "Get your digital and online work done from anywhere.", icon: Laptop, color: "text-purple-600", featured: true },
  { name: "Video Editor", icon: SquarePlay, color: "text-purple-600" },
  { name: "Graphic Designer", icon: PenTool, color: "text-purple-600" },
  { name: "Full Stack Developer", icon: CodeXml, color: "text-purple-600" },
  { name: "Remote IT Support", icon: Headphones, color: "text-purple-600" },
  { name: "Resume Writer", icon: FileText, color: "text-purple-600" },
  { name: "Poster Maker", icon: ImageIcon, color: "text-purple-600" },
  { name: "On-Site Services", description: "Book trusted, skilled professionals for home, office, and on-location services.", icon: House, color: "text-purple-600", featured: true },
  { name: "Plumber", icon: Wrench, color: "text-blue-500" },
  { name: "Electrician", icon: Zap, color: "text-amber-500", filled: true },
  { name: "Carpenter", icon: Hammer, color: "text-orange-500" },
  { name: "Cleaner", icon: Brush, color: "text-yellow-500" },
  { name: "Wall Painter", icon: PaintRoller, color: "text-pink-500" },
  { name: "AC Repair", icon: AirVent, color: "text-sky-500" },
];

const clientBenefits = [
  "Hire verified & skilled freelancers",
  "Choose from remote or on-site services",
  "Compare proposals, prices & reviews",
  "Secure and hassle-free payments",
  "Use on web or app anytime, anywhere",
  "Upload & share files directly from your PC or laptop on the web",
];

const freelancerBenefits = [
  "Discover relevant job opportunities",
  "Get hired for both online and on-site work",
  "Negotiate directly with clients",
  "Receive secure and on-time payments",
  "Build your profile, ratings and credibility",
  "Use on web or app, and easily share your work files from your PC",
];

function LaptopFrame({ children }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-t-xl border-[5px] border-slate-800 bg-white shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-purple-100 px-2.5 py-1.5">
          <Image src="/bird.png" alt="" width={14} height={14} className="rounded" />
          <span className="text-[9px] font-bold text-purple-700">BirdEarner</span>
        </div>
        <div className="p-2.5">{children}</div>
      </div>
      <div className="mx-auto h-2.5 w-[110%] -ml-[5%] rounded-b-lg bg-gradient-to-b from-slate-300 to-slate-400 shadow-md" />
      <div className="mx-auto h-1.5 w-1/3 rounded-b-lg bg-slate-400/70" />
    </div>
  );
}

function ClientLaptop() {
  return (
    <LaptopFrame>
      <p className="text-[11px] font-bold text-purple-900">Post a Requirement</p>
      <p className="mt-2 text-[9px] font-semibold text-purple-800">Service Category</p>
      <div className="mt-1 flex items-center justify-between rounded border border-purple-200 bg-white px-2 py-1 text-[9px] text-purple-700">
        Graphic Designer
        <ChevronDown className="h-3 w-3" />
      </div>
      <p className="mt-2 text-[9px] font-semibold text-purple-800">Project Details</p>
      <div className="mt-1 rounded border border-purple-200 px-2 py-1.5 text-[9px] text-purple-400">
        Design a poster for my business...
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 rounded border border-dashed border-purple-300 bg-purple-50 py-1.5 text-[9px] text-purple-700">
        <Upload className="h-3 w-3" /> Upload Files from PC
      </div>
      <div className="mt-2 rounded bg-purple-700 py-1.5 text-center text-[9px] font-semibold text-white">
        Post Requirement
      </div>
    </LaptopFrame>
  );
}

function FreelancerLaptop() {
  const jobs = [
    { icon: FileText, title: "Website Banner Design", price: "$120" },
    { icon: Wrench, title: "AC Repair (On-Site)", price: "$50" },
    { icon: CodeXml, title: "Full Stack Developer (Remote)", price: "$800" },
  ];
  return (
    <LaptopFrame>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-purple-900">Find Work</p>
        <Search className="h-3.5 w-3.5 text-purple-500" />
      </div>
      <div className="mt-2 space-y-1.5">
        {jobs.map((job) => {
          const JobIcon = job.icon;
          return (
            <div key={job.title} className="flex items-center gap-1.5 rounded border border-purple-100 px-1.5 py-1">
              <JobIcon className="h-3.5 w-3.5 shrink-0 text-purple-600" />
              <span className="flex-1 truncate text-[8px] text-purple-800">{job.title}</span>
              <span className="text-[8px] font-bold text-purple-900">{job.price}</span>
              <span className="rounded bg-purple-700 px-1.5 py-0.5 text-[7px] font-semibold text-white">Apply</span>
            </div>
          );
        })}
      </div>
    </LaptopFrame>
  );
}

const howItWorksFlows = [
  {
    label: "For Clients",
    sub: "(Hire a Freelancer)",
    icon: Users,
    steps: [
      { n: 1, icon: FileText, title: "Post Requirement", desc: "Tell us what you need (remote or on-site)." },
      { n: 2, icon: Users, title: "Get Applications", desc: "Receive proposals from skilled freelancers." },
      { n: 3, icon: MessageCircle, title: "Negotiate & Confirm", desc: "Discuss details, timeline and price." },
      { n: 4, icon: ShieldCheck, title: "Secure Payment", desc: "Pay safely on the platform (held securely)." },
      { n: 5, icon: Truck, title: "Service Delivery", desc: "Work is completed (online or at your location)." },
      { n: 6, icon: Star, title: "Review & Completion", desc: "Rate your experience and close the task." },
    ],
  },
  {
    label: "For Freelancers",
    sub: "(Find Work & Earn)",
    icon: BriefcaseBusiness,
    steps: [
      { n: 1, icon: Search, title: "Browse Opportunities", desc: "Explore remote & on-site job requests." },
      { n: 2, icon: Send, title: "Send Application", desc: "Show your skills, proposal, and price." },
      { n: 3, icon: MessageCircle, title: "Negotiate & Get Hired", desc: "Discuss and confirm the job with the client." },
      { n: 4, icon: Settings, title: "Complete the Work", desc: "Deliver the agreed service on time." },
      { n: 5, icon: Wallet, title: "Receive Payment", desc: "Get paid securely to your BirdEarner wallet." },
      { n: 6, icon: Star, title: "Build Your Reputation", desc: "Earn ratings, reviews, and more job opportunities." },
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Floating bird animation (from the original homepage): the bird eases
  // toward the cursor and flips to face its direction of travel.
  const cursorPosition = useCursorPosition();
  const [birdPosition, setBirdPosition] = useState({ x: 0, y: 0 });
  const [isMovingRight, setIsMovingRight] = useState(false);

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

  useEffect(() => {
    // Fetch user data from API
    fetch(`${API_BASE_URL}/api/user/me`, {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) {
          setUser(null);
          setError("unauthorized");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setUser(data.data);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth fetch error:", err);
        // Network error - treat as unauthenticated, allow page to render
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-purple-600 mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Floating bird animation — pointer-events-none so it never blocks clicks */}
      <div
        className="fixed pointer-events-none z-40"
        style={{
          transform: `translate(${birdPosition.x}px, ${birdPosition.y}px)`,
          transition: "transform 0.3s ease-out",
          width: "80px",
          height: "80px",
        }}
        aria-hidden="true"
      >
        <div style={{ transform: `scaleX(${isMovingRight ? -1 : 1})` }}>
          <Lottie animationData={birdyAnimation} />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/90 backdrop-blur-md border-b border-purple-100">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/bird.png"
              alt="BirdEarner Logo"
              width={42}
              height={42}
              className="object-contain rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 p-1.5"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
              BirdEarner
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
            <a href="#home" aria-current="page" className="border-b-2 border-purple-700 pb-0.5 text-purple-900 font-semibold">Home</a>
            <a href="#categories" className="flex items-center gap-0.5 border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">Categories <ChevronDown className="h-3 w-3" /></a>
            <a href="#how-it-works" className="border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">How it works</a>
            <a href="#for-clients" className="border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">For clients</a>
            <a href="#for-freelancers" className="border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">For freelancers</a>
            <Link href="/faqs" className="border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">FAQ</Link>
            <a href="#contact" className="border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">Contact</a>
            <Link href="/sign-in" className="border-b-2 border-transparent pb-0.5 text-purple-700 font-medium hover:text-purple-900">Log in</Link>
            <a href="#download" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium px-4 py-2 rounded hover:shadow-lg transition-shadow">
              <Download className="h-3.5 w-3.5" /> Download app
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center py-12 relative overflow-hidden">
        {/* Soft purple gradient glows */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />
        {/* Decorative curved flight paths + birds (subtle, non-interactive) */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-50 640C220 560 380 460 620 480S980 560 1250 440"
            stroke="#8B5CF6"
            strokeOpacity="0.45"
            strokeWidth="2.5"
            strokeDasharray="1 14"
            strokeLinecap="round"
          />
          <path
            d="M-50 220C260 160 440 280 700 240S1020 140 1250 200"
            stroke="#8B5CF6"
            strokeOpacity="0.35"
            strokeWidth="2.5"
            strokeDasharray="1 14"
            strokeLinecap="round"
          />
          <path
            d="M300 560q9-11 18 0q9-11 18 0"
            stroke="#7C3AED"
            strokeOpacity="0.7"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M760 505q7-9 14 0q7-9 14 0"
            stroke="#7C3AED"
            strokeOpacity="0.6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M980 470q6-8 12 0q6-8 12 0"
            stroke="#7C3AED"
            strokeOpacity="0.5"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        {/* Small flock illustration near the heading (desktop only) */}
        <svg
          className="pointer-events-none absolute left-6 top-14 hidden h-24 w-44 lg:block"
          viewBox="0 0 176 96"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 54C17 41 29 41 38 52C47 41 59 41 68 50"
            stroke="#7C3AED"
            strokeOpacity="0.85"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M84 30C91 20 101 20 108 29C115 20 125 20 132 28"
            stroke="#7C3AED"
            strokeOpacity="0.7"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M56 80C62 72 70 72 76 79C82 72 90 72 96 78"
            stroke="#7C3AED"
            strokeOpacity="0.6"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        <div className="container mx-auto px-6 relative z-10 grid items-center gap-10 lg:grid-cols-2">
          {/* Left: badge, headline, description, CTA, trust signals */}
          <div className="text-center lg:text-left -translate-y-12">
            <span className="inline-block rounded-full bg-purple-100/80 text-purple-900 text-xs font-semibold px-4 py-1.5 mb-5 animate-fade-in-up">
              The Freelance Marketplace for Every Need
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-fade-in-up">
              <span className="block text-purple-950">
                Hire Skilled Freelancers for
              </span>
              <span className="block text-purple-600">
                Remote &amp; On-Site Services
              </span>
            </h1>
            <p className="text-purple-700/70 text-sm lg:text-base mt-3 max-w-2xl mx-auto lg:mx-0">
              BirdEarner connects you with verified, skilled freelancers for both online (remote) and on-site services — from digital work like video editing and web development to home services like plumbing, electrical, carpentry, and more.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-6 py-3 rounded animate-pulse-slow hover:shadow-lg btn-bird">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                Book a Freelancer
              </Link>
              <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-semibold px-6 py-3 rounded border border-purple-300 hover:shadow-lg btn-bird">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M19 8v6M22 11h-6" />
                </svg>
                Become a Freelancer
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-left">
                <svg className="w-5 h-5 shrink-0 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span className="text-xs font-semibold text-purple-800 leading-tight">Verified<br />Profiles</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <svg className="w-5 h-5 shrink-0 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <span className="text-xs font-semibold text-purple-800 leading-tight">Secure<br />Payments</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <svg className="w-5 h-5 shrink-0 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
                </svg>
                <span className="text-xs font-semibold text-purple-800 leading-tight">Fast<br />Hiring</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <svg className="w-5 h-5 shrink-0 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                </svg>
                <span className="text-xs font-semibold text-purple-800 leading-tight">Easy File<br />Sharing</span>
              </div>
            </div>
          </div>

          {/* Right: animated freelancer working at a laptop (same as the demo) */}
          <div className="relative mx-auto w-full max-w-[560px] animate-fade-in-up">
            <Lottie
              animationData={manAnimation}
              loop
              autoplay
              className="h-[320px] w-full lg:h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Explore Service Categories */}
      <section id="categories" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-black">
              Explore <span className="text-purple-950 font-extrabold">Service</span> Categories
            </h2>
            <p className="text-purple-600/70 mt-3 text-sm lg:text-base">
              Find the right freelancer for your task — whether it&apos;s an online project or an on-site service at your location.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className={`rounded-xl border p-3 transition-shadow hover:shadow-md ${
                    category.featured
                      ? "flex items-center gap-3 min-h-[110px] bg-purple-100 border-purple-200"
                      : "flex flex-col items-center justify-center text-center gap-2 min-h-[110px] bg-white border-purple-100"
                  }`}
                >
                  <Icon
                    className={`shrink-0 w-8 h-8 ${category.color}`}
                    strokeWidth={2}
                    fill={category.filled ? "currentColor" : "none"}
                  />
                  <div>
                    <p className="text-sm font-bold leading-tight text-black">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-purple-600/70 mt-1 leading-snug">{category.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How BirdEarner Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-black">
              How <span className="text-purple-700">BirdEarner</span> Works
            </h2>
            <p className="text-purple-700/70 mt-3 text-sm lg:text-base">
              A simple and secure process for both clients and freelancers.
            </p>
          </div>
          <div className="space-y-5">
            {howItWorksFlows.map((flow) => {
              const FlowIcon = flow.icon;
              return (
                <div key={flow.label} className="flex flex-col lg:flex-row items-stretch gap-4 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
                  <div className="flex w-full lg:w-48 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-50 p-4 text-center">
                    <FlowIcon className="w-8 h-8 text-purple-600" strokeWidth={1.8} />
                    <p className="mt-2 font-bold text-black">{flow.label}</p>
                    <p className="text-xs text-purple-600/70">{flow.sub}</p>
                  </div>
                  <div className="flex flex-1 flex-col sm:flex-row items-stretch justify-between gap-2">
                    {flow.steps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <Fragment key={`${flow.label}-${step.n}`}>
                          <div className="flex flex-1 flex-col items-center text-center px-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                              {step.n}
                            </span>
                            <StepIcon className="mt-3 h-6 w-6 text-purple-600" strokeWidth={1.8} />
                            <p className="mt-2 text-sm font-bold leading-tight text-black">{step.title}</p>
                            <p className="mt-1 text-xs text-purple-600/70 leading-snug">{step.desc}</p>
                          </div>
                          {index < flow.steps.length - 1 && (
                            <ArrowRight className="mx-auto mt-8 hidden h-4 w-4 shrink-0 self-start text-purple-600 sm:block" />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Clients / For Freelancers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                  <h2 id="for-clients" className="text-2xl lg:text-3xl font-bold text-purple-700">
                    For Clients
                  </h2>
                  <p className="mt-1 font-medium text-purple-900">Get your work done, the easy way.</p>
                  <ul className="mt-4 space-y-2.5">
                    {clientBenefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-purple-900/80">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full sm:w-[260px] shrink-0">
                  <ClientLaptop />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                  <h2 id="for-freelancers" className="text-2xl lg:text-3xl font-bold text-purple-700">
                    For Freelancers
                  </h2>
                  <p className="mt-1 font-medium text-purple-900">Find great work, grow your skills, and earn.</p>
                  <ul className="mt-4 space-y-2.5">
                    {freelancerBenefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-purple-900/80">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full sm:w-[260px] shrink-0">
                  <FreelancerLaptop />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need in One Platform */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-black">
              Everything You Need in <span className="text-purple-700">One Platform</span>
            </h2>
            <p className="mt-3 text-sm lg:text-base text-purple-700/70">
              Powerful features to make hiring, working, and getting paid simple, secure, and reliable.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { icon: CircleCheck, title: "Secure Booking Flow", desc: "A clear and reliable process from request to completion." },
              { icon: MessageCircle, title: "Chat & Negotiation", desc: "Discuss project details, share updates, and agree on the best terms." },
              { icon: ShieldCheck, title: "Payment Protection", desc: "Your payment is held securely until the work is completed." },
              { icon: Star, title: "Ratings & Reviews", desc: "Make informed decisions with genuine feedback from real users." },
              { icon: Wallet, title: "Wallet & Earnings", desc: "Manage payments, track earnings, and withdraw easily." },
              { icon: Upload, title: "File Sharing from PC", desc: "Upload and share files directly from your desktop (laptop/PC) on the web." },
            ].map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border border-purple-100 bg-white p-5 text-center shadow-sm">
                  <FeatureIcon className="mx-auto h-8 w-8 text-purple-600" strokeWidth={1.8} />
                  <h3 className="mt-3 text-sm font-bold text-black">{feature.title}</h3>
                  <p className="mt-2 text-xs text-purple-700/70 leading-snug">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BirdEarner Mobile App */}
      <section id="download" className="py-16 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
            <div className="relative flex justify-center gap-4">
              <div className="h-64 w-36 rounded-3xl border-[6px] border-slate-900 bg-gradient-to-b from-purple-700 to-purple-900 p-3 shadow-xl flex flex-col items-center justify-center text-center">
                <Image src="/bird.png" alt="" width={44} height={44} className="rounded-xl bg-white/10 p-1.5" />
                <p className="mt-3 text-lg font-bold text-white">BirdEarner</p>
                <p className="mt-2 text-[10px] text-purple-100">Hire · Work · Earn<br />(Remote &amp; On-Site)</p>
              </div>
              <div className="h-64 w-36 rounded-3xl border-[6px] border-slate-900 bg-white p-3 shadow-xl mt-8">
                <p className="text-[9px] font-bold text-purple-700">BirdEarner</p>
                <p className="mt-2 text-[8px] font-semibold text-purple-900">Hi, Alex 👋</p>
                <p className="text-[7px] text-purple-600/70">What do you want to do today?</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <div className="rounded bg-purple-50 p-1.5 text-center"><Users className="mx-auto h-3 w-3 text-purple-600" /><p className="text-[7px] text-purple-800">Hire a Freelancer</p></div>
                  <div className="rounded bg-purple-50 p-1.5 text-center"><BriefcaseBusiness className="mx-auto h-3 w-3 text-purple-600" /><p className="text-[7px] text-purple-800">Find Work</p></div>
                </div>
                <p className="mt-2 text-[8px] font-bold text-purple-900">Popular Services</p>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-1 rounded border border-purple-100 px-1 py-0.5 text-[7px] text-purple-800"><SquarePlay className="h-2.5 w-2.5 text-pink-500" /> Video Editor</div>
                  <div className="flex items-center gap-1 rounded border border-purple-100 px-1 py-0.5 text-[7px] text-purple-800"><PenTool className="h-2.5 w-2.5 text-purple-600" /> Marker</div>
                  <div className="flex items-center gap-1 rounded border border-purple-100 px-1 py-0.5 text-[7px] text-purple-800"><AirVent className="h-2.5 w-2.5 text-sky-500" /> AC Repair</div>
                </div>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                <SquarePlay className="h-3 w-3" /> BirdEarner Mobile App
              </span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-black">
                Manage everything <span className="text-purple-700">from the app</span>
              </h2>
              <p className="mt-3 text-sm lg:text-base text-purple-700/70">
                Post requirements, find work, chat, share files, make secure payments, and track progress — all in one place. Available for both clients and freelancers.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#download" className="flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-3 text-white">
                  <Download className="h-5 w-5" />
                  <span className="text-left text-[10px] leading-tight">Download on the<br /><span className="text-sm font-bold">App Store</span></span>
                </a>
                <a href="#download" className="flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-3 text-white">
                  <Send className="h-5 w-5" />
                  <span className="text-left text-[10px] leading-tight">GET IT ON<br /><span className="text-sm font-bold">Google Play</span></span>
                </a>
              </div>
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-purple-600" /><span className="text-xs font-semibold text-purple-900">Book or find work instantly</span></div>
                <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-purple-600" /><span className="text-xs font-semibold text-purple-900">Get real-time updates</span></div>
                <div className="flex items-center gap-2"><Star className="h-5 w-5 text-purple-600" /><span className="text-xs font-semibold text-purple-900">Stay connected anywhere</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by a Growing Community + FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-black">
                Trusted by a <span className="text-purple-700">Growing Community</span>
              </h2>
              <p className="mt-3 text-sm text-purple-700/70">
                Thousands of clients and freelancers already use BirdEarner to get work done, find opportunities, and build long-term success.
              </p>
              <div className="mt-6 grid grid-cols-4 gap-2 divide-x divide-purple-200">
                {[
                  { stat: "10K+", label: "Bookings", icon: CircleCheck },
                  { stat: "5K+", label: "Freelancers", icon: Users },
                  { stat: "50+", label: "Service Categories", icon: Laptop },
                  { stat: "24/7", label: "Fast Support", icon: Headphones },
                ].map((item) => {
                  const StatIcon = item.icon;
                  return (
                    <div key={item.label} className="px-2 text-center">
                      <StatIcon className="mx-auto h-5 w-5 text-purple-600" />
                      <p className="mt-1 text-base font-bold text-purple-800">{item.stat}</p>
                      <p className="text-[10px] text-purple-700/70 leading-tight">{item.label}</p>
                    </div>
                  );
                })}
              </div>
              <h2 className="mt-10 text-3xl lg:text-4xl font-bold text-black">
                Frequently Asked <span className="text-purple-700">Questions</span>
              </h2>
              <p className="mt-2 text-sm text-purple-700/70">Have questions? Here are some quick answers about using BirdEarner.</p>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "Rahul S.", role: "Client", quote: "Hired a video editor on BirdEarner and the experience was smooth and professional. Got high-quality work on time!" },
                  { name: "Priya M.", role: "Freelancer", quote: "I've found multiple great projects here, both remote and on-site. The payment system is secure and very reliable." },
                  { name: "Amit K.", role: "Client", quote: "Booked an AC repair service through BirdEarner. The technician was skilled, on time, and professional. Highly recommend!" },
                ].map((t) => (
                  <div key={t.name} className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">{t.name.charAt(0)}</span>
                      <div><p className="text-xs font-bold text-purple-900">{t.name}</p><p className="text-[10px] text-purple-600/70">{t.role}</p></div>
                    </div>
                    <p className="mt-2 text-xs text-amber-500">★★★★★</p>
                    <p className="mt-2 text-xs text-purple-800/80 leading-snug">&quot;{t.quote}&quot;</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                {[
                  "What is BirdEarner?",
                  "Can I hire freelancers for both remote and on-site services?",
                  "How does the payment system work?",
                  "Can I upload and share files from my PC or laptop?",
                  "Is BirdEarner free to use?",
                ].map((q) => (
                  <details key={q} className="group rounded-lg border border-purple-100 bg-white px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-purple-900">
                      {q}
                      <ChevronDown className="h-4 w-4 text-purple-600 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-xs text-purple-700/70">BirdEarner connects clients and freelancers for remote and on-site work with secure payments and easy collaboration.</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 px-6">
        <div className="container mx-auto rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-12 text-center text-white shadow-xl">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-purple-100">
            Join BirdEarner today — hire skilled freelancers, find great work, and get things done, whether remotely or on-site.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-purple-800 shadow hover:shadow-lg">
              <Search className="h-4 w-4" /> Book a Freelancer
            </Link>
            <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10">
              <Users className="h-4 w-4" /> Become a Freelancer
            </Link>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#150527] text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/bird.png" alt="BirdEarner Logo" width={32} height={32} className="object-contain" />
                <span className="text-2xl font-bold">BirdEarner</span>
              </div>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                The marketplace to hire, work, and earn for remote and on-site services.
              </p>
              <p className="mt-4 text-sm text-purple-200/50">
                © 2025 BirdEarner. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-white">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-purple-200/70">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Categories</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="/faqs" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-white">For Users</h3>
              <ul className="space-y-2.5 text-sm text-purple-200/70">
                <li><a href="#for-clients" className="hover:text-white transition-colors">For Clients</a></li>
                <li><a href="#for-freelancers" className="hover:text-white transition-colors">For Freelancers</a></li>
                <li><a href="#download" className="hover:text-white transition-colors">Download App</a></li>
                <li><a href="/sign-in" className="hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-white">Policies</h3>
              <ul className="space-y-2.5 text-sm text-purple-200/70">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Payment Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Cancellation &amp; Refund</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Community Guidelines</a></li>
              </ul>
            </div>

            <div className="lg:border-l lg:border-purple-800/60 lg:pl-8">
              <h3 className="mb-4 text-base font-bold text-white">Contact Us</h3>
              <ul className="space-y-2.5 text-sm text-purple-200/70">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-purple-300" /> support@birdearner.com</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-purple-300" /> +1 (800) 123-4567</li>
                <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-purple-300" /> Global (Online &amp; On-Site Services)</li>
              </ul>
              <div className="mt-4 flex gap-3">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-purple-200/70 hover:text-white"><Facebook className="h-4 w-4" /></a>
                <a href="https://www.instagram.com/thebirdearner" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-purple-200/70 hover:text-white"><Instagram className="h-4 w-4" /></a>
                <a href="https://x.com/birdearner" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-purple-200/70 hover:text-white"><Twitter className="h-4 w-4" /></a>
                <a href="https://www.youtube.com/@birdearner" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-purple-200/70 hover:text-white"><Youtube className="h-4 w-4" /></a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-purple-200/70 hover:text-white"><Linkedin className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}