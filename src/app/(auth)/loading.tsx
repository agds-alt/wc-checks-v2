import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
