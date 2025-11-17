import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/upload - Début');
    const formData = await request.formData();
    const file: File | null = formData.get('image') as unknown as File;
    const teamName: string = formData.get('teamName') as string || 'team';

    console.log('📦 Fichier reçu:', file?.name, 'Taille:', file?.size, 'Type:', file?.type);
    console.log('🏷️ Nom équipe:', teamName);

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }

    // Nettoyer le nom de l'équipe pour le fichier
    const cleanTeamName = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const extension = file.name.split('.').pop();
    const fileName = `${cleanTeamName}_${Date.now()}.${extension}`;
    const filePath = `team-logos/${fileName}`;

    console.log('📁 Chemin fichier:', filePath);

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('☁️ Upload vers Supabase Storage...');
    // Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('team-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('❌ Erreur Supabase Storage:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'upload vers le stockage: ' + error.message 
      }, { status: 500 });
    }

    console.log('✅ Upload réussi:', data);

    // Obtenir l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from('team-assets')
      .getPublicUrl(filePath);

    console.log('🔗 URL publique générée:', urlData.publicUrl);

    return NextResponse.json({ 
      success: true, 
      imagePath: urlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
}