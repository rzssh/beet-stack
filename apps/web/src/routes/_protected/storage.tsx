import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Upload,
  File,
  FileText,
  Image,
  Trash2,
  Download,
  Eye,
  Folder,
  HardDrive,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const Route = createFileRoute("/_protected/storage")({
  component: StoragePage,
});

function StoragePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Storage</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight">File Storage</h1>
            <p className="text-muted-foreground">
              Upload, manage, and organize your files. Demonstrates file handling patterns with modern web APIs.
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <StorageOverviewCard />
          <QuickStatsCard />
          <RecentActivityCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <FileUploadCard />
            <FileListCard />
          </div>
          
          <div className="space-y-6">
            <StoragePlansCard />
            <TechStackCard />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>File Storage Patterns</CardTitle>
            <CardDescription>
              This storage interface demonstrates modern file handling patterns in web applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium">
                <Upload className="h-4 w-4 text-blue-500" />
                Direct Uploads
              </h4>
              <p className="text-muted-foreground text-sm">
                Upload files directly to cloud storage with signed URLs and progress tracking.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium">
                <HardDrive className="h-4 w-4 text-green-500" />
                Metadata Management
              </h4>
              <p className="text-muted-foreground text-sm">
                Store file metadata, organize with folders, and implement search functionality.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4 text-yellow-500" />
                Optimized Delivery
              </h4>
              <p className="text-muted-foreground text-sm">
                Serve files through CDN with automatic resizing and format optimization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const StorageOverviewCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-blue-500" />
        Storage Usage
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Used</span>
          <span>2.1 GB / 10 GB</span>
        </div>
        <Progress value={21} className="h-2" />
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span>Images</span>
          <span>1.2 GB</span>
        </div>
        <div className="flex justify-between">
          <span>Documents</span>
          <span>640 MB</span>
        </div>
        <div className="flex justify-between">
          <span>Other</span>
          <span>260 MB</span>
        </div>
      </div>

      <Button variant="outline" className="w-full">
        Upgrade Storage
      </Button>
    </CardContent>
  </Card>
);

const QuickStatsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <File className="h-5 w-5 text-green-500" />
        File Statistics
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3">
        <div>
          <div className="font-semibold text-xl">127</div>
          <div className="text-muted-foreground text-sm">Total files</div>
        </div>
        
        <div>
          <div className="font-semibold text-xl">8</div>
          <div className="text-muted-foreground text-sm">Folders</div>
        </div>
        
        <div>
          <div className="font-semibold text-xl">5</div>
          <div className="text-muted-foreground text-sm">Shared items</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const RecentActivityCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {[
        { action: "Uploaded", file: "presentation.pdf", time: "2 hours ago" },
        { action: "Shared", file: "design-system.fig", time: "1 day ago" },
        { action: "Deleted", file: "old-backup.zip", time: "3 days ago" },
      ].map((activity, index) => (
        <div key={index} className="flex items-center gap-3 text-sm">
          <div className="rounded bg-muted p-1">
            <File className="h-3 w-3" />
          </div>
          <div className="flex-1">
            <div>{activity.action} <span className="font-medium">{activity.file}</span></div>
            <div className="text-muted-foreground text-xs">{activity.time}</div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const FileUploadCard = () => {
  const [dragOver, setDragOver] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Files
        </CardTitle>
        <CardDescription>
          Drag and drop files here or click to browse. Supports multiple file types and batch uploads.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            // Handle file drop
          }}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Drop files here</h3>
          <p className="text-muted-foreground text-sm mb-4">
            or click to browse from your device
          </p>
          <div className="space-y-3">
            <Input type="file" multiple className="hidden" id="file-upload" />
            <Label htmlFor="file-upload" asChild>
              <Button variant="outline">
                Choose Files
              </Button>
            </Label>
            <p className="text-muted-foreground text-xs">
              Supports: Images, Documents, Archives (Max 10MB per file)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FileListCard = () => {
  const files = [
    { name: "project-proposal.pdf", size: "2.4 MB", type: "document", modified: "2 hours ago" },
    { name: "screenshot.png", size: "1.8 MB", type: "image", modified: "1 day ago" },
    { name: "backup-data.zip", size: "15.6 MB", type: "archive", modified: "3 days ago" },
    { name: "presentation.pptx", size: "5.2 MB", type: "document", modified: "1 week ago" },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4 text-blue-500" />;
      case "document": return <FileText className="h-4 w-4 text-red-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Your Files
        </CardTitle>
        <CardDescription>
          Recent files and folders. Click to preview or download.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-muted-foreground text-sm">{file.size} • {file.modified}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="outline">Load More Files</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const StoragePlansCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Storage Plans</CardTitle>
      <CardDescription>
        Upgrade your storage for more space and features
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Free</h4>
          <Badge variant="outline">Current</Badge>
        </div>
        <p className="text-muted-foreground text-sm">10 GB storage</p>
        <p className="font-semibold">$0/month</p>
      </div>
      
      <div className="rounded-lg border p-3">
        <h4 className="font-medium">Pro</h4>
        <p className="text-muted-foreground text-sm">100 GB storage + advanced features</p>
        <p className="font-semibold">$9/month</p>
        <Button size="sm" className="mt-2 w-full">Upgrade</Button>
      </div>
      
      <div className="rounded-lg border p-3">
        <h4 className="font-medium">Business</h4>
        <p className="text-muted-foreground text-sm">1 TB storage + team features</p>
        <p className="font-semibold">$29/month</p>
        <Button size="sm" variant="outline" className="mt-2 w-full">Upgrade</Button>
      </div>
    </CardContent>
  </Card>
);

const TechStackCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Implementation</CardTitle>
      <CardDescription>
        Technologies powering this storage system
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span>File API</span>
        <span className="text-green-600">✓</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Drag & Drop</span>
        <span className="text-green-600">✓</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Progress Tracking</span>
        <span className="text-green-600">✓</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Cloud Storage</span>
        <span className="text-green-600">✓</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>CDN Delivery</span>
        <span className="text-green-600">✓</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Image Processing</span>
        <Badge variant="secondary" className="text-xs">Planned</Badge>
      </div>
    </CardContent>
  </Card>
);