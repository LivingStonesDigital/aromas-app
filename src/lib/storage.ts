import { RawMaterial, Recipe } from "./types";

const RAW_KEY = "calc_raw_materials";
const RECIPE_KEY = "calc_recipes";

export function loadRawMaterials(): RawMaterial[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RAW_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRawMaterials(list: RawMaterial[]) {
  localStorage.setItem(RAW_KEY, JSON.stringify(list));
}

export function loadRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECIPE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecipes(list: Recipe[]) {
  localStorage.setItem(RECIPE_KEY, JSON.stringify(list));
}
