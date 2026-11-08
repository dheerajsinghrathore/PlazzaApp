import catalogData from '../data/catalog.json';

export type Medicine = {
  id: string;
  name: string;
  salt: string;
  price: number;
  maxQty: number;
  rx: boolean;
};

export const medicines: Medicine[] = catalogData;

export const searchMedicines = (query: string): Medicine[] => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return medicines.filter(medicine =>
    `${medicine.name} ${medicine.salt}`
      .toLocaleLowerCase()
      .includes(normalized),
  );
};
