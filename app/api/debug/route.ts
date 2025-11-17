import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Route de diagnostic pour vérifier la configuration
export async function GET() {
  console.log('🔍 DEBUG ROUTE APPELÉE');
  
  const config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'NOT_VERCEL',
    timestamp: new Date().toISOString(),
  };

  // Test de connexion réelle à Supabase
  let teamsTest = null;
  let teamsError = null;

  try {
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select('id, name, tag')
      .limit(3);
    
    teamsTest = teams;
    teamsError = error;
    console.log('✅ Test connexion Supabase:', teams?.length, 'équipes trouvées');
  } catch (error) {
    teamsError = error;
    console.error('❌ Erreur connexion Supabase:', error);
  }

  return NextResponse.json({
    config,
    supabaseTest: {
      teamsCount: teamsTest?.length || 0,
      teams: teamsTest,
      error: teamsError ? String(teamsError) : null
    }
  });
}
