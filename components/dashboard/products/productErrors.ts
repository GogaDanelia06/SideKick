import type { ResizeError } from "@/lib/products/resizePhoto";
import type { Text } from "@/lib/i18n/messages";

/** Why the server did not save a product; the photo ones come from lib/products/photo.ts. */
export const PRODUCT_ERRORS: Record<string, Text> = {
  missing: "dashboard.products.errors.nameAndCodeAre",
  duplicate: "dashboard.products.errors.thatCodeIsAlready",
  limit: "dashboard.products.errors.yourPlanDoesNot",
  forbidden: "dashboard.products.errors.youMayNotChange",
  photo_type: "dashboard.products.errors.thePhotoMustBe",
  photo_size: "dashboard.products.errors.thePhotoIsToo",
  photo_storage: "dashboard.products.errors.photoStorageIsNot",
  error: "dashboard.products.errors.error",
};

export const PRODUCT_SAVED: Text = "dashboard.products.errors.productSaved";
export const PRODUCT_DELETED: Text = "dashboard.products.errors.productDeleted";

/** Problems found in the browser, before anything is sent. */
export const PHOTO_ERRORS: Record<ResizeError, Text> = {
  unreadable: "dashboard.products.errors.thisFileCanT",
  too_large: "dashboard.products.errors.thePhotoIsToo2",
};
