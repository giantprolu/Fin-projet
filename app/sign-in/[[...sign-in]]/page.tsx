import { SignIn } from '@clerk/nextjs';
import '../../styles/auth.css';

export default function Page() {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="auth-gradient-text">
              Connexion
            </span>
          </h1>
          <p className="auth-subtitle">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
        <div className="auth-clerk-wrapper">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white',
                card: 'shadow-xl border-0',
                headerTitle: 'text-gray-900',
                headerSubtitle: 'text-gray-600',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}