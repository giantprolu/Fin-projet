import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-teal to-copper bg-clip-text text-transparent">
              Inscription
            </span>
          </h1>
          <p className="text-gray-600">
            Créez votre compte pour commencer à parier
          </p>
        </div>
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
  );
}