"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitCompare, Merge, Check, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useBundleStore } from "@/lib/store/bundle";
import { getItemById } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";
import { toast } from "sonner";

export function CompareContent() {
  const searchParams = useSearchParams();
  const stacksParam = searchParams.get("stacks");
  const [stacks, setStacks] = useState<RegistryItem[][]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useBundleStore();

  useEffect(() => {
    if (!stacksParam) {
      setLoading(false);
      return;
    }

    // Parse stack IDs from URL
    const stackIds = stacksParam.split(",").filter(Boolean);

    // Limit to 3 stacks
    const stackArrays = stackIds.slice(0, 3).map((stackIdString) => {
      const ids = stackIdString.split("+").filter(Boolean);
      return ids
        .map((id) => getItemById(id))
        .filter((item): item is RegistryItem => item !== null);
    });

    setStacks(stackArrays);
    setLoading(false);
  }, [stacksParam]);

  // Extract all unique properties across all stacks
  const allProperties = useMemo(() => {
    const props = new Set<string>();
    stacks.flat().forEach((item) => {
      props.add("name");
      props.add("kind");
      props.add("category");
      props.add("description");
      props.add("installs");
      props.add("remixes");
      if (item.tags) props.add("tags");
      if (item.dependencies) props.add("dependencies");
      if (item.modelRecommendation) props.add("modelRecommendation");
      if (item.tokenSavings) props.add("tokenSavings");
    });
    return Array.from(props);
  }, [stacks]);

  const handleMerge = () => {
    const allItems = stacks.flat();
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.id, item])).values()
    );

    uniqueItems.forEach((item) => addItem(item));

    toast.success(`Merged ${uniqueItems.length} unique items into your stack!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-black font-semibold">Loading stacks...</p>
        </div>
      </div>
    );
  }

  if (stacks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/80 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Catalog
          </Link>

          <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-12 text-center">
            <GitCompare className="w-16 h-16 mx-auto mb-4 text-black/40" />
            <h2 className="text-2xl font-black text-black mb-2">No Stacks to Compare</h2>
            <p className="text-black/60 mb-6">
              Add stacks to the URL using the <code className="px-2 py-1 bg-black/10 rounded">?stacks=</code> parameter.
            </p>
            <Link href="/">
              <Button>Browse Catalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300">
      {/* Header */}
      <div className="border-b border-black/20 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Compare Stacks", href: "/compare" },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Header Section */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-black mb-2">Compare Stacks</h1>
              <p className="text-black/60">
                Comparing {stacks.length} stack{stacks.length !== 1 ? "s" : ""} with{" "}
                {stacks.reduce((sum, stack) => sum + stack.length, 0)} total items
              </p>
            </div>
            {stacks.length > 1 && (
              <Button onClick={handleMerge} className="gap-2">
                <Merge size={16} />
                Merge All Stacks
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/20">
                  <th className="sticky left-0 bg-white/95 backdrop-blur px-4 py-3 text-left font-semibold text-sm text-black/60 border-r border-black/10 z-10">
                    Property
                  </th>
                  {stacks.map((stack, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-black text-base text-black min-w-[250px]"
                    >
                      Stack {idx + 1}
                      <span className="block text-xs font-normal text-black/60 mt-1">
                        {stack.length} item{stack.length !== 1 ? "s" : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allProperties.map((prop) => (
                  <tr key={prop} className="border-b border-black/10 last:border-0">
                    <td className="sticky left-0 bg-white/95 backdrop-blur px-4 py-3 font-semibold text-sm text-black border-r border-black/10 capitalize z-10">
                      {prop.replace(/([A-Z])/g, " $1").trim()}
                    </td>
                    {stacks.map((stack, idx) => (
                      <td key={idx} className="px-4 py-3 text-sm text-black/80 align-top">
                        <div className="space-y-2">
                          {stack.map((item) => {
                            const value = item[prop as keyof RegistryItem];

                            if (value === undefined || value === null) {
                              return null;
                            }

                            if (Array.isArray(value)) {
                              return (
                                <div key={item.id} className="space-y-1">
                                  <div className="font-semibold text-xs text-black/60">{item.name}:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {value.map((v: any, i: number) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-md bg-black/5 text-xs"
                                      >
                                        {typeof v === 'string' ? v : v.name || JSON.stringify(v)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            if (typeof value === "boolean") {
                              return (
                                <div key={item.id} className="flex items-center gap-2">
                                  {value ? (
                                    <Check size={14} className="text-green-600" />
                                  ) : (
                                    <X size={14} className="text-red-600" />
                                  )}
                                  <span className="text-xs">{item.name}</span>
                                </div>
                              );
                            }

                            return (
                              <div key={item.id} className="space-y-1">
                                <div className="font-semibold text-xs text-black/60">{item.name}:</div>
                                <div>{String(value)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stack Items Lists */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stacks.map((stack, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-4 space-y-3"
            >
              <h3 className="font-black text-lg text-black">
                Stack {idx + 1} Items
              </h3>
              <div className="space-y-2">
                {stack.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <Package size={16} className="text-black/60 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-black truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-black/60">{item.kind}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
