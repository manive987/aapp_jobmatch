import { LanguageProvider } from '@/components/LanguageProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export default function WebAppLayout({ children }) {
  return (
    <>
      <ServiceWorkerRegistration />
      <LanguageProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}
