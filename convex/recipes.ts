import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { computeSuggestedPrice } from "./utils/pricing";

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
    preserveSuggestedPrice: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate inputs to avoid negative costs or margins
    if (args.totalCost < 0) throw new Error("totalCost não pode ser negativo");
    if (args.profitMargin < 0) throw new Error("profitMargin não pode ser negativo");
    // Compute or preserve suggestedPrice based on flag (default: compute on backend)
    const preserveSuggestedPrice = (args as any).preserveSuggestedPrice === true;
    let computedSuggestedPrice: number;
    if (preserveSuggestedPrice && typeof (args as any).suggestedPrice === "number") {
      computedSuggestedPrice = (args as any).suggestedPrice;
    } else {
      computedSuggestedPrice = computeSuggestedPrice(args.totalCost, args.profitMargin);
    }
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
    preserveSuggestedPrice: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate inputs to avoid negative costs or margins
    if (args.totalCost < 0) throw new Error("totalCost não pode ser negativo");
    if (args.profitMargin < 0) throw new Error("profitMargin não pode ser negativo");
    // Compute or preserve suggestedPrice based on flag (default: compute on backend)
    const preserveSuggestedPrice = (args as any).preserveSuggestedPrice === true;
    let computedSuggestedPrice: number;
    if (preserveSuggestedPrice && typeof (args as any).suggestedPrice === "number") {
      computedSuggestedPrice = (args as any).suggestedPrice;
    } else {
      computedSuggestedPrice = computeSuggestedPrice(args.totalCost, args.profitMargin);
    }
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

// Bulk recompute suggestedPrice for all recipes based on totalCost and normalized profitMargin
export const recalculateAllPrices = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("recipes").collect();
    const updates = all.map((r) => {
      const totalCost = typeof (r as any).totalCost === "number" ? (r as any).totalCost : 0;
      const price = computeSuggestedPrice(totalCost, (r as any).profitMargin);
      // Use runtime _id field to patch correct record
      // @ts-ignore
      return ctx.db.patch((r as any)._id, { suggestedPrice: price });
    });
    await Promise.all(updates);
    return { updated: updates.length };
  },
});
