// Domain Entity: Photo
export interface Photo {
  id: string;
  inspection_id: string;
  location_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  component_name: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  file_size_bytes: number | null;
  is_deleted: boolean | null;
  deleted_at: Date | null;
  created_by: string;
  created_at: Date | null;
}

export interface CreatePhotoInput {
  inspection_id: string;
  location_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  component_name?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  file_size_bytes?: number | null;
  created_by: string;
}

export interface UpdatePhotoInput {
  caption?: string | null;
  component_name?: string | null;
  is_deleted?: boolean;
}
