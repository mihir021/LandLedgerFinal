/**
 * App Root Component
 * Wraps the application in Auth, Toast, and Notification providers.
 */
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
