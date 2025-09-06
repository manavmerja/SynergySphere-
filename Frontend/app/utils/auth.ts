import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useRequireAuth = () => {
  const router = useRouter();

  useEffect(() => {
    // Check token in localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // Not logged in, redirect to login page
      router.replace("/auth/login");
    }
  }, [router]);
};
