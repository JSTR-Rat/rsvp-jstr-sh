import { useMatches } from '@tanstack/react-router';
import { useMemo } from 'react';

export const useTitle = () => {
  const matches = useMatches();
  const title = useMemo(
    () =>
      matches.reduce((title, match) => {
        if (
          'title' in match.staticData &&
          typeof match.staticData.title === 'string'
        ) {
          return match.staticData.title;
        }
        return title;
      }, 'RSVP'),
    [matches],
  );

  return title;
};
