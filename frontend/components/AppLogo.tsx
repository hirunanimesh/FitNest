import Link from "next/link";
import { Dumbbell } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center space-x-2">
      <Link href="/" className="flex items-center space-x-2">
        <Dumbbell className="h-5 w-5 text-primary" />
        <span className="font-bold text-xl text-black">FitNest</span>
      </Link>
    </div>
  );
}
