import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import api from "@/utils/axios";

interface FileUploadProps {
  onUpload: (fileUrl: string) => void;
  label?: string;
  accept?: string;
}

const FileUpload = ({ onUpload, label = "Upload Image", accept = "image/*" }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { fileUrl } = response.data;
      onUpload(fileUrl);
    } catch (err) {
      setError("Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <Button asChild disabled={uploading} className="mt-1">
          <span>{uploading ? "Uploading..." : label}</span>
        </Button>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload