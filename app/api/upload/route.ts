import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file: File | null = formData.get('image') as unknown as File;
    const teamName: string = formData.get('teamName') as string || 'team';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }

    // Nettoyer le nom de l'équipe pour le fichier (enlever caractères spéciaux)
    const cleanTeamName = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const extension = file.name.split('.').pop();
    const fileName = `${cleanTeamName}.${extension}`;

    // Créer le dossier public/assets s'il n'existe pas
    const assetsDir = join(process.cwd(), 'public', 'assets');
    try {
      await mkdir(assetsDir, { recursive: true });
    } catch (err) {
      // Le dossier existe déjà
    }

    // Vérifier si un fichier avec le même nom (mais extension différente) existe déjà
    const baseFileName = cleanTeamName;
    const existingFiles = ['.png', '.jpg', '.jpeg', '.webp', '.svg'].map(ext => 
      join(assetsDir, `${baseFileName}${ext}`)
    );
    
    // Supprimer les anciens fichiers du même nom
    for (const filePath of existingFiles) {
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (err) {
          // Ignorer les erreurs de suppression
        }
      }
    }

    // Convertir le fichier en buffer et l'enregistrer
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    const filePath = join(assetsDir, fileName);
    
    await writeFile(filePath, buffer);

    // Retourner le chemin de l'image
    return NextResponse.json({ 
      success: true, 
      imagePath: `/assets/${fileName}`,
      fileName: fileName
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}