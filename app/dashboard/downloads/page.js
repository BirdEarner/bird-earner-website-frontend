import { FolderOpen, Search, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
          <p className="text-muted-foreground">
            View and download your project files.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border shadow-sm">
        {[
          {
            name: "Website Redesign",
            freelancer: "Alex Designer",
            files: 3,
            lastUpdate: "2 days ago",
            size: "15 MB",
          },
          {
            name: "Mobile App UI",
            freelancer: "Sarah Creative",
            files: 2,
            lastUpdate: "1 day ago",
            size: "8 MB",
          },
          {
            name: "Logo Package",
            freelancer: "Design Studio",
            files: 5,
            lastUpdate: "3 days ago",
            size: "25 MB",
          },
        ].map((project, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-border p-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  by {project.freelancer} • {project.files} files
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {project.lastUpdate} • {project.size}
              </span>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 