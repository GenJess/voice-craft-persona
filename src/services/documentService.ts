
import { supabase } from '@/lib/supabaseClient';

export interface DocumentProcessingResult {
  text: string;
  success: boolean;
  error?: string;
}

export const processDocument = async (file: File): Promise<DocumentProcessingResult> => {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Call the secure Edge Function for text extraction
    const { data, error } = await supabase.functions.invoke('extract-document-text', {
      body: {
        base64Data: base64Data.split(',')[1], // Remove data:mime/type;base64, prefix
        mimeType: file.type
      }
    });

    if (error) {
      console.error('Document processing error:', error);
      return {
        text: '',
        success: false,
        error: error.message || 'Failed to process document'
      };
    }

    return {
      text: data.text || '',
      success: true
    };
  } catch (error) {
    console.error('Unexpected error processing document:', error);
    return {
      text: '',
      success: false,
      error: 'Unexpected error occurred while processing document'
    };
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
