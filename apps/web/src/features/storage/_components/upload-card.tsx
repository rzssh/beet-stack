import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "~/controllers/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { storageService } from "../_services/storage-service";

export const UploadCard = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");

  const presignMutation = useMutation({
    mutationFn: () => {
      if (!file && !filename) {
        return Promise.reject(new Error("Select a file or type a filename"));
      }

      const name = file?.name ?? filename;

      return storageService.createPresignedUpload({
        filename: name,
        contentType: file?.type,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Presigned URL generated",
        description: "Use the returned URL to upload directly to S3.",
      });
      if (file) {
        setFilename(file.name);
      }
      console.info("Presigned upload URL", data);
    },
    onError: (error) => {
      toast({
        title: "Unable to issue upload URL",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Secure uploads</CardTitle>
        <CardDescription>Generate a presigned URL without touching the server.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pick a file</label>
          <Input
            type="file"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              setFile(nextFile ?? null);
              if (nextFile) {
                setFilename(nextFile.name);
              }
            }}
            disabled={presignMutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Or type the filename</label>
          <Input
            placeholder="uploads/logo.png"
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            disabled={presignMutation.isPending}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Works best when AWS credentials are configured. We log the generated URL to the console so you can inspect the payload during local development.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => presignMutation.mutate()}
          disabled={presignMutation.isPending}
        >
          {presignMutation.isPending ? "Requesting URL..." : "Generate upload URL"}
        </Button>
      </CardFooter>
    </Card>
  );
};
