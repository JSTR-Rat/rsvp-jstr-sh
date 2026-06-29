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
  SAVE_THE_DATE_TAGLINE,
} from '@/lib/save-the-date-constants';

const PAGE_TITLE = 'Vada & Wade - RSVP';
const PAGE_DESCRIPTION = SAVE_THE_DATE_TAGLINE;
/** 1200×630 — large OG / Discord / Twitter preview card */
const OG_IMAGE_URL = '/wada-og.jpg';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const OG_IMAGE_ALT =
  'Vada and Wade seated together in front of a silver Toyota Crown at golden hour.';

export type HomeSearch = GalleryImageSearch;

export const Route = createFileRoute('/')({
  validateSearch: validateGalleryImageSearch,
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: 'description', content: PAGE_DESCRIPTION },
      { name: 'og:title', content: PAGE_TITLE },
      { name: 'og:description', content: PAGE_DESCRIPTION },
      { name: 'og:type', content: 'website' },
      { name: 'og:image', content: OG_IMAGE_URL },
      { name: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
      { name: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
      { name: 'og:image:type', content: 'image/jpeg' },
      { name: 'og:image:alt', content: OG_IMAGE_ALT },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: PAGE_TITLE },
      { name: 'twitter:description', content: PAGE_DESCRIPTION },
      { name: 'twitter:image', content: OG_IMAGE_URL },
      { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
    ],
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
