import { SignUp } from '@clerk/nextjs';
import '../../styles/auth.css';

export default function Page() {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="auth-gradient-text">
              Inscription
            </span>
          </h1>
          <p className="auth-subtitle">
            Créez votre compte pour commencer à parier
          </p>
        </div>
        <div className="auth-clerk-wrapper">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gradient-to-r from-teal to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white',
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