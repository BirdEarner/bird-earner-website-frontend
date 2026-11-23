"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/services/api";
import { useRouter } from "next/navigation";
import birdyAnimation from "@/public/animations/birdy.json";
import { useCursorPosition } from "@/hooks/useCursorPosition";

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <a href="#contact" className="text-purple-600 hover:text-purple-700">Contact</a>
            <a href="#services" className="text-purple-600 hover:text-purple-700">Services</a>
            <Link href="/sign-in" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded hover:shadow-lg">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center py-12 relative overflow-hidden">
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
          {/* Left: headline, description, CTA */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent animate-fade-in-up">
              Be BirdEARNER, Become Bread Earner!
            </h1>
            <p className="text-purple-700/70 text-lg mt-4 max-w-2xl mx-auto lg:mx-0">
              BirdEarner connects freelancers with local businesses for both remote and physical job opportunities. Hire talent or offer your skills seamlessly.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/sign-in" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded animate-pulse-slow hover:shadow-lg btn-bird">
                Get Started
              </Link>
            </div>
          </div>

          {/* Right: illustration of a freelancer working at a laptop */}
          <div className="relative mx-auto w-full max-w-[560px] animate-fade-in-up">
            <Image
              src="/hero-freelancer.png"
              alt="Freelancer working at a laptop"
              width={620}
              height={345}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-8">
            Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl bg-purple-50 p-6 hover:border-purple-200/80 transition-colors feather-bg feather-bg-hover cursor-hover animate-fade-in-up">
              <h3 className="text-xl font-bold text-purple-900 mb-2">Remote Jobs</h3>
              <p className="text-purple-600/70">Find remote freelance opportunities from around the world</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-6 hover:border-purple-200/80 transition-colors feather-bg feather-bg-hover cursor-hover animate-fade-in-up">
              <h3 className="text-xl font-bold text-purple-900 mb-2">On-Site Jobs</h3>
              <p className="text-purple-600/70">Find local physical job opportunities</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-6 hover:border-purple-200/80 transition-colors feather-bg feather-bg-hover cursor-hover animate-fade-in-up">
              <h3 className="text-xl font-bold text-purple-900 mb-2">Milestone Payments</h3>
              <p className="text-purple-600/70">Secure milestone-based payments with escrow protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                  <path d="M17 9l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-900">Post Job</h3>
              <p className="text-purple-600/70 text-sm">Clients create job posts with requirements, budget, and timeline</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                  <path d="M17 9l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-900">Review Proposals</h3>
              <p className="text-purple-600/70 text-sm">Freelancers submit proposals. Clients review skills and ratings.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                  <path d="M17 9l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-900">Milestone & Payment</h3>
              <p className="text-purple-600/70 text-sm">Set milestones and fund securely via BirdEarner Wallet.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                  <path d="M17 9l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-900">Delivery & Review</h3>
              <p className="text-purple-600/70 text-sm">Freelancer delivers work. Client reviews and leaves feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-6">
                For Clients
              </h2>
              <ul className="space-y-4">
                <li className="text-purple-700/70">
                  Secure & Hassle-Free Payments — BirdEarner Wallet ensures instant, secure payments upon milestone completion with no waiting periods or hidden fees.
                </li>
                <li className="text-purple-700/70">
                  Verified Freelancers — Every freelancer is verified with profile validation, skill assessments, and rating history. Hire with confidence.
                </li>
                <li className="text-purple-700/70">
                  Milestone Protection — Funds are held in escrow until work is delivered and approved. No risk of non-payment or scope creep.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-6">
                For Freelancers
              </h2>
              <ul className="space-y-4">
                <li className="text-purple-700/70">
                  Earn Rewards & Level Up — Earn exclusive rewards and level up with every successful job. The more you work, the more you earn - bonuses, badges, and recognition.
                </li>
                <li className="text-purple-700/70">
                  Global Client Base — Connect with clients worldwide. No geographical barriers. Work with international clients while being based anywhere.
                </li>
                <li className="text-purple-700/70">
                  Flexible Work Types — Choose remote freelance projects or on-site jobs. Mix and match based on your availability and preferences.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-purple-50 to-white cta-feather feather-pattern relative overflow-hidden">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-4 cta-bird">
            Ready to Get Started?
          </h2>
          <p className="text-purple-700/70 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers and clients who trust BirdEarner to connect, collaborate, and earn seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="border-purple-600 text-purple-600 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </section>

      {
  /* Testimonials Section */
  <section className="py-24 px-6 sm:px-8 lg:px-16 bg-gradient-to-b from-purple-50 to-white feather-pattern relative overflow-hidden">
    <div className="container mx-auto text-center">
      <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-8">
        What Our Users Say
      </h2>
      <p className="text-purple-700/70 text-center">
        Hear from professionals who have transformed their work experience with BirdEarner
      </p>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 border border-purple-200/50 backdrop-blur-sm">
          <p className="text-purple-700/70 quotes">&quot;BirdEarner has completely changed the way I find clients.&quot;</p>
          <p className="text-purple-900 font-medium">Sarah Johnson</p>
          <p className="text-purple-600/60">Freelance Graphic Designer</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-purple-200/50 backdrop-blur-sm">
          <p className="text-purple-700/70 quotes">&quot;I love how easy it is to connect with clients worldwide.&quot;</p>
          <p className="text-purple-900 font-medium">Michael Chen</p>
          <p className="text-purple-600/60">Software Developer</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-purple-200/50 backdrop-blur-sm">
          <p className="text-purple-700/70 quotes">&quot;The multilingual job descriptions are a game changer!&quot;</p>
          <p className="text-purple-900 font-medium">Emily Rodriguez</p>
          <p className="text-purple-600/60">Content Writer</p>
        </div>
      </div>
    </div>
  </section>
/* Footer */}
      <footer className="bg-gradient-to-b from-purple-900 to-purple-950 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/bird.png" alt="BirdEarner Logo" width={32} height={32} className="object-contain" />
                <span className="text-2xl font-bold">BirdEarner</span>
              </div>
              <p className="text-purple-200/80 leading-relaxed">
                Be BirdEARNER, Become Bread Earner!
              </p>
              <div className="flex gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 text-purple-200/70 transition-colors bird-icon-hover animate-fade-in">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 84597 23322</span>
                </span>
                <a href="https://www.instagram.com/thebirdearner" target="_blank" rel="noopener noreferrer" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Instagram</a>
                <a href="https://x.com/birdearner" target="_blank" rel="noopener noreferrer" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">X</a>
                <a href="https://www.youtube.com/@birdearner" target="_blank" rel="noopener noreferrer" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">YouTube</a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-purple-200 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Home</a></li>
                <li><a href="#services" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Services</a></li>
                <li><a href="#how-it-works" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">How It Works</a></li>
                <li><a href="#contact" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-purple-200 mb-4">For Users</h3>
              <ul className="space-y-3">
                <li><a href="/sign-in" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Sign In</a></li>
                <li><a href="/sign-up" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-purple-200 mb-4">Policies</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Privacy Policy</a></li>
                <li><a href="/terms" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-purple-200 mb-4">Stay Updated</h3>
              <p className="text-purple-200/70">Subscribe to our newsletter for the latest updates and features.</p>
              <div className="flex gap-2 mt-4">
                <input type="email" placeholder="Enter your email" className="flex-1 px-3 py-2 rounded-lg bg-purple-800/50 border border-purple-700 text-white placeholder:text-purple-300/50" />
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium transition-all duration-300">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-purple-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-purple-200/70">
              © {new Date().getFullYear()} BirdEarner. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Privacy Policy</a>
              <a href="/terms" className="text-purple-200/70 hover:text-white transition-colors bird-icon-hover cursor-pointer animate-fade-in">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}