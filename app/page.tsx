"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Sofa,
  Briefcase,
  Truck,
  ShieldCheck,
  Ruler,
  Star,
  Home,
  Package,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle,
  Award,
  Sparkles,
  Clock,
  Users,
  Heart
} from "lucide-react"

export default function HomePage() {
  const [activeImage, setActiveImage] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const heroImages = [
    "/homeImage/sofa1.jpg",
    "/homeImage/diingitabl2.jpg",
    "/homeImage/tvstand.jpg",
    "/homeImage/cabinat.jpg",
  ]

  const categories = [
    { title: "Sofas", img: "/homeImage/sofa1.jpg", icon: Sofa, count: "45+ Designs" },
    { title: "Office Chairs", img: "/homeImage/standbox.jpg", icon: Briefcase, count: "32+ Models" },
    { title: "Tables", img: "/homeImage/diingitabl2.jpg", icon: Ruler, count: "28+ Styles" },
    { title: "Beds", img: "/homeImage/cabinat.jpg", icon: Heart, count: "36+ Options" },
    { title: "Storage", img: "/homeImage/tvstand.jpg", icon: Package, count: "50+ Solutions" },
    { title: "Custom", img: "/homeImage/cabinat.jpg", icon: Sparkles, count: "100% Tailored" },
  ]

  const features = [
    { label: "Premium Materials", icon: Star, description: "Sustainably sourced wood & fabrics" },
    { label: "Custom Designs", icon: Ruler, description: "Tailored to your exact needs" },
    { label: "On-Time Delivery", icon: Clock, description: "Guaranteed delivery dates" },
    { label: "After-Sales Support", icon: ShieldCheck, description: "5-year warranty included" },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Interior Designer",
      text: "The quality and craftsmanship exceeded all expectations. Highly recommended!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Office Manager",
      text: "Transformed our workspace completely. The furniture is both beautiful and functional.",
      rating: 5
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F8F9FA] to-white text-[#333333]">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 123, 127, 0.15);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #007B7F 0%, #1B3A57 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* ================= Header ================= */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg py-3' 
          : 'bg-transparent py-4'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#007B7F] to-[#1B3A57] flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="text-xl font-bold gradient-text">
              A.W.G Furniture
            </div>
          </div>

          <nav className="hidden gap-8 md:flex text-sm font-medium">
            {[
              { label: "Home", icon: Home },
              { label: "Products", icon: Package },
              { label: "Office", icon: Briefcase },
              { label: "Contact", icon: Mail },
            ].map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="#"
                className="group flex items-center gap-2 text-[#1B3A57] hover:text-[#007B7F] transition-all duration-300"
              >
                <Icon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {label}
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#007B7F] to-[#1B3A57] transition-all duration-300"></div>
              </Link>
            ))}
          </nav>

          <Link
            href="/contact"
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#007B7F] to-[#1B3A57] px-6 py-2 text-white hover:shadow-xl transition-all duration-300 hover-lift"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get a Quote
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A57] to-[#007B7F] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </header>

      {/* ================= Hero ================= */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        {/* Background Images */}
        {heroImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img}
              alt="Furniture showcase"
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
        ))}

        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#007B7F]/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[#1B3A57]/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '1s'}}></div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-effect px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">Premium Furniture Since 2010</span>
          </div>

          <h1 className="mb-6 max-w-5xl text-4xl font-bold sm:text-6xl lg:text-7xl animate-fade-in">
            <span className="block">Quality Furniture</span>
            <span className="block bg-gradient-to-r from-[#FFD166] via-[#06D6A0] to-[#007B7F] bg-clip-text text-transparent animate-gradient">
              For Home & Office
            </span>
          </h1>
          
          <p className="mb-8 max-w-2xl text-lg text-slate-200 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Crafted with precision, designed for comfort. Transform your spaces with our premium collection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Link
              href="/products"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#FFD166] to-[#FF9E6D] px-8 py-3 text-white font-semibold hover:shadow-xl transition-all duration-300 hover-lift"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Products
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9E6D] to-[#FFD166] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              href="/contact"
              className="group rounded-full border-2 border-white bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white hover:text-[#1B3A57] transition-all duration-300 hover-lift"
            >
              <span className="flex items-center gap-2">
                Book Consultation
                <Award className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="animate-bounce w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 right-8 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeImage 
                  ? 'w-8 bg-white' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ================= Categories ================= */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-4xl font-bold text-[#1B3A57]">
              Explore Our <span className="gradient-text">Collections</span>
            </h2>
            <p className="text-[#6C757D] max-w-2xl mx-auto text-lg">
              Discover furniture that combines elegance, comfort, and functionality
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ title, img, icon: Icon, count }, index) => (
              <Link
                key={title}
                href={`/products?category=${title.toLowerCase()}`}
                className="group animate-fade-in hover-lift block"
                style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards'}}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                  
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={img}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Category Icon */}
                    <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-[#007B7F]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#1B3A57]">{title}</h3>
                      <ChevronRight className="h-4 w-4 text-[#007B7F] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <p className="text-sm text-[#007B7F] font-medium">{count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Why Us ================= */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#007B7F] rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#1B3A57] rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-4xl font-bold text-[#1B3A57]">
              Why <span className="gradient-text">Choose Us</span>
            </h2>
            <p className="text-[#6C757D] max-w-2xl mx-auto text-lg">
              We're committed to excellence in every piece we create
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ label, icon: Icon, description }, index) => (
              <div
                key={label}
                className="group animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8F9FA] border border-[#F1F3F5] hover-lift"
                style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards'}}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#007B7F] to-[#1B3A57] group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1B3A57]">{label}</h3>
                </div>
                <p className="text-[#6C757D] text-sm">{description}</p>
                <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#007B7F] to-[#1B3A57] transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Testimonials ================= */}
      <section className="py-20 bg-gradient-to-br from-[#1B3A57] to-[#007B7F]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-4xl font-bold text-white">
              What Our <span className="text-[#FFD166]">Clients Say</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Trusted by homeowners and businesses nationwide
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map(({ name, role, text, rating }, index) => (
              <div
                key={name}
                className="group animate-fade-in glass-effect rounded-2xl p-8 hover-lift"
                style={{animationDelay: `${index * 0.2}s`, animationFillMode: 'backwards'}}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD166] to-[#FF9E6D] text-white font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{name}</h4>
                    <p className="text-white/70">{role}</p>
                  </div>
                </div>
                <p className="text-white/90 mb-4 italic text-lg leading-relaxed">"{text}"</p>
                <div className="flex text-[#FFD166]">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Happy Clients", icon: Users },
              { value: "10+", label: "Years Experience", icon: Award },
              { value: "24/7", label: "Support", icon: ShieldCheck },
              { value: "98%", label: "Satisfaction", icon: Heart },
            ].map(({ value, label, icon: Icon }, index) => (
              <div key={label} className="animate-fade-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-white/70" />
                  <div className="text-3xl font-bold text-white">{value}</div>
                </div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD166]/10 via-[#FF9E6D]/10 to-[#FF6B6B]/10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#007B7F]/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1B3A57]/5 rounded-full translate-x-1/3 translate-y-1/3 animate-float" style={{animationDelay: '2s'}}></div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#007B7F] to-[#1B3A57] px-4 py-2 text-white mb-6">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Limited Time Offer</span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-[#1B3A57]">
            Ready to Transform Your Space?
          </h2>
          <p className="mb-8 text-lg text-[#6C757D] max-w-2xl mx-auto">
            Get a personalized quote for your dream furniture. Our experts are ready to help you create the perfect space.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#007B7F] to-[#1B3A57] px-8 py-3 text-white font-semibold hover:shadow-2xl transition-all duration-300 hover-lift"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Your Project
                <ChevronRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A57] to-[#007B7F] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="tel:+1234567890"
              className="group rounded-full border-2 border-[#007B7F] px-8 py-3 font-semibold text-[#007B7F] hover:bg-[#007B7F] hover:text-white transition-all duration-300 hover-lift flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              Call Now: (123) 456-7890
            </Link>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="bg-gradient-to-b from-[#1B3A57] to-[#0A1E2F] text-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007B7F] to-[#FFD166] flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="text-xl font-bold text-white">A.W.G Furniture</div>
              </div>
              <p className="text-white/70">Crafting beautiful spaces since 2010</p>
            </div>

            {['Quick Links', 'Services', 'Contact Info'].map((title, idx) => (
              <div key={title}>
                <h3 className="font-bold text-white mb-4">{title}</h3>
                <ul className="space-y-2">
                  {['Home', 'Products', 'Office Solutions', 'Contact Us'].map((link, linkIdx) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <div className="text-white/50 text-sm mb-4 md:mb-0">
              © 2024 A.W.G Furniture. All rights reserved.
            </div>

            <div className="flex gap-4">
              {['Instagram', 'Facebook', 'Twitter', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-white/70 hover:text-white transition-colors duration-300 hover:scale-110"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}