"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export function CompanyBanner() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, company_logo_url')
        .eq('role', 'employer')
        .eq('company_is_public', true)
        .not('company_name', 'is', null)
        .limit(10);
        
      if (!error && data) {
        // Filter out those with no logo or name just to be safe
        const validCompanies = data.filter(c => c.company_name);
        setCompanies(validCompanies);
      }
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  if (loading || companies.length === 0) {
    return null; // Don't show anything if loading or no companies
  }

  return (
    <section className="py-12 border-t border-b border-[#e0eaf4] bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-[11px] font-medium tracking-[1px] uppercase text-[#9ca3af] mb-8">
          Företag som letar talang på plattformen
        </h2>
        
        {/* Simple grid for companies */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company) => (
            <Link 
              key={company.id} 
              href={`/company/${company.id}`}
              className="group flex flex-col items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
            >
              {company.company_logo_url ? (
                <img 
                  src={company.company_logo_url} 
                  alt={company.company_name} 
                  className="h-12 w-auto object-contain max-w-[140px]"
                />
              ) : (
                <div className="text-xl font-serif font-bold text-gray-800">
                  {company.company_name}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
