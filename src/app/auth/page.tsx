import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in or create a SportsHub account to manage favorites and join the conversation.",
  path: "/auth",
  noIndex: true,
});

export default function AuthPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-4 py-16 dark:bg-[#090d16] transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:shadow-2xl dark:shadow-black/60 sm:p-10 transition-colors duration-200">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          SportsHub community
        </p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Join the conversation
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400">
          Create an account to save your identity, manage favorites, and post comments on sports and events.
        </p>
        <div className="mt-8">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
