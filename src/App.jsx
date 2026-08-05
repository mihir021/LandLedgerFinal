/**
 * App Root Component
 * Wraps the application in the AuthProvider and renders the router.
 */
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
