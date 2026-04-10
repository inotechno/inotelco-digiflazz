import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";
import Link from "next/link";
import Image from "next/image";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen pt-12 items-center">
      <div className="space-y-4 mb-10 text-center">
        <div className="flex justify-center mb-4">
             <Image src="/brands/logo.png" alt="InoTelco Logo" width={64} height={64} className="rounded-3xl shadow-xl shadow-primary/20 -rotate-3" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">
          Daftar Ino<span className="text-primary">Telco</span>
        </h1>
        <p className="text-slate-500 text-center text-sm font-medium">
          Mulai bisnis PPOB Anda sekarang
        </p>
      </div>

      <RegisterForm />

      <div className="mt-8 text-center pb-12">
        <p className="text-slate-400 text-sm">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            Masuk Disini
          </Link>
        </p>
      </div>
    </div>
  );
}
