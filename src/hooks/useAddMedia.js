import { useState } from "react";
import { addMedia } from "../api/services/mediaService";

export const useMedia = () => {
  const [loading, setLoading] = useState(false);
  const [mediaResponse, setMediaResponse] = useState(null);
  const [error, setError] = useState(null);

  const uploadMedia = async (file, category = "HPRURAL") => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed!");
      return { success: false, message: "Only PDF files are allowed!" };
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const result = await addMedia(formData);
      if (result.success) {
        setMediaResponse(result.data);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message || "Error during file upload");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { uploadMedia, loading, mediaResponse, error };
};
