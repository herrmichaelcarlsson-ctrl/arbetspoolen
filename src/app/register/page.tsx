"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/components/ui/cn";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("job_seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Lösenorden matchar inte.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Lösenordet måste vara minst 6 tecken långt.");
      setLoading(false);
      return;
    }

    try {
      // Skicka med rollen i metadata, så tar databas-triggern hand om profilskapandet!
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: role
          }
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Registreringen misslyckades. Vänligen försök igen.");

      // Supabase returns a user with empty identities if the email already exists
      // (to prevent email enumeration). Detect this case:
      if (data.user.identities && data.user.identities.length === 0) {
        setErrorMessage("Ett konto med denna e-postadress finns redan. Försök logga in istället.");
        setLoading(false);
        return;
      }

      // If email confirmation is required, session will be null
      if (!data.session) {
        setSuccessMessage("Konto skapat! Kolla din e-post för en bekräftelselänk. (Om du inte hittar den, kolla skräpposten.)");
        setLoading(false);
        return;
      }

      // Session exists = email confirmation disabled, user is logged in
      setSuccessMessage("Konto skapat! Omdirigerar till onboarding...");
      setTimeout(() => router.push("/onboarding"), 900);
    } catch (err: any) {
      setErrorMessage(err.message || "Ett fel uppstod vid registrering.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader className="p-6 pb-0">
            <h1 className="text-2xl font-serif text-[var(--brand-navy)] tracking-tight">
              Skapa konto
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Välj roll och kom igång.
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-[var(--muted)]">
                  Jag vill gå med som
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("job_seeker")}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left transition bg-[var(--surface)] hover:bg-[#eaf3fb]",
                      role === "job_seeker"
                        ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/15"
                        : "border-[var(--border)]"
                    )}
                  >
                    <div className="text-sm font-semibold text-[var(--brand-navy)]">
                      👤 Arbetssökande
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Visa din kompetens och bli hittad.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("employer")}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left transition bg-[var(--surface)] hover:bg-[#fff8ec]",
                      role === "employer"
                        ? "border-[var(--brand-orange)] ring-2 ring-[var(--brand-orange)]/20"
                        : "border-[var(--border)]"
                    )}
                  >
                    <div className="text-sm font-semibold text-[var(--brand-navy)]">
                      🏢 Arbetsgivare
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      Sök och kontakta yrkespersoner.
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Lösenord
                  </label>
                  <div className="mt-2">
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minst 6 tecken"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Bekräfta
                  </label>
                  <div className="mt-2">
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Upprepa lösenord"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4 border-white/30 border-t-white" />
                    Skapar konto...
                  </>
                ) : (
                  <>Skapa konto →</>
                )}
              </Button>

              <div className="text-xs text-[var(--muted)] leading-relaxed">
                Genom att skapa ett konto godkänner du våra villkor och vår
                integritetspolicy.
              </div>
            </form>

            <div className="mt-6 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
              Redan registrerad?{" "}
              <Link href="/login" className="font-semibold text-[var(--brand)] hover:underline">
                Logga in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}