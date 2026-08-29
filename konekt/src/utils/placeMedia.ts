import type { PlaceVisit } from '@/constants/types';
import type { PhotoGridItem } from '@/components/PhotoGrid';

/**
 * What to actually show for a place: a real photo/video the user picked
 * always wins over the stock fallback photo.
 */
export function mediaForPlace(place: PlaceVisit): PhotoGridItem[] {
  if (place.mediaUri) {
    return [{ uri: place.mediaUri, type: place.mediaType ?? 'photo' }];
  }
  if (place.photoUrl) {
    return [{ uri: place.photoUrl, type: 'photo' }];
  }
  return [];
}
