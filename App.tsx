import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useGameStore } from './store/gameStore';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GachaPage from './pages/GachaPage';
import CollectionPage from './pages/CollectionPage';
import BattlePage from './pages/BattlePage';
import UpgradePage from './pages/UpgradePage';
import ShopPage from './pages/ShopPage';
import BossPage from './pages/BossPage';
import InventoryPage from './pages/InventoryPage';
import DebugPanel from './components/DebugPanel';
import ErrorBoundary from './components/ErrorBoundary';

function GameRouter() {
  const { user, loading } = useAuth();
  const { page, loadProfile, loadingProfile, reset } = useGameStore();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    } else if (!loading) {
      reset();
    }
  }, [user, loading, loadProfile, reset]);

  // Debug mode toggle with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading || (user && loadingProfile)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading your data...</p>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="font-sans antialiased text-white">
      {page === 'home'       && <HomePage />}
      {page === 'gacha'      && <GachaPage />}
      {page === 'collection' && <CollectionPage />}
      {page === 'battle'     && <BattlePage />}
      {page === 'upgrade'    && <UpgradePage />}
      {page === 'shop'       && <ShopPage />}
      {page === 'boss'       && <BossPage />}
      {page === 'inventory'  && <InventoryPage />}

      {/* Debug Panel - only in development */}
      {import.meta.env.DEV && showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
