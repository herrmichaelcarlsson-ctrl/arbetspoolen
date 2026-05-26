"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      if (!data.user)
        throw new Error("Inloggningen misslyckades. Vänligen försök igen.");

      setSuccessMessage("Välkommen tillbaka! Omdirigerar...");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const { data: contact } = await supabase
        .from("profile_contact_details")
        .select("*")
        .eq("profile_id", data.user.id)
        .single();

      const needsOnboarding =
        !profile ||
        (profile.role === "job_seeker" &&
          (!profile.trade || !profile.city || !contact?.full_name)) ||
        (profile.role === "employer" && !contact?.full_name);

      setTimeout(() => {
        if (needsOnboarding) router.push("/onboarding");
        else if (profile.role === "employer") router.push("/employer/directory");
        else router.push("/seeker/dashboard");
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || "Ett fel uppstod vid inloggning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="p-6 pb-0">
            <h1 className="text-2xl font-serif text-[var(--brand-navy)] tracking-tight">
              Logga in
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Välkommen tillbaka till ARBETSpoolen.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-xl border border-[var(--border-strong)] bg-[#eaf3fb] p-3 text-xs text-[var(--brand)]">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--muted)]">
                  E-postadress
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="namn@domän.se"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--muted)]">
                    Lösenord
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[var(--brand)] hover:underline"
                    disabled
                    title="Kommer snart"
                  >
                    Glömt lösenord?
                  </button>
                </div>
                <div className="mt-2">
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4 border-white/30 border-t-white" />
                    Loggar in...
                  </>
                ) : (
                  <>Logga in →</>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
              Ny här?{" "}
              <Link href="/register" className="font-semibold text-[var(--brand)] hover:underline">
                Skapa konto gratis
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
