import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug, getTemplatePreviewImages } from "@/lib/templates";
import TemplateGallery from "@/components/template-gallery";
import HollowSaintPhysicalDeckImage from "@/components/hollow-saint-physical-deck-image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const TEMPLATE_CARD_SPOTLIGHTS = {
  "Cosmic-Void": [
    {
      name: "Three of Swords",
      slug: "three-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COSMIC-VOID/three-of-swords.png",
      alt: "Three of Swords tarot card — Cosmic Void deck",
    },
    {
      name: "Strength",
      slug: "strength",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COSMIC-VOID/strength.png",
      alt: "Strength tarot card — Cosmic Void deck",
    },
    {
      name: "Six of Cups",
      slug: "six-of-cups",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COSMIC-VOID/six-of-cups.png",
      alt: "Six of Cups tarot card — Cosmic Void deck",
    },
    {
      name: "King of Wands",
      slug: "king-of-wands",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COSMIC-VOID/king-of-wands.png",
      alt: "King of Wands tarot card — Cosmic Void deck",
    },
  ],
  "grimoire-tarot": [
    {
      name: "Five of Pentacles",
      slug: "five-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/GRIMOIRE-TAROT/five-of-pentacles.jpg",
      alt: "Five of Pentacles tarot card — Grimoire Tarot deck",
    },
    {
      name: "Knight of Cups",
      slug: "knight-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/GRIMOIRE-TAROT/knight-of-cups.jpg",
      alt: "Knight of Cups tarot card — Grimoire Tarot deck",
    },
    {
      name: "Seven of Cups",
      slug: "seven-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/GRIMOIRE-TAROT/seven-of-cups.jpg",
      alt: "Seven of Cups tarot card — Grimoire Tarot deck",
    },
    {
      name: "Queen of Swords",
      slug: "queen-of-swords",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/GRIMOIRE-TAROT/queen-of-swords.jpg",
      alt: "Queen of Swords tarot card — Grimoire Tarot deck",
    },
  ],
  "Dream-Scape": [
    {
      name: "The Hermit",
      slug: "the-hermit",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DREAM-SCAPE/the-hermit.jpg",
      alt: "The Hermit tarot card — Dream-Scape deck",
    },
    {
      name: "Nine of Cups",
      slug: "nine-of-cups",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DREAM-SCAPE/nine-of-cups.jpg",
      alt: "Nine of Cups tarot card — Dream-Scape deck",
    },
    {
      name: "Seven of Pentacles",
      slug: "seven-of-pentacles",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DREAM-SCAPE/seven-of-pentacles.jpg",
      alt: "Seven of Pentacles tarot card — Dream-Scape deck",
    },
    {
      name: "Page of Pentacles",
      slug: "page-of-pentacles",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DREAM-SCAPE/page-of-pentacles.jpg",
      alt: "Page of Pentacles tarot card — Dream-Scape deck",
    },
  ],
  "The-Gatsby": [
    {
      name: "Three of Cups",
      slug: "three-of-cups",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/THE-GATSBY/three-of-cups.jpg",
      alt: "Three of Cups tarot card — The Gatsby deck",
    },
    {
      name: "Five of Swords",
      slug: "five-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/THE-GATSBY/five-of-swords.jpg",
      alt: "Five of Swords tarot card — The Gatsby deck",
    },
    {
      name: "Ace of Swords",
      slug: "ace-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/THE-GATSBY/ace-of-swords.jpg",
      alt: "Ace of Swords tarot card — The Gatsby deck",
    },
    {
      name: "King of Swords",
      slug: "king-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/THE-GATSBY/king-of-swords.jpg",
      alt: "King of Swords tarot card — The Gatsby deck",
    },
  ],
  "Bloodbound-Tarot": [
    {
      name: "Justice",
      slug: "justice",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/justice.jpg",
      alt: "Justice tarot card — Bloodbound Tarot deck",
    },
    {
      name: "Seven of Swords",
      slug: "seven-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/seven-of-swords.jpg",
      alt: "Seven of Swords tarot card — Bloodbound Tarot deck",
    },
    {
      name: "Two of Swords",
      slug: "two-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/two-of-swords.jpg",
      alt: "Two of Swords tarot card — Bloodbound Tarot deck",
    },
    {
      name: "The High Priestess",
      slug: "high-priestess",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/high-priestess.jpg",
      alt: "The High Priestess tarot card — Bloodbound Tarot deck",
    },
  ],
  "Psychedelic-70s-Tarot": [
    {
      name: "The Empress",
      slug: "the-empress",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/PSYCHEDELIC-70S-TAROT/the-empress.jpg",
      alt: "The Empress tarot card — Psychedelic 70s Tarot deck",
    },
    {
      name: "The Tower",
      slug: "the-tower",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/PSYCHEDELIC-70S-TAROT/the-tower.jpg",
      alt: "The Tower tarot card — Psychedelic 70s Tarot deck",
    },
    {
      name: "Two of Cups",
      slug: "two-of-cups",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/PSYCHEDELIC-70S-TAROT/two-of-cups.jpg",
      alt: "Two of Cups tarot card — Psychedelic 70s Tarot deck",
    },
    {
      name: "Ten of Pentacles",
      slug: "ten-of-pentacles",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/PSYCHEDELIC-70S-TAROT/ten-of-pentacles.jpg",
      alt: "Ten of Pentacles tarot card — Psychedelic 70s Tarot deck",
    },
  ],
  "Amduat-Tarot": [
    {
      name: "Judgement",
      slug: "judgement",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/AMDUAT-TAROT/judgement.jpg",
      alt: "Judgement tarot card — Amduat Tarot deck",
    },
    {
      name: "Wheel of Fortune",
      slug: "wheel-of-fortune",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/AMDUAT-TAROT/wheel-of-fortune.jpg",
      alt: "Wheel of Fortune tarot card — Amduat Tarot deck",
    },
    {
      name: "Six of Wands",
      slug: "six-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/AMDUAT-TAROT/six-of-wands.jpg",
      alt: "Six of Wands tarot card — Amduat Tarot deck",
    },
    {
      name: "Eight of Cups",
      slug: "eight-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/AMDUAT-TAROT/eight-of-cups.jpg",
      alt: "Eight of Cups tarot card — Amduat Tarot deck",
    },
  ],
  "maneki-tarot": [
    {
      name: "The Lovers",
      slug: "the-lovers",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/the-lovers.jpg",
      alt: "The Lovers tarot card — Maneki Tarot deck",
    },
    {
      name: "The Sun",
      slug: "the-sun",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/the-sun.jpg",
      alt: "The Sun tarot card — Maneki Tarot deck",
    },
    {
      name: "Four of Wands",
      slug: "four-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/four-of-wands.jpg",
      alt: "Four of Wands tarot card — Maneki Tarot deck",
    },
    {
      name: "Queen of Cups",
      slug: "queen-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/queen-of-cups.jpg",
      alt: "Queen of Cups tarot card — Maneki Tarot deck",
    },
  ],
  "Maneki-Tarot": [
    {
      name: "The Lovers",
      slug: "the-lovers",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/the-lovers.jpg",
      alt: "The Lovers tarot card — Maneki Tarot deck",
    },
    {
      name: "The Sun",
      slug: "the-sun",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/the-sun.jpg",
      alt: "The Sun tarot card — Maneki Tarot deck",
    },
    {
      name: "Four of Wands",
      slug: "four-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/four-of-wands.jpg",
      alt: "Four of Wands tarot card — Maneki Tarot deck",
    },
    {
      name: "Queen of Cups",
      slug: "queen-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/MANEKI-TAROT/queen-of-cups.jpg",
      alt: "Queen of Cups tarot card — Maneki Tarot deck",
    },
  ],
  "Cottagecore-Tarot": [
    {
      name: "Temperance",
      slug: "temperance",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COTTAGECORE-TAROT/temperance.jpg",
      alt: "Temperance tarot card — Cottagecore Tarot deck",
    },
    {
      name: "The Emperor",
      slug: "the-emperor",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COTTAGECORE-TAROT/the-emperor.jpg",
      alt: "The Emperor tarot card — Cottagecore Tarot deck",
    },
    {
      name: "Ace of Cups",
      slug: "ace-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COTTAGECORE-TAROT/ace-of-cups.jpg",
      alt: "Ace of Cups tarot card — Cottagecore Tarot deck",
    },
    {
      name: "Page of Cups",
      slug: "page-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/COTTAGECORE-TAROT/page-of-cups.jpg",
      alt: "Page of Cups tarot card — Cottagecore Tarot deck",
    },
  ],
  "Ravenwood-Tarot": [
    {
      name: "Death",
      slug: "death",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/RAVENWOOD-TAROT/death.jpg",
      alt: "Death tarot card — Ravenwood Tarot deck",
    },
    {
      name: "The Chariot",
      slug: "the-chariot",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/RAVENWOOD-TAROT/the-chariot.jpg",
      alt: "The Chariot tarot card — Ravenwood Tarot deck",
    },
    {
      name: "Three of Wands",
      slug: "three-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/RAVENWOOD-TAROT/three-of-wands.jpg",
      alt: "Three of Wands tarot card — Ravenwood Tarot deck",
    },
    {
      name: "Nine of Swords",
      slug: "nine-of-swords",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/RAVENWOOD-TAROT/nine-of-swords.jpg",
      alt: "Nine of Swords tarot card — Ravenwood Tarot deck",
    },
  ],
  "Underwater-Tarot": [
    {
      name: "The Hierophant",
      slug: "the-hierophant",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/UNDERWATER-TAROT/the-hierophant.jpg",
      alt: "The Hierophant tarot card — Underwater Tarot deck",
    },
    {
      name: "Two of Wands",
      slug: "two-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/UNDERWATER-TAROT/two-of-wands.jpg",
      alt: "Two of Wands tarot card — Underwater Tarot deck",
    },
    {
      name: "Four of Cups",
      slug: "four-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/UNDERWATER-TAROT/four-of-cups.jpg",
      alt: "Four of Cups tarot card — Underwater Tarot deck",
    },
    {
      name: "Knight of Pentacles",
      slug: "knight-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/UNDERWATER-TAROT/knight-of-pentacles.jpg",
      alt: "Knight of Pentacles tarot card — Underwater Tarot deck",
    },
  ],
  "Hearthside-Tarot": [
    {
      name: "The Hanged Man",
      slug: "the-hanged-man",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HEARTHSIDE-TAROT/the-hanged-man.jpg",
      alt: "The Hanged Man tarot card — Hearthside Tarot deck",
    },
    {
      name: "King of Cups",
      slug: "king-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HEARTHSIDE-TAROT/king-of-cups.jpg",
      alt: "King of Cups tarot card — Hearthside Tarot deck",
    },
    {
      name: "Six of Swords",
      slug: "six-of-swords",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HEARTHSIDE-TAROT/six-of-swords.jpg",
      alt: "Six of Swords tarot card — Hearthside Tarot deck",
    },
    {
      name: "Five of Wands",
      slug: "five-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HEARTHSIDE-TAROT/five-of-wands.jpg",
      alt: "Five of Wands tarot card — Hearthside Tarot deck",
    },
  ],
  "Dark-Botanical-Tarot": [
    {
      name: "The Devil",
      slug: "the-devil",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DARK-BOTANICAL-TAROT/the-devil.jpg",
      alt: "The Devil tarot card — Dark Botanical Tarot deck",
    },
    {
      name: "Ten of Cups",
      slug: "ten-of-cups",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DARK-BOTANICAL-TAROT/ten-of-cups.jpg",
      alt: "Ten of Cups tarot card — Dark Botanical Tarot deck",
    },
    {
      name: "Two of Pentacles",
      slug: "two-of-pentacles",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DARK-BOTANICAL-TAROT/two-of-pentacles.jpg",
      alt: "Two of Pentacles tarot card — Dark Botanical Tarot deck",
    },
    {
      name: "Page of Swords",
      slug: "page-of-swords",
      image: "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/DARK-BOTANICAL-TAROT/page-of-swords.jpg",
      alt: "Page of Swords tarot card — Dark Botanical Tarot deck",
    },
  ],
  "Hollow-Saint-Tarot": [
    {
      name: "Ace of Pentacles",
      slug: "ace-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/ace-of-pentacles.jpg",
      alt: "Ace of Pentacles tarot card — Hollow Saint Tarot deck",
    },
    {
      name: "Eight of Swords",
      slug: "eight-of-swords",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/eight-of-swords.jpg",
      alt: "Eight of Swords tarot card — Hollow Saint Tarot deck",
    },
    {
      name: "Queen of Pentacles",
      slug: "queen-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/queen-of-pentacles.jpg",
      alt: "Queen of Pentacles tarot card — Hollow Saint Tarot deck",
    },
    {
      name: "Seven of Wands",
      slug: "seven-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/seven-of-wands.jpg",
      alt: "Seven of Wands tarot card — Hollow Saint Tarot deck",
    },
  ],
  "hollow-saint-tarot": [
    {
      name: "Ace of Pentacles",
      slug: "ace-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/ace-of-pentacles.jpg",
      alt: "Ace of Pentacles tarot card — Hollow Saint Tarot deck",
    },
    {
      name: "Eight of Swords",
      slug: "eight-of-swords",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/eight-of-swords.jpg",
      alt: "Eight of Swords tarot card — Hollow Saint Tarot deck",
    },
    {
      name: "Queen of Pentacles",
      slug: "queen-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/queen-of-pentacles.jpg",
      alt: "Queen of Pentacles tarot card — Hollow Saint Tarot deck",
    },
    {
      name: "Seven of Wands",
      slug: "seven-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/seven-of-wands.jpg",
      alt: "Seven of Wands tarot card — Hollow Saint Tarot deck",
    },
  ],
  "Solarpunk-Tarot": [
    {
      name: "Eight of Pentacles",
      slug: "eight-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/SOLARPUNK-TAROT/eight-of-pentacles.jpg",
      alt: "Eight of Pentacles tarot card — Solarpunk Tarot deck",
    },
    {
      name: "Four of Swords",
      slug: "four-of-swords",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/SOLARPUNK-TAROT/four-of-swords.jpg",
      alt: "Four of Swords tarot card — Solarpunk Tarot deck",
    },
    {
      name: "Nine of Pentacles",
      slug: "nine-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/SOLARPUNK-TAROT/nine-of-pentacles.jpg",
      alt: "Nine of Pentacles tarot card — Solarpunk Tarot deck",
    },
    {
      name: "Ten of Wands",
      slug: "ten-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/SOLARPUNK-TAROT/ten-of-wands.jpg",
      alt: "Ten of Wands tarot card — Solarpunk Tarot deck",
    },
    {
      name: "Three of Pentacles",
      slug: "three-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/SOLARPUNK-TAROT/three-of-pentacles.jpg",
      alt: "Three of Pentacles tarot card — Solarpunk Tarot deck",
    },
  ],
  "wanderers-tarot": [
    {
      name: "Eight of Wands",
      slug: "eight-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/eight-of-wands.jpg",
      alt: "Eight of Wands tarot card — Wanderers Tarot deck",
    },
    {
      name: "Nine of Wands",
      slug: "nine-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/nine-of-wands.jpg",
      alt: "Nine of Wands tarot card — Wanderers Tarot deck",
    },
    {
      name: "Four of Pentacles",
      slug: "four-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/four-of-pentacles.jpg",
      alt: "Four of Pentacles tarot card — Wanderers Tarot deck",
    },
    {
      name: "Page of Wands",
      slug: "page-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/page-of-wands.jpg",
      alt: "Page of Wands tarot card — Wanderers Tarot deck",
    },
  ],
  "Wanderers-Tarot": [
    {
      name: "Eight of Wands",
      slug: "eight-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/eight-of-wands.jpg",
      alt: "Eight of Wands tarot card — Wanderers Tarot deck",
    },
    {
      name: "Nine of Wands",
      slug: "nine-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/nine-of-wands.jpg",
      alt: "Nine of Wands tarot card — Wanderers Tarot deck",
    },
    {
      name: "Four of Pentacles",
      slug: "four-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/four-of-pentacles.jpg",
      alt: "Four of Pentacles tarot card — Wanderers Tarot deck",
    },
    {
      name: "Page of Wands",
      slug: "page-of-wands",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/WANDERERS-TAROT/page-of-wands.jpg",
      alt: "Page of Wands tarot card — Wanderers Tarot deck",
    },
  ],
  "Traditional-Tarot": [
    {
      name: "The Hanged Man",
      slug: "the-hanged-man",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/TRADITIONAL-TAROT/the-hanged-man.jpg",
      alt: "The Hanged Man tarot card — Traditional Tarot deck",
    },
    {
      name: "The World",
      slug: "the-world",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/TRADITIONAL-TAROT/the-world.jpg",
      alt: "The World tarot card — Traditional Tarot deck",
    },
    {
      name: "King of Pentacles",
      slug: "king-of-pentacles",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/TRADITIONAL-TAROT/king-of-pentacles.jpg",
      alt: "King of Pentacles tarot card — Traditional Tarot deck",
    },
    {
      name: "Five of Cups",
      slug: "five-of-cups",
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/TRADITIONAL-TAROT/five-of-cups.jpg",
      alt: "Five of Cups tarot card — Traditional Tarot deck",
    },
    {
      name: "Knight of Swords",
      slug: "knight-of-swords",
      // `knight-of-swords.jpg` returns 400 in the bucket; the PNG works.
      image:
        "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/TRADITIONAL-TAROT/knight-of-swords.png",
      alt: "Knight of Swords tarot card — Traditional Tarot deck",
    },
  ],
};

const DEFAULT_CARDS = [
  { name: "The Star", slug: "the-star", image: "/images/the-star.jpg", alt: "The Star tarot card meaning" },
  { name: "The Moon", slug: "the-moon", image: "/images/the-moon.jpg", alt: "The Moon tarot card meaning" },
  { name: "The Magician", slug: "the-magician", image: "/images/the-magician.jpg", alt: "The Magician tarot card meaning" },
  { name: "The Fool", slug: "the-fool", image: "/images/the-fool.jpg", alt: "The Fool tarot card meaning" },
];

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const template = await getTemplateBySlug(params.slug);

  if (!template) {
    return { title: "Template Not Found" };
  }

  const templateTitle = template.name + " - Tarot Card Template | TarotCardTemplates.com";
  const templateDescription = template.description + " Download print-ready tarot deck templates. 78 card fronts included. Perfect for professional tarot readers and deck creators.";
  const previewUrls = getTemplatePreviewImages(template);
  const thumbnailUrl = previewUrls[0] ?? "";

  return {
    title: templateTitle,
    description: templateDescription,
    keywords: [
      "tarot card template",
      "tarot deck template",
      "printable tarot cards",
      "custom tarot deck",
      template.name,
      "tarot design template",
      "professional tarot cards",
      "print ready tarot template",
      "commercial use tarot deck",
    ],
    openGraph: {
      title: templateTitle,
      description: templateDescription,
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: template.name + " tarot deck preview",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: templateTitle,
      description: templateDescription,
      images: [thumbnailUrl],
    },
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = await getTemplateBySlug(params.slug);

  if (!template) {
    notFound();
  }

  const physicalDeckImage = "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/" + template.slug.toUpperCase() + "/physical-deck.png";

  const hollowSaintPrintedDeckSrc =
    "https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/HOLLOW-SAINT-TAROT/physical-deck.png";
  const isHollowSaintTemplate =
    template.slug === "hollow-saint" || template.slug === "hollow-saint-tarot";

  const slugKey = template.slug as keyof typeof TEMPLATE_CARD_SPOTLIGHTS;
  const spotlightCards = TEMPLATE_CARD_SPOTLIGHTS[slugKey] ?? DEFAULT_CARDS;
  const isSolarpunkTarotSpotlight = template.slug === "Solarpunk-Tarot";
  const isTraditionalTarotSpotlight = template.slug === "Traditional-Tarot";

  const jsonLdItems = spotlightCards.map((card, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: card.name + " Tarot Meaning",
    url: "https://www.tarotcardtemplates.com/card-meanings/" + card.slug,
  }));

  return (
    <>
      <article className="grid gap-10 lg:grid-cols-2">
        <section>
          <TemplateGallery images={getTemplatePreviewImages(template)} templateName={template.name} />
          <h1 className="mt-8 text-4xl font-semibold">
            {template.name}
          </h1>
          {template.seoHeading ? (
            <>
              <h2 className="mt-6 text-xl font-semibold">
                {template.seoHeading}
              </h2>
              <p className="mt-3 text-charcoal/80">
                {template.seoDescription}
              </p>
              {template.seoPerfectFor && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Perfect for:</h3>
                  <ul className="space-y-1 text-sm text-charcoal/80">
                    {template.seoPerfectFor.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {template.seoSymbolismHeading && (
                <div className="mt-10 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      {template.seoSymbolismHeading}
                    </h3>
                    <p className="text-charcoal/80">{template.seoSymbolismBody}</p>
                  </div>
                  {template.seoCardSpotlightHeading && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {template.seoCardSpotlightHeading}
                      </h3>
                      <p className="text-charcoal/80 mb-3">
                        {template.seoCardSpotlightBody}
                      </p>
                      {template.seoCardSpotlightLink && (
                        <Link
                          href={template.seoCardSpotlightLink}
                          className="inline-block text-sm text-charcoal underline underline-offset-4 hover:text-charcoal/60 transition-colors"
                        >
                          Explore the full interpretation →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mt-3 text-charcoal/80">
                {template.description}
              </p>
              <p className="mt-4 text-sm">
                {template.styleNote}
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {template.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside className="space-y-6">
          <div className="border border-charcoal/15 bg-white p-6">
            <h2 className="text-xl font-semibold">Purchase options</h2>
            <div className="mt-6 space-y-4">
              <form action="/api/checkout" method="post" className="space-y-2 border border-charcoal/10 p-4">
                <input type="hidden" name="templateSlug" value={template.slug} />
                <input type="hidden" name="purchaseType" value="template" />
                <p className="font-medium">Buy template (${template.templatePrice.toFixed(2)})</p>
                <button
                  type="submit"
                  className="w-full border border-charcoal bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/90 transition-colors"
                >
                  Continue to checkout
                </button>
                <p className="mt-2 text-sm text-neutral-500">
                  Instant digital download. Print-ready files included.
                </p>
              </form>

              <div className="border border-charcoal/10 p-4 overflow-hidden">
                <p className="mb-3 text-sm font-medium text-charcoal/70">The Printed Deck</p>
                <div className="overflow-hidden mb-3">
                  {isHollowSaintTemplate ? (
                    <HollowSaintPhysicalDeckImage
                      primarySrc={hollowSaintPrintedDeckSrc}
                      fallbackSrc={template.previewImages?.[0]}
                      alt={template.name + " printed tarot deck with premium card stock"}
                      className="w-full h-auto transition-transform duration-300 hover:scale-110 cursor-pointer"
                    />
                  ) : (
                    <img
                      src={physicalDeckImage}
                      alt={template.name + " printed tarot deck with premium card stock"}
                      className="w-full h-auto transition-transform duration-300 hover:scale-110 cursor-pointer"
                    />
                  )}
                </div>
                <p className="text-xs text-charcoal/60">
                  Professionally printed with premium card stock and luxe finishes
                </p>
              </div>

              <div className="border border-charcoal/10 p-4 bg-white">
                <h3 className="text-sm font-semibold mb-3">About the Printed Deck</h3>
                <ul className="space-y-1 text-xs text-charcoal/80">
                  <li>• Premium 300gsm card stock</li>
                  <li>• 350gsm printed tuck box included</li>
                  <li>• Complete 78-card deck</li>
                  <li>• Standard size: 70 x 120mm</li>
                  <li>• Professional print quality</li>
                </ul>
              </div>

              <form action="/api/checkout" method="post" className="space-y-2 border border-charcoal/10 p-4">
                <input type="hidden" name="templateSlug" value={template.slug} />
                <input type="hidden" name="purchaseType" value="print" />
                <p className="font-medium">Buy printed deck from template (${template.printPrice.toFixed(2)})</p>
                <button
                  type="submit"
                  className="w-full border-2 border-charcoal bg-white px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Continue to checkout
                </button>
                <p className="mt-2 text-sm text-neutral-500">
                  Professionally printed and shipped.
                </p>
              </form>
            </div>
            <Link href="/how-it-works" className="mt-6 inline-block text-sm underline underline-offset-4">
              Review how purchasing works
            </Link>
          </div>

          <div className="border border-charcoal/15 bg-cream p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>&#10024;</span>
              <span>Use This Deck With TheNextCard.app</span>
            </h3>
            <p className="mt-3 text-sm text-charcoal/80">Power your printed deck with AI-assisted readings.</p>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
              <li>• Ask questions and select your drawn cards</li>
              <li>• Get deeper interpretations instantly</li>
              <li>• Reflect and save readings in your journal</li>
            </ul>
            <div className="mt-6 flex justify-center">
              <img
                src="https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/shared/thenextcard-mockup.png"
                alt="TheNextCard.app interface"
                className="w-48 h-auto"
              />
            </div>
            <Link
              href="https://www.thenextcard.app"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block w-full text-center border border-charcoal bg-charcoal px-5 py-3 text-sm text-cream hover:bg-charcoal/90 transition-colors"
            >
              Explore the AI Companion →
            </Link>
          </div>
        </aside>
      </article>

      {/* Tarot Card Meanings Section */}
      <section className="mt-16 mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-[#C7A96B] text-sm">&#10022;&#8212;&#8212;&#10022;</span>
          <h2 className="text-xl font-semibold tracking-wide text-charcoal">
            Explore Tarot Card Meanings
          </h2>
          <span className="text-[#C7A96B] text-sm">&#10022;&#8212;&#8212;&#10022;</span>
        </div>
        <p className="text-sm text-charcoal/70 mb-8 max-w-lg mx-auto">
          Tarot cards carry symbolic meaning used in divination and storytelling. Explore the interpretations behind some of the cards in this deck.
        </p>
        <div
          className={
            isSolarpunkTarotSpotlight || isTraditionalTarotSpotlight
              ? "meanings-grid meanings-grid--five"
              : "meanings-grid"
          }
        >
          {spotlightCards.map((card) => (
            <Link
              key={card.slug}
              href={"/card-meanings/" + card.slug}
              className="meaning-card group flex flex-col items-center gap-2"
            >
              <div className="relative">
                <img
                  src={card.image}
                  alt={card.alt}
                  className="rounded-md object-cover transition-transform duration-200 group-hover:-translate-y-1"
                />
                <div
                  className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ border: "2px solid #C7A96B", borderRadius: "7px" }}
                />
              </div>
              <span className="text-xs text-charcoal/70 text-center leading-tight">
                {card.name} Tarot Meaning
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/card-meanings"
            className="text-sm text-charcoal underline underline-offset-4 hover:text-charcoal/60 transition-colors"
          >
            View All Tarot Card Meanings →
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Tarot Card Meanings",
            description: "Explore the symbolic meanings behind classic tarot cards used in divination and storytelling.",
            url: "https://www.tarotcardtemplates.com/card-meanings",
            itemListElement: jsonLdItems,
          }),
        }}
      />

      {/* Sticky Mobile Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-charcoal/20 p-3 lg:hidden z-50 shadow-lg">
        <div className="max-w-md mx-auto flex gap-2">
          <form action="/api/checkout" method="post" className="flex-1">
            <input type="hidden" name="templateSlug" value={template.slug} />
            <input type="hidden" name="purchaseType" value="template" />
            <button
              type="submit"
              className="w-full bg-charcoal text-cream py-3 px-3 text-xs font-semibold hover:bg-charcoal/90 transition-colors"
            >
              Template ${template.templatePrice.toFixed(2)}
            </button>
          </form>
          <form action="/api/checkout" method="post" className="flex-1">
            <input type="hidden" name="templateSlug" value={template.slug} />
            <input type="hidden" name="purchaseType" value="print" />
            <button
              type="submit"
              className="w-full border-2 border-charcoal bg-white text-charcoal py-3 px-3 text-xs font-semibold hover:bg-charcoal hover:text-cream transition-colors"
            >
              Printed ${template.printPrice.toFixed(2)}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
