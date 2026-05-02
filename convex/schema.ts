import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  rawMaterials: defineTable({
    code: v.string(),
    name: v.string(),
    qtyPerPackage: v.number(),
    unit: v.string(),
    packageCost: v.number(),
    unitCost: v.number(),
  }).index("by_code", ["code"]),

  recipes: defineTable({
    name: v.string(),
    finalQty: v.number(),
    finalUnit: v.string(),
    materials: v.array(
      v.object({
        materialCode: v.string(),
        name: v.string(),
        unitCost: v.number(),
        qtyUsed: v.number(),
        unit: v.string(),
        itemCost: v.number(),
      })
    ),
    totalCost: v.number(),
    profitMargin: v.number(),
    suggestedPrice: v.number(),
  }),
});

export default schema;
