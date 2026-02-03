"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/modules/core/components/ui/badge";
import { Button } from "@/modules/core/components/ui/button";
import { FileIcon, UploadCloud, X, Download, Edit2, Save } from "lucide-react";
import { DetailedEmployeeInfo } from "../../mock-details";

interface DocumentsTabProps {
  info?: DetailedEmployeeInfo;
}

export function DocumentsTab({ info }: DocumentsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log("Files uploaded:", acceptedFiles);
    },
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Documents & Attachments
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] h-5 bg-background font-mono border-primary/20 text-primary px-2"
            >
              {info?.documents.length || 0} Files
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-bold"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                MANAGE
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] hover:bg-muted font-bold text-muted-foreground transition-colors"
                  onClick={() => setIsEditing(false)}
                >
                  CANCEL
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-[10px] gap-1.5 font-bold shadow-sm transition-all"
                  onClick={() => setIsEditing(false)}
                >
                  <Save className="h-3.5 w-3.5" />
                  DONE
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="p-0 pt-2 space-y-6">
          {/* Drag & Drop Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer
              ${isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-muted/30"}
            `}
          >
            <input {...getInputProps()} />
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drag and drop documents here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload ID cards, degrees, or certifications (PDF, JPG, PNG)
            </p>
          </div>

          {/* Document List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info?.documents.map((doc) => (
              <div
                key={doc.id}
                className="group border border-border rounded-xl p-4 flex items-center gap-4 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate pr-4 text-foreground">
                    {doc.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-tighter mt-0.5">
                    {doc.type} • {doc.size}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <X className="h-4.5 w-4.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
