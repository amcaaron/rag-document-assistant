import { supabase } from "./supabaseClient";

export const getSavedNotes = async (userId) => {
  const { data, error } = await supabase
    .from("saved_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createSavedNote = async ({
  userId,
  documentId,
  documentName,
  question,
  answer,
}) => {
  const { data, error } = await supabase
    .from("saved_notes")
    .insert([
      {
        user_id: userId,
        document_id: documentId,
        document_name: documentName,
        question,
        answer,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const removeSavedNote = async (noteId) => {
  const { error } = await supabase
    .from("saved_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    throw error;
  }

  return true;
};