import i18next from 'i18next';
import dayjs from 'dayjs';
import core from 'core';
import capitalize from 'helpers/capitalize';
import { rotateRad } from 'helpers/rotate';
import { getAnnotationClass } from 'helpers/getAnnotationClass';
import getLatestActivityDate from 'helpers/getLatestActivityDate';

function getDocumentCenter(pageNumber) {
  let result;
  if (pageNumber <= core.getTotalPages()) {
    result = core.getPageInfo(pageNumber);
  } else {
    result = {
      width: 0,
      height: 0,
    };
  }
  return { x: result.width / 2, y: result.height / 2 };
}

function getRotationRad(pageNumber) {
  const orientation = core.getRotation(pageNumber);
  return (4 - orientation) * (Math.PI / 2);
}

const sortStrategies = {
  position: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        if (a.PageNumber === b.PageNumber) {
          const rotation = getRotationRad(a.PageNumber);
          const center = getDocumentCenter(a.PageNumber);

          // Simulated with respect to the document origin
          const rotatedA = [
            rotateRad(center.x, center.y, a.X, a.Y, rotation),
            rotateRad(center.x, center.y, a.X + a.Width, a.Y + a.Height, rotation),
          ];
          const rotatedB = [
            rotateRad(center.x, center.y, b.X, b.Y, rotation),
            rotateRad(center.x, center.y, b.X + b.Width, b.Y + b.Height, rotation),
          ];

          const smallestA = rotatedA.reduce(
            (smallest, current) => (current.y < smallest ? current.y : smallest),
            Number.MAX_SAFE_INTEGER,
          );
          const smallestB = rotatedB.reduce(
            (smallest, current) => (current.y < smallest ? current.y : smallest),
            Number.MAX_SAFE_INTEGER,
          );

          return smallestA - smallestB;
        }
        return a.PageNumber - b.PageNumber;
      }),
    shouldRenderSeparator: (prevNote, currNote) => currNote.PageNumber !== prevNote.PageNumber,
    getSeparatorContent: (prevNote, currNote, { pageLabels }) =>
      `${i18next.t('option.shared.page')} ${pageLabels[currNote.PageNumber - 1]}`,
  },
  time: {
    getSortedNotes: notes => notes.sort((a, b) => (getLatestActivityDate(b) || 0) - (getLatestActivityDate(a) || 0)),
    shouldRenderSeparator: (prevNote, currNote) => {
      const prevNoteDate = getLatestActivityDate(prevNote);
      const currNoteDate = getLatestActivityDate(currNote);
      if (prevNoteDate && currNoteDate) {
        const dayFormat = 'MMM D, YYYY';
        return dayjs(prevNoteDate).format(dayFormat) !== dayjs(currNoteDate).format(dayFormat);
      } else if (!prevNoteDate && !currNoteDate) {
        return false;
      } else {
        return true;
      }
    },
    getSeparatorContent: (prevNote, currNote) => {
      const latestActivityDate = getLatestActivityDate(currNote);
      if (latestActivityDate) {
        const dayFormat = 'MMM D, YYYY';
        const today = dayjs(new Date()).format(dayFormat);
        const yesterday = dayjs(new Date(new Date() - 86400000)).format(dayFormat);
        const latestActivityDay = dayjs(latestActivityDate).format(dayFormat);

        if (latestActivityDay === today) {
          return i18next.t('option.notesPanel.separator.today');
        }
        if (latestActivityDay === yesterday) {
          return i18next.t('option.notesPanel.separator.yesterday');
        }
        return latestActivityDay;
      } else {
        return i18next.t('option.notesPanel.separator.unknown');
      }
    },
  },
  status: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        const statusA =
          a.getStatus() === ''
            ? i18next.t('option.state.none').toUpperCase()
            : i18next.t(`option.state.${a.getStatus().toLowerCase()}`).toUpperCase();
        const statusB =
          b.getStatus() === ''
            ? i18next.t('option.state.none').toUpperCase()
            : i18next.t(`option.state.${b.getStatus().toLowerCase()}`).toUpperCase();
        return statusA < statusB ? -1 : statusA > statusB ? 1 : 0;
      }),
    shouldRenderSeparator: (prevNote, currNote) => prevNote.getStatus() !== currNote.getStatus(),
    getSeparatorContent: (prevNote, currNote) => {
      return currNote.getStatus() === ''
        ? i18next.t('option.state.none')
        : i18next.t(`option.state.${currNote.getStatus().toLowerCase()}`);
    },
  },
  author: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        const authorA = core.getDisplayAuthor(a).toUpperCase();
        const authorB = core.getDisplayAuthor(b).toUpperCase();
        return authorA < authorB ? -1 : authorA > authorB ? 1 : 0;
      }),
    shouldRenderSeparator: (prevNote, currNote) => core.getDisplayAuthor(prevNote) !== core.getDisplayAuthor(currNote),
    getSeparatorContent: (prevNote, currNote) => {
      return core.getDisplayAuthor(currNote);
    },
  },
  type: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        const typeA = getAnnotationClass(a);
        const typeB = getAnnotationClass(b);
        return typeA < typeB ? -1 : typeA > typeB ? 1 : 0;
      }),
    shouldRenderSeparator: (prevNote, currNote) => {
      return getAnnotationClass(prevNote) !== getAnnotationClass(currNote);
    },
    getSeparatorContent: (prevNote, currNote) => {
      return capitalize(getAnnotationClass(currNote));
    },
  },
};

export const getSortStrategies = () => sortStrategies;

export const addSortStrategy = newStrategy => {
  const { name, getSortedNotes, shouldRenderSeparator, getSeparatorContent } = newStrategy;

  sortStrategies[name] = {
    getSortedNotes,
    shouldRenderSeparator,
    getSeparatorContent,
  };
};
