import { useEffect } from 'react';
import { useBrowserStore } from './store/browserStore';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { useDeepLink } from './hooks/useDeepLink';

function App() {
  const { theme } = useBrowserStore();

  // Handle deep-linking via URL parameters
  useDeepLink();

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <>
      <AppLayout />
      <ToastContainer />
    </>
  );
}

export default App;
