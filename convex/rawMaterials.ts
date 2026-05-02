import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rawMaterials").collect();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rawMaterials")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    qtyPerPackage: v.number(),
    unit: v.string(),
    packageCost: v.number(),
    unitCost: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rawMaterials")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (existing) {
      throw new Error(`Material with code ${args.code} already exists`);
    }
    return await ctx.db.insert("rawMaterials", {
      code: args.code,
      name: args.name,
      qtyPerPackage: args.qtyPerPackage,
      unit: args.unit,
      packageCost: args.packageCost,
      unitCost: args.unitCost,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("rawMaterials"),
    name: v.string(),
    qtyPerPackage: v.number(),
    unit: v.string(),
    packageCost: v.number(),
    unitCost: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name,
      qtyPerPackage: args.qtyPerPackage,
      unit: args.unit,
      packageCost: args.packageCost,
      unitCost: args.unitCost,
    });
  },
});

export const remove = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const material = await ctx.db
      .query("rawMaterials")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (material) {
      await ctx.db.delete(material._id);
    }
    return null;
  },
});
