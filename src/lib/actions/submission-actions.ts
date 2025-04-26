"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

// Fungsi untuk membuat Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables not set");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Fungsi untuk mengambil data submission berdasarkan ID
export async function getSubmissionById(id: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching submission:', error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSubmissionById:', error);
    return null;
  }
}

// Fungsi untuk mengupdate status submission
export async function updateSubmissionStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  
  console.log('Updating submission status:', { id, status });
  
  if (!id || !status) {
    throw new Error("ID dan status harus diisi");
  }
  
  try {
    const supabase = getSupabaseClient();
    console.log('Supabase client created, updating status...');
    
    const { data, error } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating submission status:', error.message);
      throw new Error(`Gagal mengupdate status laporan: ${error.message}`);
    }
    
    console.log('Update successful:', data);
    
    // Revalidate path untuk memperbarui data
    revalidatePath(`/admin/dashboard/submissions/${id}`);
    
    // Redirect untuk memastikan page refresh dengan data baru
    redirect(`/admin/dashboard/submissions/${id}?updated=status&t=${Date.now()}`);
  } catch (error) {
    console.error('Error in updateSubmissionStatus:', error);
    throw error;
  }
}

// Fungsi untuk mengupdate prioritas submission
export async function updateSubmissionPriority(formData: FormData) {
  const id = formData.get('id') as string;
  const priority = formData.get('priority') as string;
  
  console.log('Updating submission priority:', { id, priority });
  
  if (!id || !priority) {
    throw new Error("ID dan prioritas harus diisi");
  }
  
  try {
    const supabase = getSupabaseClient();
    console.log('Supabase client created, updating priority...');
    
    const { data, error } = await supabase
      .from('submissions')
      .update({ priority })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating submission priority:', error.message);
      throw new Error(`Gagal mengupdate prioritas laporan: ${error.message}`);
    }
    
    console.log('Update successful:', data);
    
    // Revalidate path untuk memperbarui data
    revalidatePath(`/admin/dashboard/submissions/${id}`);
    
    // Redirect untuk memastikan page refresh dengan data baru
    redirect(`/admin/dashboard/submissions/${id}?updated=priority&t=${Date.now()}`);
  } catch (error) {
    console.error('Error in updateSubmissionPriority:', error);
    throw error;
  }
}

// Fungsi untuk menambahkan komentar internal
export async function addInternalComment(formData: FormData) {
  const id = formData.get('id') as string;
  const comment = formData.get('comment') as string;
  
  console.log('Adding internal comment:', { id, commentLength: comment?.length });
  
  if (!id || !comment || comment.trim() === '') {
    throw new Error("ID dan komentar harus diisi");
  }
  
  try {
    const supabase = getSupabaseClient();
    
    // Dapatkan data submission saat ini
    console.log('Fetching current submission data');
    
    const { data: currentData, error: fetchError } = await supabase
      .from('submissions')
      .select('internal_comments')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current submission data:', fetchError.message);
      throw new Error(`Gagal mengambil data laporan: ${fetchError.message}`);
    }
    
    console.log('Current data:', currentData);
    
    // Persiapkan data komentar baru
    const currentComments = currentData.internal_comments || [];
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      timestamp: new Date().toISOString(),
    };
    
    const updatedComments = [...currentComments, newComment];
    console.log('Updated comments:', updatedComments);
    
    // Update data di database
    console.log('Updating comments in database');
    
    const { data, error: updateError } = await supabase
      .from('submissions')
      .update({ internal_comments: updatedComments })
      .eq('id', id)
      .select();
    
    if (updateError) {
      console.error('Error adding internal comment:', updateError.message);
      throw new Error(`Gagal menambahkan komentar internal: ${updateError.message}`);
    }
    
    console.log('Comment added successfully:', data);
    
    // Revalidate path untuk memperbarui data
    revalidatePath(`/admin/dashboard/submissions/${id}`);
    
    // Redirect untuk memastikan page refresh dengan data baru
    redirect(`/admin/dashboard/submissions/${id}?updated=comment&t=${Date.now()}`);
  } catch (error) {
    console.error('Error in addInternalComment:', error);
    throw error;
  }
} 