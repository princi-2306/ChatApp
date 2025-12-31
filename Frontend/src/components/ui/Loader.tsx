import { cn } from "@/lib/utils"; // Ensure this path matches your utils location
import { Loader2 } from "lucide-react"; // Assuming you use lucide-react, or replace with your SVG

interface LoaderProps {
  className?: string;
}

const Loader = ({ className }: LoaderProps) => {
  // We use 'cn' to merge any default classes with the one you pass in
  return <Loader2 className={cn("animate-spin", className)} />;
};

export default Loader;