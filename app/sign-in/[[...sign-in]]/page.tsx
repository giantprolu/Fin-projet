import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-copper-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-copper to-teal bg-clip-text text-transparent">
              Connexion
            </span>
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
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
  );
}