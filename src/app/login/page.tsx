"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const avatarUri = useMemo(() => {
    return createAvatar(notionists, {
      seed: "Sarah",
      backgroundColor: ["f1f5f9"],
      size: 128,
      beardProbability: 0,
    }).toDataUri();
  }, []);

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Nieprawidłowy e-mail lub hasło.");
        setLoading(false);
        return;
      }
      router.push("/panel");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSuccess("Sprawdź skrzynkę e-mail — wysłaliśmy link aktywacyjny.");
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white selection:bg-[#4EA8FF]/20 selection:text-[#4EA8FF]">
      {/* Left — Brand */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#050505] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <Image
          src="/loginpage/loginpageBG.jpg"
          alt="Make it design presentation"
          fill
          className="object-cover object-center pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-[#050505]/40 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505]/80 pointer-events-none z-0" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4EA8FF] to-[#9B66FF] flex items-center justify-center shadow-lg shadow-[#4EA8FF]/20 group-hover:shadow-[#4EA8FF]/40 transition-all duration-300">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="font-display font-bold text-white text-xl tracking-tight">make it.</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-sans font-medium group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
            Wróć do strony głównej
          </Link>
        </div>

        <div className="relative z-10 flex flex-col justify-center max-w-2xl mt-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-display text-[48px] xl:text-[64px] leading-[1.1] font-bold text-white tracking-[-0.02em] mb-6"
          >
            Przestrzeń dla <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4EA8FF] via-[#7B88FF] to-[#9B66FF]">
              Twoich projektów.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="font-sans text-[18px] xl:text-[20px] text-white/95 leading-[1.6] max-w-md font-light"
          >
            Zarządzaj swoimi stronami, przeglądaj postępy prac i komunikuj się z naszym zespołem w jednym, intuicyjnym miejscu.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[500px] bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex gap-6">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-[#f1f5f9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUri} alt="Anna Kowalska" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-sans text-[16px] leading-[1.6] text-white/95 font-light mb-5">
                &ldquo;Panel klienta ułatwił nam całą komunikację. Wszystkie pliki, makiety i raporty są w jednym miejscu. Zespół <span className="font-medium text-white">make it.</span> to profesjonaliści.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-white/20" />
                <div>
                  <p className="font-sans text-[14px] font-medium text-white">Anna Kowalska</p>
                  <p className="font-sans text-[13px] text-white/50">Bloom Kwiaty</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#FAFAFA_0%,#FFFFFF_100%)] pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4EA8FF] to-[#9B66FF] flex items-center justify-center shadow-lg shadow-[#4EA8FF]/20">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span className="font-display font-bold text-[#111111] text-xl tracking-tight">make it.</span>
            </Link>
          </div>

          {/* Mode toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="font-display text-[36px] font-bold text-[#111111] tracking-tight mb-6 drop-shadow-sm">
              {mode === "login" ? "Witaj z powrotem" : "Stwórz konto"}
            </h2>
            {/* Login / Register tabs */}
            <div className="flex gap-0.5 bg-[#F0F0F0] rounded-lg p-0.5">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 font-sans text-[13px] font-medium py-2 rounded-md transition-all duration-150 ${
                  mode === "login"
                    ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-[#888888] hover:text-[#111111]"
                }`}
              >
                Zaloguj się
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`flex-1 font-sans text-[13px] font-medium py-2 rounded-md transition-all duration-150 ${
                  mode === "register"
                    ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-[#888888] hover:text-[#111111]"
                }`}
              >
                Zarejestruj się
              </button>
            </div>
          </motion.div>

          {/* Google */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={handleGoogle}
              className="group w-full h-[52px] flex items-center justify-center gap-3 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] hover:border-[#D0D0D0] transition-all duration-200"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-sans font-medium text-[15px] text-[#111111]">
                {mode === "login" ? "Kontynuuj z Google" : "Zarejestruj przez Google"}
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#E5E5E5]" />
            <span className="font-sans text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider">LUB E-MAIL</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#E5E5E5]" />
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[14px] font-semibold text-[#111111]">Imię i nazwisko</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jan Kowalski"
                      className="w-full h-[52px] border border-[#E5E5E5] bg-[#FAFAFA] focus:bg-white hover:border-[#D0D0D0] focus:border-[#4EA8FF] focus:ring-[4px] focus:ring-[#4EA8FF]/10 rounded-xl px-4 font-sans text-[15px] text-[#111111] placeholder:text-[#BBBBBB] focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[14px] font-semibold text-[#111111]">Nazwa firmy</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Kuchciak Budownictwo"
                      className="w-full h-[52px] border border-[#E5E5E5] bg-[#FAFAFA] focus:bg-white hover:border-[#D0D0D0] focus:border-[#4EA8FF] focus:ring-[4px] focus:ring-[#4EA8FF]/10 rounded-xl px-4 font-sans text-[15px] text-[#111111] placeholder:text-[#BBBBBB] focus:outline-none transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-[14px] font-semibold text-[#111111]">Adres e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@firma.pl"
                className="w-full h-[52px] border border-[#E5E5E5] bg-[#FAFAFA] focus:bg-white hover:border-[#D0D0D0] focus:border-[#4EA8FF] focus:ring-[4px] focus:ring-[#4EA8FF]/10 rounded-xl px-4 font-sans text-[15px] text-[#111111] placeholder:text-[#BBBBBB] focus:outline-none transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[14px] font-semibold text-[#111111]">Hasło</label>
                {mode === "login" && (
                  <a href="#" className="font-sans text-[13px] font-medium text-[#4EA8FF] hover:text-[#9B66FF] transition-colors">
                    Zapomniałeś hasła?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={mode === "register" ? 8 : undefined}
                  className="w-full h-[52px] border border-[#E5E5E5] bg-[#FAFAFA] focus:bg-white hover:border-[#D0D0D0] focus:border-[#4EA8FF] focus:ring-[4px] focus:ring-[#4EA8FF]/10 rounded-xl px-4 pr-12 font-sans text-[15px] text-[#111111] placeholder:text-[#BBBBBB] focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {mode === "register" && (
                <p className="font-sans text-[12px] text-[#AAAAAA]">Minimum 8 znaków</p>
              )}
            </div>

            {error && <p className="font-sans text-[13px] text-red-500">{error}</p>}
            {success && <p className="font-sans text-[13px] text-emerald-600">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-1 w-full h-[52px] flex items-center justify-center rounded-xl bg-[#111111] overflow-hidden transition-all hover:shadow-[0_8px_24px_rgba(17,17,17,0.15)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4EA8FF] to-[#9B66FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative font-sans text-[15px] font-semibold text-white tracking-wide">
                {loading ? "Chwila..." : mode === "login" ? "Zaloguj się" : "Stwórz konto"}
              </span>
              {!loading && (
                <svg className="relative ml-2 w-4 h-4 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center font-sans text-[13px] text-[#888888]"
          >
            Kontynuując, akceptujesz{" "}
            <a href="#" className="font-medium text-[#111111] hover:text-[#4EA8FF] transition-colors">Regulamin</a>
            {" "}oraz{" "}
            <a href="#" className="font-medium text-[#111111] hover:text-[#4EA8FF] transition-colors">Politykę prywatności</a>.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
