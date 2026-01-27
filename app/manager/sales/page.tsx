import React from "react";
import SalesForm from "./SalesForm";

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1B3A57] mb-6 text-center">
          Add New Product
        </h1>

        <div className="bg-white shadow-md rounded-xl p-6">
          <SalesForm />
        </div>
      </div>
    </div>
  );
}
