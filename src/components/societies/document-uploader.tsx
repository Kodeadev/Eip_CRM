'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUp, X, File as FileIcon, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface DocumentUploaderProps {
  onUploadComplete: (documents: any[]) => void;
  bucketName?: string;
}

export function DocumentUploader({ onUploadComplete, bucketName = 'society_documents' }: DocumentUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const newDocs: any[] = []

    try {
      for (const file of files) {
        // Generar un nombre único para evitar colisiones
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file)

        if (uploadError) {
          console.error('Error subiendo archivo:', uploadError)
          throw uploadError
        }

        newDocs.push({
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        })
      }

      setUploadedDocs(prev => [...prev, ...newDocs])
      setFiles([]) // Limpiar archivos seleccionados
      onUploadComplete([...uploadedDocs, ...newDocs]) // Notificar al padre
    } catch (error) {
      alert(`Error al subir los archivos. Asegúrate de que el bucket "${bucketName}" existe.`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Subir Documentos</Label>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
      >
        <input {...getInputProps()} />
        <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Suelta los archivos aquí...' : 'Arrastra y suelta archivos aquí, o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, Word, Excel, Imágenes (Max 10MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Archivos listos para subir:</p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-md text-sm bg-background">
              <div className="flex items-center gap-2 truncate">
                <FileIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-700"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button 
            type="button" 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full mt-2"
          >
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</>
            ) : (
              'Subir Archivos Ahora'
            )}
          </Button>
        </div>
      )}

      {uploadedDocs.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium text-green-600">Archivos subidos exitosamente (Se guardarán al enviar el formulario):</p>
          {uploadedDocs.map((doc, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-md text-sm">
              <FileIcon className="h-4 w-4 text-green-600 shrink-0" />
              <span className="truncate font-medium">{doc.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
