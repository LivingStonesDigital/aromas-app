export interface RawMaterial {
  code: string;
  name: string;
  qtyPerPackage: number;
  unit: string;
  packageCost: number;
  unitCost: number;
}

export interface RecipeMaterial {
  materialCode: string;
  name: string;
  unitCost: number;
  qtyUsed: number;
  unit: string;
  itemCost: number;
}

export interface Recipe {
  id: string;
  name: string;
  finalQty: number;
  finalUnit: string;
  materials: RecipeMaterial[];
  totalCost: number;
  profitMargin: number;
  suggestedPrice: number;
}
