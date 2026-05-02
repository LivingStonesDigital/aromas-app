import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").collect();
  },
});

export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Validate inputs to avoid negative costs or margins
    if (args.totalCost < 0) throw new Error("totalCost não pode ser negativo");
    if (args.profitMargin < 0) throw new Error("profitMargin não pode ser negativo");
    // Margin here is treated as markup over the totalCost
    // so price is computed as totalCost * (1 + profitMargin)
    const computedSuggestedPrice = args.totalCost * (1 + args.profitMargin);
    return await ctx.db.insert("recipes", {
      name: args.name,
      finalQty: args.finalQty,
      finalUnit: args.finalUnit,
      materials: args.materials,
      totalCost: args.totalCost,
      profitMargin: args.profitMargin,
      suggestedPrice: computedSuggestedPrice,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("recipes"),
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
  },
  handler: async (ctx, args) => {
    // Validate inputs to avoid negative costs or margins
    if (args.totalCost < 0) throw new Error("totalCost não pode ser negativo");
    if (args.profitMargin < 0) throw new Error("profitMargin não pode ser negativo");
    // Recompute the price based on the new totalCost and profitMargin
    const computedSuggestedPrice = args.totalCost * (1 + args.profitMargin);
    return await ctx.db.patch(args.id, {
      name: args.name,
      finalQty: args.finalQty,
      finalUnit: args.finalUnit,
      materials: args.materials,
      totalCost: args.totalCost,
      profitMargin: args.profitMargin,
      suggestedPrice: computedSuggestedPrice,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
