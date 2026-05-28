"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EmployerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [companyName, setCompanyName] = useState("");
  const [companyPresentation, setCompanyPresentation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    
    setUserId(session.user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      if (data.role !== 'employer') {
        router.push("/seeker/dashboard");
        return;
      }
      setCompanyName(data.company_name || "");
      setCompanyPresentation(data.company_presentation || "");
      setCompanyWebsite(data.company_website || "");
      setCompanyLogoUrl(data.company_logo_url || "");
      setIsPublic(data.company_is_public ?? true);
    }
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setSaving(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      
      // Test connection first
      const { data: listTest, error: listError } = await supabase.storage.from('company-logos').list(userId, { limit: 1 });
      console.log('Company logos list test:', { listTest, listError });
      
      if (listError && listError.message?.includes('not found')) {
        throw new Error('Company-logos bucket hittades inte i Supabase. Kontrollera att den är skapad.');
      }
      
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      console.log('Logo upload result:', uploadError);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Kunde inte ladda upp logotypen');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      setCompanyLogoUrl(publicUrl);
    } catch (error: any) {
      console.error('Logo upload error:', error);
      alert(`Kunde inte ladda upp logotypen. ${error?.message || ''}\n\nKontrollera att 'company-logos' bucket finns i Supabase.`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: companyName,
        company_presentation: companyPresentation,
        company_website: companyWebsite,
        company_logo_url: companyLogoUrl,
        company_is_public: isPublic
      })
      .eq('id', userId);

    setSaving(false);
    if (error) {
      alert(`Error saving profile: ${error.message}`);
    } else {
      alert("Din företagsprofil har sparats!");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Företagsprofil
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Här kan du presentera ditt företag. Denna information syns på startsidan och i er publika företagsprofil.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => window.open(`/company/${userId}`, '_blank')}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Visa Publik Profil
          </button>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg border border-gray-200">
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-gray-400 text-xs text-center p-2">Ingen<br/>Logotyp</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                Företagslogotyp
              </label>
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                {saving ? "Laddar upp..." : "Välj Bild"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Företagsnamn
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Webbplats (URL)
              </label>
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="https://exempel.se"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Företagspresentation
              </label>
              <div className="mt-2">
                <textarea
                  rows={6}
                  value={companyPresentation}
                  onChange={(e) => setCompanyPresentation(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Berätta vilka ni är och varför det är fantastiskt att jobba hos er..."
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Skriv en inbjudande text som väcker intresse hos jobbsökande.
              </p>
            </div>

            <div className="col-span-full">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label className="font-medium text-gray-900">Visa på startsidan</label>
                  <p className="text-gray-500">Tillåt att er logga och namn exponeras offentligt på startsidan som "Företag på plattformen".</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {saving ? 'Sparar...' : 'Spara Företagsprofil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
