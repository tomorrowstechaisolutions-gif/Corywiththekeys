"use client";

import {
  PhotoManager as BasePhotoManager,
  type PhotoItem,
} from "@/components/admin/PhotoManager";

import {
  deleteProductPhoto,
  moveProductPhoto,
  registerProductPhotos,
  setPrimaryProductPhoto,
} from "../actions";

export type { PhotoItem };

/**
 * The product gallery. Thin wrapper: the manager itself is shared with the
 * vehicle gallery, and only the bucket, the actions and the wording differ.
 */
export function PhotoManager({
  productId,
  photos,
  canEdit,
}: {
  productId: string;
  photos: PhotoItem[];
  canEdit: boolean;
}) {
  return (
    <BasePhotoManager
      entityId={productId}
      bucket="product-photos"
      photos={photos}
      canEdit={canEdit}
      primaryLabel="Main picture"
      emptyHint="No pictures yet. Add at least one before you publish."
      mainPhotoHint={
        <>
          The <strong>main picture</strong> is the one shown on the store grid
          and in the cart. Use the arrows to set the order buyers scroll
          through on the product page.
        </>
      }
      actions={{
        register: registerProductPhotos,
        setPrimary: setPrimaryProductPhoto,
        move: moveProductPhoto,
        remove: deleteProductPhoto,
      }}
    />
  );
}
