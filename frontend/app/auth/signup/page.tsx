'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const typeParam = searchParams.get("type");

    // Check valid types and redirect
    if (typeParam && ["user", "trainer", "gym"].includes(typeParam)) {
      router.push(`/auth/signup/${typeParam}`);
    } else {
      // Redirect to a default or error page if needed
      router.push("/auth/signup/user");
    }
  }, [searchParams, router]);

  
}
