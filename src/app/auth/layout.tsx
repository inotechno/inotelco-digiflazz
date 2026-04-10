export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto px-6 bg-slate-50 min-h-screen">
      {children}
    </div>
  );
}
