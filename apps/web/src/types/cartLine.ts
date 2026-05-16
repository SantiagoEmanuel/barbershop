export type CartLine =
  | {
      kind: "product";
      id: string;
      name: string;
      price: number;
      quantity: number;
      stock: number;
    }
  | {
      kind: "service";
      id: string;
      name: string;
      price: number;
      quantity: number;
    };
