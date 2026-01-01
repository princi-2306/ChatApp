

interface LoaderProps {
  className?: string;
}

const Loader = ({ className }: LoaderProps) => {
  // We use 'cn' to merge any default classes with the one you pass in
  return <Loader2 className={cn("animate-spin", className)} />;
};

export default Loader;