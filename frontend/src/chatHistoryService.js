import { supabase } from "./supabaseClient";

export const getChatHistory = async (userId, documentId) => {
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createChatHistoryEntry = async ({
  userId,
  documentId,
  documentName,
  question,
  answer,
  sources,
}) => {
  const { data, error } = await supabase
    .from("chat_history")
    .insert([
      {
        user_id: userId,
        document_id: documentId,
        document_name: documentName,
        question,
        answer,
        sources: sources || [],
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const clearChatHistoryForDocument = async (userId, documentId) => {
  const { error } = await supabase
    .from("chat_history")
    .delete()
    .eq("user_id", userId)
    .eq("document_id", documentId);

  if (error) {
    throw error;
  }

  return true;
};

export const clearAllUserChatHistory = async (userId) => {
  const { error } = await supabase
    .from("chat_history")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
};