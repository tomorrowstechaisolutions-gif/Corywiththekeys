"use client";

import {
  PhotoManager as BasePhotoManager,
  type PhotoItem,
} from "@/components/admin/PhotoManager";

import {
  deleteVehiclePhoto,
  moveVehiclePhoto,
  registerVehiclePhotos,
  setPrimaryPhoto,
} from "../actions";

export type { PhotoItem };

/**
 * The vehicle gallery. Thin wrapper: the manager itself is shared with the
 * product gallery, and only the bucket, the actions and the wording differ.
 */
export function PhotoManager({
  vehicleId,
  photos,
  canEdit,
}: {
  vehicleId: string;
  photos: PhotoItem[];
  canEdit: boolean;
}) {
  return (
    <BasePhotoManager
      entityId={vehicleId}
      bucket="vehicle-photos"
      photos={photos}
      canEdit={canEdit}
      primaryLabel="Shown on the inventory card"
      emptyHint="No photos yet. A listing without photos will not sell."
      mainPhotoHint={
        <>
          The <strong>main photo</strong> is the one buyers see on the
          inventory card. Use the arrows to set the gallery order.
        </>
      }
      actions={{
        register: registerVehiclePhotos,
        setPrimary: setPrimaryPhoto,
        move: moveVehiclePhoto,
        remove: deleteVehiclePhoto,
      }}
    />
  );
}
