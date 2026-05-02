"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Book, Shield, Award, Users, ArrowRight, Sparkles, Zap, Menu, X } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Nav ── */
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      })

      /* ── Hero text stagger ── */
      const heroWords = heroRef.current?.querySelectorAll(".hero-word")
      if (heroWords) {
        gsap.from(heroWords, {
          y: 120,
          opacity: 0,
          rotateX: -90,
          stagger: 0.08,
          duration: 1.2,
          ease: "power4.out",
          delay: 0.5,
        })
      }

      /* ── Hero subtitle & CTA ── */
      gsap.from(".hero-subtitle", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 1.2,
      })

      gsap.from(".hero-cta", {
        y: 30,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 1.5,
      })

      /* ── Floating orbs ── */
      gsap.to(".orb-1", {
        x: 60,
        y: 40,
        duration: 8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
      gsap.to(".orb-2", {
        x: -40,
        y: -30,
        duration: 10,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })
      gsap.to(".orb-3", {
        x: 50,
        y: -50,
        duration: 12,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      })

      /* ── Badge shimmer ── */
      gsap.from(".hero-badge", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(2)",
        delay: 0.3,
      })

      /* ── Features cards ── */
      const featureCards = featuresRef.current?.querySelectorAll(".feature-card")
      if (featureCards) {
        gsap.from(featureCards, {
          y: 80,
          opacity: 0,
          scale: 0.95,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 75%",
          },
        })
      }

      /* ── Feature section heading ── */
      gsap.from(".features-heading", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-heading",
          start: "top 85%",
        },
      })

      /* ── Steps ── */
      const stepItems = stepsRef.current?.querySelectorAll(".step-item")
      if (stepItems) {
        stepItems.forEach((item, i) => {
          gsap.from(item, {
            x: i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
            },
          })
        })
      }

      /* ── Steps heading ── */
      gsap.from(".steps-heading", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steps-heading",
          start: "top 85%",
        },
      })

      /* ── CTA ── */
      gsap.from(ctaRef.current, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
      })

    })

    return () => ctx.revert()
  }, [])

  const features = [
    {
      icon: Shield,
      title: "Multi-Level Verification",
      description: "Three-tier skill verification: assessments, peer review, and professional interviews for maximum credibility.",
    },
    {
      icon: Award,
      title: "Digital Skill Portfolio",
      description: "Showcase your verified skills with a professional portfolio that employers and peers can trust.",
    },
    {
      icon: Users,
      title: "Peer-to-Peer Review",
      description: "Get your skills validated by fellow professionals through structured peer evaluation.",
    },
  ]

  const steps = [
    {
      num: "01",
      title: "Create Your Account",
      desc: "Sign up in seconds and start building your verified skill profile.",
    },
    {
      num: "02",
      title: "Add & Verify Skills",
      desc: "Choose skills to verify and complete multi-level assessments.",
    },
    {
      num: "03",
      title: "Get Peer Reviewed",
      desc: "Invite peers and professionals to validate your expertise.",
    },
    {
      num: "04",
      title: "Showcase & Share",
      desc: "Share your verified portfolio with employers and collaborators.",
    },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* ── Floating Gradient Orbs ── */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />

      {/* ── Navbar ── */}
      <nav
        ref={navRef}
        className="landing-nav fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Book className="h-5 w-5" />
            <span>Skill Collection</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-accent sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 px-4 pb-4 pt-2 sm:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[100svh] items-center justify-center px-4 sm:px-6 pt-16">
        <div ref={heroRef} className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>Web Programming II — Skill Verification Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl" style={{ perspective: "1000px" }}>
            <span className="hero-word inline-block">Verify&nbsp;</span>
            <span className="hero-word inline-block">Your&nbsp;</span>
            <span className="hero-word inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">Skills.&nbsp;</span>
            <br className="hidden sm:block" />
            <span className="hero-word inline-block">Build&nbsp;</span>
            <span className="hero-word inline-block">Your&nbsp;</span>
            <span className="hero-word inline-block bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Trust.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
            The professional skill verification platform that lets you prove your
            expertise through assessments, peer reviews, and professional interviews.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="cta-glow group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:shadow-2xl"
            >
              Start Free Today
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold transition-all hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="relative px-4 sm:px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="features-heading mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                prove your worth
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              A comprehensive platform designed to validate, showcase, and grow your
              professional skills.
            </p>
          </div>

          <div ref={featuresRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card group rounded-2xl p-8"
              >
                <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative px-4 sm:px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="steps-heading mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              How It Works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Four simple steps to{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                verified excellence
              </span>
            </h2>
          </div>

          <div ref={stepsRef} className="relative">
            {/* Vertical line */}
            <div className="step-line absolute left-6 top-0 bottom-0 hidden sm:block md:left-1/2 md:-translate-x-px" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`step-item relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      i % 2 === 0
                        ? "md:text-right md:pr-12"
                        : "md:text-left md:pl-12"
                    }`}
                  >
                    <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Step {step.num}
                    </span>
                    <h3 className="text-xl font-bold sm:text-2xl">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.desc}</p>
                  </div>
                  {/* Dot */}
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg">
                    {step.num}
                  </div>
                  {/* Spacer for alignment */}
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative px-4 sm:px-6 py-24 lg:py-32">
        <div
          ref={ctaRef}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-10 text-center text-white sm:p-16"
        >
          <Zap className="mx-auto mb-6 h-10 w-10 opacity-80" />
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to prove your skills?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Start building your verified skill portfolio today and
            showcase your expertise to the world.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-violet-700 transition-all hover:bg-white/90 hover:shadow-2xl"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer px-4 sm:px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Book className="h-5 w-5" />
            <span>Skill Collection</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Skill Collection. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/signin" className="transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
