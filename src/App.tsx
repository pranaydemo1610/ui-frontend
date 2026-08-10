import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { RailPage } from '@/pages/RailPage';
import { HumanIdentityPage } from '@/pages/HumanIdentityPage';
import { RoadPage } from '@/pages/RoadPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/rail" element={<RailPage />} />
              <Route path="/human-identity" element={<HumanIdentityPage />} />
              <Route path="/road" element={<RoadPage />} />
            </Routes>
          </AppLayout>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f1f5f9',
                fontSize: '13px',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
