export type PrintOrder = {
  id: string;
  templateSlug: string;
  status: 'ordered';
  createdAt: string;
};

const printOrders: PrintOrder[] = [];

export function createPrintOrder(templateSlug: string): PrintOrder {
  const order = {
    id: `po_${Math.random().toString(36).slice(2, 10)}`,
    templateSlug,
    status: 'ordered' as const,
    createdAt: new Date().toISOString()
  };

  printOrders.push(order);
  return order;
}

export function listPrintOrders() {
  return printOrders;
}
