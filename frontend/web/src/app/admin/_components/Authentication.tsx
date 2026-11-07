"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";
import { Loader } from "lucide-react";


const Authentication = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader className="size-12 text-green-600"/>
      </div>
    );
  }

  return <>{children}</>;
};

export default Authentication;