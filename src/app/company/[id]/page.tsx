import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60; // Revalidate at most every minute

export default async function CompanyProfilePage({ params }: { params: { id: string } }) {
  // Fetch company profile using admin client to bypass RLS if needed, or normal client
  // Since company info should be public, we can use admin to ensure we get the data
  // But wait, profiles are public anyway, so we could just use a normal fetch if we had a non-auth server client.
  // We'll use supabaseAdmin for simplicity.
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('company_name, company_logo_url, company_presentation, company_website, role, is_premium, company_is_public')
    .eq('id', params.id)
    .single();

  if (error || !profile || profile.role !== 'employer' || !profile.company_is_public) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center">
          {profile.company_logo_url ? (
            <img 
              src={profile.company_logo_url} 
              alt={`${profile.company_name} logo`} 
              className="h-32 w-auto mx-auto object-contain mb-8 rounded-lg shadow-sm border border-gray-100 p-2"
            />
          ) : (
            <div className="h-32 w-32 mx-auto bg-gray-100 rounded-lg mb-8 flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 text-sm">Ingen logga</span>
            </div>
          )}
          
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-serif">
            {profile.company_name || "Okänt Företag"}
          </h1>
          
          {profile.company_website && (
            <div className="mt-4">
              <a 
                href={profile.company_website.startsWith('http') ? profile.company_website : `https://${profile.company_website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 font-medium inline-flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Besök Webbplats
              </a>
            </div>
          )}

          {profile.is_premium && (
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#f0a020]/10 px-3 py-1 text-sm font-semibold text-[#d48a10]">
              <span>⭐</span>
              Verifierad Premium-Arbetsgivare
            </div>
          )}
        </div>

        {/* Presentation Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            Om Oss
          </h2>
          {profile.company_presentation ? (
            <div className="prose prose-indigo max-w-none text-gray-600 whitespace-pre-line text-lg leading-relaxed">
              {profile.company_presentation}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Detta företag har inte lagt till någon presentation ännu.
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link href="/" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            &larr; Tillbaka till startsidan
          </Link>
        </div>
        
      </div>
    </div>
  );
}
