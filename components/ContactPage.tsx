'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center px-6 pt-32 pb-16">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <p className="text-gray-400 mb-8 text-center">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-[#0F0F1A] border border-[#1F2937] rounded-xl focus:outline-none focus:border-[#b50000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-[#0F0F1A] border border-[#1F2937] rounded-xl focus:outline-none focus:border-[#b50000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={5}
              className="w-full px-4 py-3 bg-[#0F0F1A] border border-[#1F2937] rounded-xl focus:outline-none focus:border-[#b50000]"
              required
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-[#b50000] text-white font-bold rounded-xl hover:bg-[#8b0000] transition-colors w-full md:w-auto"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}