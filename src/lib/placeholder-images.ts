import { supabase } from './supabase';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export async function getPlaceholderImages(): Promise<ImagePlaceholder[]> {
  const { data: images, error } = await (supabase as any)
    .from('placeholder_images')
    .select('*');

  if (error) {
    console.error('Erro ao buscar imagens:', error);
    return [];
  }

  return images;
}

export async function getPlaceholderImageById(id: string): Promise<ImagePlaceholder | null> {
  const { data: image, error } = await (supabase as any)
    .from('placeholder_images')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar imagem:', error);
    return null;
  }

  return image;
}

export async function createPlaceholderImage(image: Omit<ImagePlaceholder, 'id'>): Promise<ImagePlaceholder | null> {
  const { data, error } = await (supabase as any)
    .from('placeholder_images')
    .insert([image])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar imagem:', error);
    return null;
  }

  return data;
}

export async function updatePlaceholderImage(id: string, image: Partial<ImagePlaceholder>): Promise<ImagePlaceholder | null> {
  const { data, error } = await (supabase as any)
    .from('placeholder_images')
    .update(image)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar imagem:', error);
    return null;
  }

  return data;
}

export async function deletePlaceholderImage(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('placeholder_images')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }

  return true;
}
