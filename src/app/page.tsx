"use client";

import { useState, useCallback } from "react";

import type { RecipeMaterial } from "../lib/types";
import { useGetRawMaterials } from "@/features/rawMaterials/getAll";
import { useCreateRawMaterial } from "@/features/rawMaterials/create";
import { useUpdateRawMaterial } from "@/features/rawMaterials/update";
import { useRemoveRawMaterial } from "@/features/rawMaterials/remove";
import { useGetRecipes } from "@/features/recipes/getAll";
import { useCreateRecipe } from "@/features/recipes/create";
import { useUpdateRecipe } from "@/features/recipes/update";
import { useRemoveRecipe } from "@/features/recipes/remove";

type Tab = "materials" | "recipes";

export default function Home() {
  const [tab, setTab] = useState<Tab>("materials");

  // Convex hooks - Materials
  const { data: materials = [], isLoading: materialsLoading } = useGetRawMaterials();
  const { mutate: createMat, isPending: isCreatingMat } = useCreateRawMaterial();
  const { mutate: updateMat, isPending: isUpdatingMat } = useUpdateRawMaterial();
  const { mutate: removeMat, isPending: isRemovingMat } = useRemoveRawMaterial();

  // Convex hooks - Recipes
  const { data: recipes = [], isLoading: recipesLoading } = useGetRecipes();
  const { mutate: createRecipe, isPending: isCreatingRecipe } = useCreateRecipe();
  const { mutate: updateRecipe, isPending: isUpdatingRecipe } = useUpdateRecipe();
  const { mutate: removeRecipe, isPending: isRemovingRecipe } = useRemoveRecipe();

  // Material form
  const [mCode, setMCode] = useState("");
  const [mName, setMName] = useState("");
  const [mQty, setMQty] = useState("");
  const [mUnit, setMUnit] = useState("");
  const [mCost, setMCost] = useState("");
  const [editingMatId, setEditingMatId] = useState<string | null>(null);

  // Recipe form
  const [rName, setRName] = useState("");
  const [rFinalQty, setRFinalQty] = useState("");
  const [rFinalUnit, setRFinalUnit] = useState("");
  const [rMargin, setRMargin] = useState("");
  const [rMaterials, setRMaterials] = useState<RecipeMaterial[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // Recipe material input
  const [rmCode, setRmCode] = useState("");
  const [rmQty, setRmQty] = useState("");

  const unitCost = mQty && mCost ? Number(mCost) / Number(mQty) : 0;

  const resetMatForm = useCallback(() => {
    setMCode(""); setMName(""); setMQty(""); setMUnit(""); setMCost(""); setEditingMatId(null);
  }, []);

  const handleSaveMat = async () => {
    if (!mCode || !mName || !mQty || !mUnit || !mCost) return;
    const matData = {
      code: mCode,
      name: mName,
      qtyPerPackage: Number(mQty),
      unit: mUnit,
      packageCost: Number(mCost),
      unitCost: Number(mCost) / Number(mQty),
    };
    if (editingMatId) {
      await updateMat({ id: editingMatId as any, ...matData });
    } else {
      await createMat(matData);
    }
    resetMatForm();
  };

  const handleEditMat = (mat: any) => {
    setMCode(mat.code); setMName(mat.name); setMQty(String(mat.qtyPerPackage));
    setMUnit(mat.unit); setMCost(String(mat.packageCost)); setEditingMatId(mat._id);
    setTab("materials");
  };

  const handleDeleteMat = async (mat: any) => {
    await removeMat({ code: mat.code });
  };

  const findMaterial = (code: string) => materials.find(m => m.code === code);

  const handleAddRMaterial = () => {
    if (!rmCode || !rmQty) return;
    const mat = findMaterial(rmCode);
    if (!mat) return;
    const qtyUsed = Number(rmQty);
    const itemCost = qtyUsed * mat.unitCost;
    setRMaterials([...rMaterials, {
      materialCode: mat.code,
      name: mat.name,
      unitCost: mat.unitCost,
      qtyUsed: qtyUsed,
      unit: mat.unit,
      itemCost,
    }]);
    setRmCode(""); setRmQty("");
  };

  const handleRemoveRMaterial = (idx: number) => {
    setRMaterials(rMaterials.filter((_, i) => i !== idx));
  };

  const recipeTotal = rMaterials.reduce((s, rm) => s + rm.itemCost, 0);

  const suggestedPrice = (() => {
    const margin = Number(rMargin) || 0;
    if (recipeTotal === 0) return 0;
    if (margin >= 100) return Infinity;
    return recipeTotal / (1 - margin / 100);
  })();

  const resetRecipeForm = useCallback(() => {
    setRName(""); setRFinalQty(""); setRFinalUnit(""); setRMargin("");
    setRMaterials([]); setEditingRecipeId(null);
  }, []);

  const handleSaveRecipe = async () => {
    if (!rName || !rFinalQty || !rFinalUnit) return;
    const recipeData = {
      name: rName,
      finalQty: Number(rFinalQty),
      finalUnit: rFinalUnit,
      materials: rMaterials,
      totalCost: recipeTotal,
      profitMargin: Number(rMargin) || 0,
      suggestedPrice,
    };
    if (editingRecipeId) {
      await updateRecipe({ id: editingRecipeId as any, ...recipeData });
    } else {
      await createRecipe(recipeData);
    }
    resetRecipeForm();
  };

  const handleEditRecipe = (recipe: any) => {
    setRName(recipe.name);
    setRFinalQty(String(recipe.finalQty));
    setRFinalUnit(recipe.finalUnit);
    setRMargin(String(recipe.profitMargin ?? recipe.profitMargin));
    setRMaterials(recipe.materials);
    setEditingRecipeId(recipe._id);
    setTab("recipes");
  };

  const handleDeleteRecipe = async (id: string) => {
    await removeRecipe({ id: id as any });
  };

  return (
    <main className="min-h-screen bg-neo-bg text-neo-ink relative overflow-hidden">
      {/* Background textures */}
      <div className="fixed inset-0 pointer-events-none bg-halftone z-0" />
      <div className="fixed inset-0 pointer-events-none bg-grid z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <section className="pt-20 pb-12 md:pt-32 md:pb-20 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="relative rotate-sticker">
              <h1
                className="text-7xl sm:text-8xl md:text-9xl font-bold uppercase tracking-tighter leading-none"
                style={{ WebkitTextStroke: "3px #000", color: "transparent" }}
              >
                AROMAS
              </h1>
              <div className="absolute -top-4 -right-4 bg-neo-accent border-4 border-neo-ink p-2 rotate-3 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-sm font-bold uppercase tracking-widest text-white">v2.0</span>
              </div>
            </div>
            <div className="bg-neo-secondary border-4 border-neo-ink p-4 shadow-[8px_8px_0px_0px_#000] rotate-sticker-r max-w-md">
              <p className="text-lg font-bold leading-relaxed">
                Controle de custos de produção de <span className="bg-neo-accent text-white px-1">aromatizadores</span>.
                Gerencie matérias-primas e calcule preços.
                <span className="block mt-2 text-sm font-bold uppercase tracking-widest bg-neo-ink text-white inline-block px-2">
                  powered by convex
                </span>
              </p>
            </div>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="h-2 w-24 bg-neo-ink" />
            <div className="h-2 w-2 bg-neo-ink rotate-3" />
            <div className="h-2 w-2 bg-neo-accent rotate-1" />
            <div className="h-2 w-2 bg-neo-muted -rotate-2" />
          </div>
        </section>

        <hr className="hr-thick" />

        {/* Tabs */}
        <section className="py-8 md:py-12">
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={() => { setTab("materials"); resetRecipeForm(); resetMatForm(); }}
              className={`px-8 py-4 font-bold text-sm uppercase tracking-widest border-4 border-neo-ink transition-all duration-100 ${
                tab === "materials"
                  ? "bg-neo-ink text-neo-white shadow-[6px_6px_0px_0px_#000]"
                  : "bg-neo-white shadow-[4px_4px_0px_0px_#000] hover:bg-neo-secondary hover:shadow-[6px_6px_0px_0px_#000]"
              } active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`}
            >
              Matérias-Primas
            </button>
            <button
              onClick={() => { setTab("recipes"); resetRecipeForm(); resetMatForm(); }}
              className={`px-8 py-4 font-bold text-sm uppercase tracking-widest border-4 border-neo-ink transition-all duration-100 ${
                tab === "recipes"
                  ? "bg-neo-ink text-neo-white shadow-[6px_6px_0px_0px_#000]"
                  : "bg-neo-white shadow-[4px_4px_0px_0px_#000] hover:bg-neo-secondary hover:shadow-[6px_6px_0px_0px_#000]"
              } active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`}
            >
              Receitas
            </button>
          </div>

          {/* Materials Tab */}
          {tab === "materials" && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
                  {editingMatId ? "Editar" : "Nova"}
                </h2>
                <div className="bg-neo-accent border-4 border-neo-ink p-3 rotate-3 shadow-[4px_4px_0px_0px_#000]">
                  <span className="text-2xl font-bold text-white">+</span>
                </div>
              </div>

              <div className="card mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Código</label>
                    <input
                      value={mCode}
                      onChange={e => setMCode(e.target.value)}
                      placeholder="MP001"
                      disabled={!!editingMatId}
                      className={editingMatId ? "opacity-50" : ""}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Nome do Produto</label>
                    <input
                      value={mName}
                      onChange={e => setMName(e.target.value)}
                      placeholder="Álcool Etílico"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Qtd por Embalagem</label>
                    <input
                      type="number"
                      value={mQty}
                      onChange={e => setMQty(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Unidade</label>
                    <input
                      value={mUnit}
                      onChange={e => setMUnit(e.target.value)}
                      placeholder="ml, g, un"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Valor da Embalagem (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mCost}
                      onChange={e => setMCost(e.target.value)}
                      placeholder="25.00"
                    />
                  </div>
                </div>

                {unitCost > 0 && (
                  <div className="bg-neo-muted border-4 border-neo-ink p-6 mb-8 shadow-[4px_4px_0px_0px_#000] rotate-sticker-r">
                    <div className="font-bold text-xs uppercase tracking-widest mb-2">Custo Unitário Calculado</div>
                    <div className="text-3xl font-bold">
                      R$ {unitCost.toFixed(4)} <span className="text-lg">/ {mUnit || "unidade"}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="btn-primary active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                    onClick={handleSaveMat}
                    disabled={isCreatingMat || isUpdatingMat}
                  >
                    {editingMatId ? "ATUALIZAR" : "CADASTRAR"} →
                  </button>
                  {editingMatId && (
                    <button className="btn-secondary active:translate-x-[6px] active:translate-y-[6px] active:shadow-none" onClick={resetMatForm}>
                      CANCELAR
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8 rotate-sticker">
                Cadastradas
              </h3>

              {materialsLoading ? (
                <div className="card text-center py-16">
                  <p className="text-xl font-bold italic opacity-40">Carregando...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="card text-center py-16">
                  <p className="text-xl font-bold italic opacity-40">Nenhuma matéria-prima cadastrada ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Qtd Emb.</th>
                        <th>Unid.</th>
                        <th>Valor Emb. (R$)</th>
                        <th>Custo Unit. (R$)</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map(m => (
                        <tr key={m._id}>
                          <td className="font-mono font-bold">{m.code}</td>
                          <td className="font-bold">{m.name}</td>
                          <td>{m.qtyPerPackage}</td>
                          <td className="font-mono font-bold">{m.unit}</td>
                          <td>R$ {m.packageCost.toFixed(2)}</td>
                          <td className="font-mono font-bold">R$ {m.unitCost.toFixed(4)}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" onClick={() => handleEditMat(m)}>Editar</button>
                              <button className="btn-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" onClick={() => handleDeleteMat(m)}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recipes Tab */}
          {tab === "recipes" && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
                  {editingRecipeId ? "Editar" : "Nova"}
                </h2>
                <div className="bg-neo-muted border-4 border-neo-ink p-3 -rotate-2 shadow-[4px_4px_0px_0px_#000]">
                  <span className="text-2xl font-bold">♡</span>
                </div>
              </div>

              <div className="card mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Nome da Receita</label>
                    <input
                      value={rName}
                      onChange={e => setRName(e.target.value)}
                      placeholder="Aromatizador Lavanda"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Qtd Final</label>
                    <input
                      type="number"
                      value={rFinalQty}
                      onChange={e => setRFinalQty(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Unidade</label>
                    <input
                      value={rFinalUnit}
                      onChange={e => setRFinalUnit(e.target.value)}
                      placeholder="ml, un"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Margem de Lucro (%)</label>
                    <input
                      type="number"
                      value={rMargin}
                      onChange={e => setRMargin(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>

                <hr className="hr-thin" />

                <h4 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-6 rotate-sticker-r">
                  Materiais da Receita
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Código da Matéria</label>
                    <input
                      value={rmCode}
                      onChange={e => setRmCode(e.target.value)}
                      placeholder="Código"
                      list="material-codes"
                    />
                    <datalist id="material-codes">
                      {materials.map(m => (
                        <option key={m._id} value={m.code} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-widest mb-2">Quantidade Usada</label>
                    <input
                      type="number"
                      value={rmQty}
                      onChange={e => setRmQty(e.target.value)}
                      placeholder="Qtd"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn-secondary w-full active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                      onClick={handleAddRMaterial}
                    >
                      + ADICIONAR
                    </button>
                  </div>
                </div>

                {rmCode && (() => {
                  const mat = findMaterial(rmCode);
                  if (!mat) return null;
                  return (
                    <div className="bg-neo-secondary border-4 border-neo-ink p-4 mb-6 shadow-[4px_4px_0px_0px_#000] rotate-sticker">
                      <span className="font-bold text-sm uppercase tracking-widest">Selecionado: </span>
                      <span className="font-bold">{mat.name}</span>
                      <span className="font-mono text-sm ml-4">R$ {mat.unitCost.toFixed(4)} / {mat.unit}</span>
                    </div>
                  );
                })()}

                {rMaterials.length > 0 && (
                  <div className="overflow-x-auto mb-8">
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nome</th>
                          <th>Qtd Usada</th>
                          <th>Unid.</th>
                          <th>Custo Unit. (R$)</th>
                          <th>Valor Gasto (R$)</th>
                          <th>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rMaterials.map((rm, idx) => (
                          <tr key={idx}>
                            <td className="font-mono font-bold">{rm.materialCode}</td>
                            <td className="font-bold">{rm.name}</td>
                            <td>{rm.qtyUsed}</td>
                            <td className="font-mono font-bold">{rm.unit}</td>
                            <td className="font-mono font-bold">R$ {rm.unitCost.toFixed(4)}</td>
                            <td className="font-mono font-bold">R$ {rm.itemCost.toFixed(2)}</td>
                            <td>
                              <button className="btn-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" onClick={() => handleRemoveRMaterial(idx)}>Remover</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rMaterials.length > 0 && (
                  <div className="border-4 border-neo-ink bg-neo-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] rotate-sticker-r">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div>
                        <div className="font-bold text-xs uppercase tracking-widest mb-2">Custo Total</div>
                        <div className="text-3xl sm:text-4xl font-bold">R$ {recipeTotal.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-bold text-xs uppercase tracking-widest mb-2">Margem</div>
                        <div className="text-3xl sm:text-4xl font-bold">{rMargin || 0}%</div>
                      </div>
                      <div>
                        <div className="font-bold text-xs uppercase tracking-widest mb-2">Preço Sugerido</div>
                        <div className="text-3xl sm:text-4xl font-bold bg-neo-accent text-white px-2 inline-block" style={{fontSize: suggestedPrice > 999 ? "1.5rem" : undefined}}>
                          {suggestedPrice === Infinity ? "∞ (margem 100%)" : `R$ ${suggestedPrice.toFixed(2)}`}
                        </div>
                      </div>
                      {rFinalQty && (
                        <div>
                          <div className="font-bold text-xs uppercase tracking-widest mb-2">Custo / Unidade</div>
                          <div className="text-3xl sm:text-4xl font-bold">
                            R$ {(recipeTotal / Number(rFinalQty)).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    className="btn-primary active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                    onClick={handleSaveRecipe}
                    disabled={isCreatingRecipe || isUpdatingRecipe}
                  >
                    {editingRecipeId ? "ATUALIZAR RECEITA" : "SALVAR RECEITA"} →
                  </button>
                  {editingRecipeId && (
                    <button className="btn-secondary active:translate-x-[6px] active:translate-y-[6px] active:shadow-none" onClick={resetRecipeForm}>
                      CANCELAR
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8 -rotate-2">
                Receitas Cadastradas
              </h3>

              {recipesLoading ? (
                <div className="card text-center py-16">
                  <p className="text-xl font-bold italic opacity-40">Carregando...</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="card text-center py-16">
                  <p className="text-xl font-bold italic opacity-40">Nenhuma receita cadastrada ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Qtd Final</th>
                        <th>Unid.</th>
                        <th>Custo Total (R$)</th>
                        <th>Margem (%)</th>
                        <th>Preço Sugerido (R$)</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map(r => (
                        <tr key={r._id}>
                          <td className="font-bold">{r.name}</td>
                          <td>{r.finalQty}</td>
                          <td className="font-mono font-bold">{r.finalUnit}</td>
                          <td className="font-mono font-bold">R$ {r.totalCost.toFixed(2)}</td>
                          <td className="font-bold">{r.profitMargin}%</td>
                          <td className="font-mono font-bold bg-neo-accent text-white px-2">{r.suggestedPrice === Infinity ? "∞" : `R$ ${r.suggestedPrice.toFixed(2)}`}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" onClick={() => handleEditRecipe(r)}>Editar</button>
                              <button className="btn-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" onClick={() => handleDeleteRecipe(r._id)}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        <hr className="hr-thick" />

        {/* Footer */}
        <footer className="py-12 text-center">
          <div className="bg-neo-secondary border-4 border-neo-ink p-6 shadow-[8px_8px_0px_0px_#000] rotate-sticker inline-block">
            <span className="font-bold text-sm uppercase tracking-widest">
              CALC — CONTROLE DE CUSTOS © {new Date().getFullYear()}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
