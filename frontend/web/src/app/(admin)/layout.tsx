import { AuthProvider } from "@/hooks/AuthProvider";
import Authentication from "./_components/Authentication";
import { Suspense } from "react";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Authentication>
        <Suspense fallback={<Loader />}>
          {children}
        </Suspense>
      </Authentication>;
    </AuthProvider>
  )
}

function Loader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}