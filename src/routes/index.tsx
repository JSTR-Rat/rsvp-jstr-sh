import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Lightbox } from '@/components/lightbox';
import { LandingGalleryAndEventDetails } from '@/components/landing-gallery-and-event-details';
import { SaveTheDateHero } from '@/components/save-the-date-hero';
import { ENGAGEMENT_GALLERY_ITEMS } from '@/lib/engagement-gallery-data';
import {
  type GalleryImageSearch,
  useGalleryLightboxFromSearch,
  validateGalleryImageSearch,
} from '@/lib/gallery-lightbox-search';
import {
  SAVE_THE_DATE_HEAD_PRELOADS,
} from '@/lib/save-the-date-constants';
import {
  LANDING_PAGE_DESCRIPTION,
  PAGE_TITLE_WEDDING,
  buildSocialMetaTags,
} from '@/lib/page-social-meta';

export type HomeSearch = GalleryImageSearch;

export const Route = createFileRoute('/')({
  validateSearch: validateGalleryImageSearch,
  component: RouteComponent,
  head: () => ({
    meta: buildSocialMetaTags({
      title: PAGE_TITLE_WEDDING,
      description: LANDING_PAGE_DESCRIPTION,
    }),
    links: SAVE_THE_DATE_HEAD_PRELOADS,
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { activeIndex, lightboxOpen } = useGalleryLightboxFromSearch(
    search.image,
  );

  const closeLightbox = () => {
    navigate({ to: '/', search: {}, resetScroll: false });
  };

  const goToImage = (index: number) => {
    const item = ENGAGEMENT_GALLERY_ITEMS[index];
    if (!item) return;
    navigate({
      to: '/',
      search: { image: item.id },
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <>
      <SaveTheDateHero scrollTargetId="gallery" />
      <LandingGalleryAndEventDetails
        onGalleryTileClick={(index) => {
          const id = ENGAGEMENT_GALLERY_ITEMS[index]?.id;
          navigate({ to: '.', search: { image: id }, resetScroll: false });
        }}
      />
      <Lightbox
        open={lightboxOpen}
        images={ENGAGEMENT_GALLERY_ITEMS}
        activeIndex={lightboxOpen ? activeIndex : 0}
        onClose={closeLightbox}
        onNavigate={goToImage}
      />
    </>
  );
}
