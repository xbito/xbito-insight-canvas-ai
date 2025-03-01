'use client';

import Link from 'next/link';
import { BarChart, MessageSquare, PieChart } from 'lucide-react';
import { useAppContext } from '../lib/ContextProvider';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    industry,
    setIndustry,
    companyName,
    setCompanyName,
    country,
    setCountry
  } = useAppContext();

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Data Insights</h1>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <Link href="/" className="flex items-center px-4 py-3 mb-2 text-gray-700 rounded-lg hover:bg-gray-100">
            <PieChart className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/chat" className="flex items-center px-4 py-3 mb-2 text-gray-700 rounded-lg hover:bg-gray-100">
            <MessageSquare className="w-5 h-5 mr-3" />
            <span>Chat Analysis</span>
          </Link>
        </nav>

        {/* Context Selectors */}
        <div className="mt-auto p-4 border-t border-gray-200">
          {/* Country Selector */}
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="countrySelect">Country</label>
          <select
            id="countrySelect"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mb-4 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="United States">United States</option>
            <option value="Peru">Peru</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>

          {/* Industry Selector */}
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="industrySelect">Industry</label>
          <select
            id="industrySelect"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mb-4 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select Industry</option>
            <option value="automobiles">Automobiles</option>
            <option value="airlines">Airlines</option>
            <option value="beverage">Beverage</option>
            <option value="retail">Retail</option>
            <option value="banks">Banks</option>
            <option value="phones">Phones</option>
            <option value="food">Food</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="apparel">Apparel</option>
            <option value="electronics">Electronics</option>
            <option value="media">Media</option>
            <option value="social-media-apps">Social Media apps</option>
            <option value="health-pharma">Health/Pharma</option>
            <option value="sports">Sports</option>
            <option value="appliances">Appliances</option>
          </select>

          {/* Company Name Input */}
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Enter company name"
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}