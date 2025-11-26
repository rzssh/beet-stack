import { Check, File, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";

export function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsUploading(false);
    setUploadComplete(true);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">File Storage</CardTitle>
            <CardDescription>Upload and manage files</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            type="file"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            disabled={isUploading}
          />

          {selectedFile && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <File className="h-4 w-4" />
              <span className="truncate">{selectedFile.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || uploadComplete}
            className="w-full"
            size="sm"
          >
            {isUploading ? (
              "Uploading..."
            ) : uploadComplete ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Uploaded
              </>
            ) : (
              "Upload File"
            )}
          </Button>

          <Button variant="ghost" size="sm" className="w-full">
            View Files
          </Button>
        </div>

        <div className="text-muted-foreground text-xs">
          Supports: JPG, PNG, PDF, TXT (max 10MB)
        </div>
      </CardContent>
    </Card>
  );
}
