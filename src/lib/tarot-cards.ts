/**
 * Standard 78 tarot deck: index 0–21 Major Arcana, 22–77 Minor Arcana (Wands, Cups, Swords, Pentacles).
 * Used to seed new decks and for the Studio card selector labels.
 */
export interface TarotCardDefault {
  index: number;
  name: string;
  numeral: string;
}

const MAJOR: TarotCardDefault[] = [
  { index: 0, name: 'The Fool', numeral: '0' },
  { index: 1, name: 'The Magician', numeral: 'I' },
  { index: 2, name: 'The High Priestess', numeral: 'II' },
  { index: 3, name: 'The Empress', numeral: 'III' },
  { index: 4, name: 'The Emperor', numeral: 'IV' },
  { index: 5, name: 'The Hierophant', numeral: 'V' },
  { index: 6, name: 'The Lovers', numeral: 'VI' },
  { index: 7, name: 'The Chariot', numeral: 'VII' },
  { index: 8, name: 'Strength', numeral: 'VIII' },
  { index: 9, name: 'The Hermit', numeral: 'IX' },
  { index: 10, name: 'Wheel of Fortune', numeral: 'X' },
  { index: 11, name: 'Justice', numeral: 'XI' },
  { index: 12, name: 'The Hanged Man', numeral: 'XII' },
  { index: 13, name: 'Death', numeral: 'XIII' },
  { index: 14, name: 'Temperance', numeral: 'XIV' },
  { index: 15, name: 'The Devil', numeral: 'XV' },
  { index: 16, name: 'The Tower', numeral: 'XVI' },
  { index: 17, name: 'The Star', numeral: 'XVII' },
  { index: 18, name: 'The Moon', numeral: 'XVIII' },
  { index: 19, name: 'The Sun', numeral: 'XIX' },
  { index: 20, name: 'Judgement', numeral: 'XX' },
  { index: 21, name: 'The World', numeral: 'XXI' },
];

// Numbered minor arcana (Ace-10) use roman numerals.
// Court cards (Page, Knight, Queen, King) intentionally have no numeral.
const MINOR_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', '', '', '', ''];
const MINOR_NAMES = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'] as const;

function buildMinor(): TarotCardDefault[] {
  const out: TarotCardDefault[] = [];
  let index = 22;
  for (const suit of SUITS) {
    for (let i = 0; i < 14; i++) {
      const name = `${MINOR_NAMES[i]} of ${suit}`;
      out.push({ index, name, numeral: MINOR_NUMERALS[i] });
      index++;
    }
  }
  return out;
}

const MINOR_ARCANA = buildMinor();

/** All 78 cards in order (0–21 Major, 22–77 Minor). */
export const TAROT_CARDS_78: TarotCardDefault[] = [...MAJOR, ...MINOR_ARCANA];

/** Major Arcana only (22 cards). */
export const TAROT_CARDS_22 = MAJOR;

/** Get default name and numeral for a card index (0–77). */
export function getTarotDefault(index: number): TarotCardDefault | undefined {
  return TAROT_CARDS_78[index];
}

/** Sections for the Studio card selector: Major Arcana, then Minor by suit. */
export const TAROT_SECTIONS: { title: string; startIndex: number; endIndex: number }[] = [
  { title: 'Major Arcana', startIndex: 0, endIndex: 22 },
  { title: 'Wands', startIndex: 22, endIndex: 36 },
  { title: 'Cups', startIndex: 36, endIndex: 50 },
  { title: 'Swords', startIndex: 50, endIndex: 64 },
  { title: 'Pentacles', startIndex: 64, endIndex: 78 },
];
