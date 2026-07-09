import { supabase } from "./supabaseClient";

export const getUserDocuments = async (userId) => {
  if (!userId) {
    return [];
  }

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
  storagePath,
  storageUrl,
}) => {
  if (!userId || !documentId || !filename) {
    throw new Error("Missing required document metadata.");
  }

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        user_id: userId,
        document_id: documentId,
        filename,
        pages_loaded: pagesLoaded || 0,
        chunks_created: chunksCreated || 0,
        storage_path: storagePath || null,
        storage_url: storageUrl || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const removeUserDocument = async (documentId, userId) => {
  if (!documentId || !userId) {
    throw new Error("Missing document ID or user ID.");
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
};

export const removeAllUserDocuments = async (userId) => {
  if (!userId) {
    throw new Error("Missing user ID.");
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
};