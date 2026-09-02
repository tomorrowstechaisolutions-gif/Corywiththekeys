"use client";

import {
  PhotoManager as BasePhotoManager,
  type PhotoItem,
} from "@/components/admin/PhotoManager";

import { MAX_PRODUCT_PHOTOS } from "@/lib/validation/product";

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
      maxPhotos={MAX_PRODUCT_PHOTOS}
      photos={photos}
      canEdit={canEdit}
      primaryLabel="Main picture"
      emptyHint={`No pictures yet. Add up to ${MAX_PRODUCT_PHOTOS} — front, back, the print detail, and worn.`}
      mainPhotoHint={
        <>
          The <strong>main picture</strong> is the one shown on the store grid
          and in the cart. Use the arrows to set the order buyers scroll
          through on the product page. Up to {MAX_PRODUCT_PHOTOS} images.
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
