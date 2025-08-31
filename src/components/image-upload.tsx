"use client"

import { useState } from "react"
import { CldUploadWidget, CldImage } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  imageUrl?: string
  onImageUpload: (imageUrl: string, publicId: string) => void
  onImageRemove: () => void
}

export function ImageUpload({ imageUrl, onImageUpload, onImageRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadSuccess = (result: any) => {
    setIsUploading(false)
    onImageUpload(result.info.secure_url, result.info.public_id)
  }

  const handleUploadError = (error: any) => {
    setIsUploading(false)
    console.error("Upload error:", error)
  }

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <Card className="relative overflow-hidden">
          <div className="aspect-video relative bg-muted">
            <CldImage
              src={imageUrl}
              alt="Producto"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onImageRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-border">
          <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No hay imagen seleccionada</p>
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onOpen={() => setIsUploading(true)}
              onClose={() => setIsUploading(false)}
              options={{
                maxFiles: 1,
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                maxFileSize: 5000000, // 5MB
                folder: "inventory",
              }}
            >
              {({ open }) => (
                <Button type="button" variant="outline" onClick={() => open()} disabled={isUploading} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {isUploading ? "Subiendo..." : "Subir Imagen"}
                </Button>
              )}
            </CldUploadWidget>
          </div>
        </Card>
      )}
    </div>
  )
}
