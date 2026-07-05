import { supabase } from "./supabaseClient";

export const getUserDocuments = async (userId) => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createUserDocument = async ({
  userId,
  documentId,
  filename,
  pagesLoaded,
  chunksCreated,
}) => {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        user_id: userId,
        document_id: documentId,
        filename,
        pages_loaded: pagesLoaded,
        chunks_created: chunksCreated,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const removeUserDocument = async (documentId) => {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("document_id", documentId);

  if (error) {
    throw error;
  }

  return true;
};

export const removeAllUserDocuments = async (userId) => {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
};