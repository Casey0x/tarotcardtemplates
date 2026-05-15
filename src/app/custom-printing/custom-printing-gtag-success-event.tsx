'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type CustomPrintingSuccessEvent = 'purchase' | 'quote_request';

export function CustomPrintingGtagSuccessEvent({
  eventName,
}: {
  eventName: CustomPrintingSuccessEvent;
}) {
  useEffect(() => {
    window.gtag?.('event', eventName, { event_category: 'custom_printing' });
  }, [eventName]);

  return null;
}
