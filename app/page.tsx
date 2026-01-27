import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#333333]">
      {/* ================= Header ================= */}
      <header className="bg-white border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold text-[#1B3A57]">
            A.W.G Furniture
          </div>

          <nav className="hidden gap-6 md:flex">
            <Link href="#" className="hover:text-[#007B7F]">Home</Link>
            <Link href="#" className="hover:text-[#007B7F]">Products</Link>
            <Link href="#" className="hover:text-[#007B7F]">Projects</Link>
            <Link href="#" className="hover:text-[#007B7F]">Contact</Link>
          </nav>

          <Link
            href="/contact"
            className="rounded-md bg-[#007B7F] px-4 py-2 text-white hover:bg-[#00686C]"
          >
            Get a Quote
          </Link>
        </div>
      </header>

      {/* ================= Hero ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[#1B3A57]">
          Quality Furniture for Home & Office
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-[#6C757D]">
          Designed, manufactured, and delivered with precision and care.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/products"
            className="rounded-md bg-[#007B7F] px-6 py-3 text-white hover:bg-[#00686C]"
          >
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-[#007B7F] px-6 py-3 text-[#007B7F] hover:bg-[#007B7F] hover:text-white"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* ================= Categories ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-[#1B3A57]">
          Categories
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {["Sofas", "Office Chairs", "Tables", "Beds", "Storage", "Custom"].map(
            (item) => (
              <div
                key={item}
                className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-4 h-32 rounded-md bg-slate-200" />
                <h3 className="font-medium">{item}</h3>
              </div>
            )
          )}
        </div>
      </section>

      {/* ================= Why Us ================= */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 text-center text-2xl font-semibold text-[#1B3A57]">
            Why Choose Us
          </h2>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              "Premium Materials",
              "Custom Designs",
              "On-Time Delivery",
              "After-Sales Support",
            ].map((item) => (
              <div key={item} className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#007B7F]/10" />
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-[#1B3A57] py-16 text-center text-white">
        <h2 className="mb-4 text-2xl font-semibold">
          Need Custom Furniture?
        </h2>
        <p className="mb-6 text-slate-200">
          Contact us today for a free consultation.
        </p>
        <Link
          href="/contact"
          className="rounded-md bg-[#007B7F] px-6 py-3 hover:bg-[#00686C]"
        >
          Get in Touch
        </Link>
      </section>

    
    </div>
  )
}
