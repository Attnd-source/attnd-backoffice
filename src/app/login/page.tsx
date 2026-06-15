import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";
import { brand } from "@/lib/brand";
import Image from "next/image";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-muted/60 via-background to-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src={brand.logoPath} alt={brand.name} width={170} height={42} priority />
          <p className="mt-3 text-sm text-muted-foreground">{brand.tagline}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h1 className="mb-1 text-lg font-semibold">Sign in</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            Use the credentials provided by your administrator.
          </p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {brand.productName} · Internal use only
        </p>
      </div>
    </div>
  );
}
