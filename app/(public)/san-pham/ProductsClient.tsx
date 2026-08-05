'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { ChevronDown, ChevronRight, Search, Home, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { label: 'Phù hợp nhất', value: 'featured' },
  { label: 'Giá thấp đến cao', value: 'price-asc' },
  { label: 'Giá cao đến thấp', value: 'price-desc' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Bán chạy', value: 'best-sellers' },
];

export default function ProductsClient({ 
  products = [], 
  initialCategory,
  categories: categoriesProp = [],
  headerContent 
}: { 
  products?: any[], 
  initialCategory?: string,
  categories?: any[],
  headerContent?: React.ReactNode 
}) {
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Pagination state: number of products shown (default 20)
  const [visibleCount, setVisibleCount] = useState(20);

  // Multiple selections for Category and Brand
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  const [fetchedCategories, setFetchedCategories] = useState<any[]>(categoriesProp);

  useEffect(() => {
    if (categoriesProp && categoriesProp.length > 0) {
      setFetchedCategories(categoriesProp);
    } else {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setFetchedCategories(data); })
        .catch(console.error);
    }
  }, [categoriesProp]);

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);

  // Dynamic attributes state
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Category tree with parent-child hierarchy and combined product counts
  const { categoryTree, categoryNameToChildrenMap } = useMemo(() => {
    const directCounts: Record<string, number> = {};
    products.forEach(p => {
      if (p.category) {
        directCounts[p.category] = (directCounts[p.category] || 0) + 1;
      }
    });

    const childrenMap = new Map<string, string[]>();
    const processedNames = new Set<string>();

    const rawTree = fetchedCategories.map((cat: any) => {
      processedNames.add(cat.name);
      const childNodes = (cat.children || [])
        .map((child: any) => {
          processedNames.add(child.name);
          return {
            id: child.id,
            name: child.name,
            slug: child.slug,
            count: directCounts[child.name] || 0,
          };
        })
        .filter((c: any) => c.count > 0 || selectedCategories.includes(c.name));

      const childNames = childNodes.map((c: any) => c.name);
      if (childNames.length > 0) {
        childrenMap.set(cat.name, childNames);
      }

      const childrenTotal = childNodes.reduce((acc: number, c: any) => acc + c.count, 0);
      const parentDirect = directCounts[cat.name] || 0;
      const parentTotal = parentDirect + childrenTotal;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: parentTotal,
        children: childNodes,
      };
    });

    Object.entries(directCounts).forEach(([name, count]) => {
      if (!processedNames.has(name) && count > 0) {
        rawTree.push({
          id: Math.random(),
          name,
          slug: '',
          count,
          children: [],
        });
      }
    });

    const tree = rawTree.filter(cat => cat.count > 0 || selectedCategories.includes(cat.name));

    return { categoryTree: tree, categoryNameToChildrenMap: childrenMap };
  }, [fetchedCategories, products, selectedCategories]);

  // Active category names including subcategories
  const activeCategoryNames = useMemo(() => {
    if (selectedCategories.length === 0) return null;
    const set = new Set<string>();
    selectedCategories.forEach(name => {
      set.add(name);
      const children = categoryNameToChildrenMap.get(name);
      if (children) {
        children.forEach(cName => set.add(cName));
      }
    });
    return set;
  }, [selectedCategories, categoryNameToChildrenMap]);

  // Auto expand parent when any child or parent is selected
  useEffect(() => {
    if (selectedCategories.length > 0 && categoryTree.length > 0) {
      const toExpand: Record<string, boolean> = {};
      categoryTree.forEach(parent => {
        if (parent.children && parent.children.length > 0) {
          const hasSelectedChild = parent.children.some((child: any) => selectedCategories.includes(child.name));
          const isParentSelected = selectedCategories.includes(parent.name);
          if (hasSelectedChild || isParentSelected) {
            toExpand[parent.name] = true;
          }
        }
      });
      if (Object.keys(toExpand).length > 0) {
        setExpandedParents(prev => ({ ...toExpand, ...prev }));
      }
    }
  }, [selectedCategories, categoryTree]);

  const toggleExpandParent = (parentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedParents(prev => ({
      ...prev,
      [parentName]: !prev[parentName]
    }));
  };

  // Extract all unique attributes from products matching current category & brand filters
  const availableAttributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};
    
    products.forEach(p => {
      // Filter by selected category if active
      if (activeCategoryNames && !activeCategoryNames.has(p.category)) return;

      // Filter by selected brand if active
      if (selectedBrands.length > 0) {
        const productBrand = p.brand || (p.attributes && p.attributes['Thương hiệu']);
        if (!productBrand || !selectedBrands.includes(productBrand)) return;
      }

      // Extract from base attributes
      if (p.attributes) {
        Object.entries(p.attributes).forEach(([key, value]) => {
          if (typeof value === 'string' && value.trim()) {
            if (!attrs[key]) attrs[key] = new Set();
            attrs[key].add(value);
          }
        });
      }

      // Extract from variants
      if (p.productType === 'pre-packaged' && p.variants) {
        p.variants.forEach((variant: any) => {
          if (variant.attributes) {
            Object.entries(variant.attributes).forEach(([key, value]) => {
              if (typeof value === 'string' && value.trim()) {
                if (!attrs[key]) attrs[key] = new Set();
                attrs[key].add(value as string);
              }
            });
          }
        });
      }

      // Extract from custom-build options
      if (p.productType === 'custom-build' && p.customOptions) {
        p.customOptions.forEach((group: any) => {
          if (!attrs[group.name]) attrs[group.name] = new Set();
          group.choices.forEach((choice: any) => {
            if (choice.name) {
              attrs[group.name].add(choice.name);
            }
          });
        });
      }
    });

    // Clean up and sort
    const result: Record<string, string[]> = {};
    Object.entries(attrs).forEach(([key, valueSet]) => {
      if (key !== 'Thương hiệu' && key !== 'Dòng máy' && key !== 'Loại SP') {
        result[key] = Array.from(valueSet).sort();
      }
    });
    return result;
  }, [products, activeCategoryNames, selectedBrands]);

  // Dynamic brand list & counts (Category is Root Filter -> Brands depend on selected categories)
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    products.forEach(p => {
      // Only count brands for products matching the selected category (if any)
      if (activeCategoryNames && !activeCategoryNames.has(p.category)) {
        return;
      }

      const brand = p.brand || (p.attributes && p.attributes['Thương hiệu']);
      if (brand) {
        counts[brand] = (counts[brand] || 0) + 1;
      }
    });

    // Include selected brands in map so user can still uncheck them if needed
    selectedBrands.forEach(b => {
      if (!(b in counts)) {
        counts[b] = 0;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0 || selectedBrands.includes(item.name))
      .sort((a, b) => b.count - a.count);
  }, [products, activeCategoryNames, selectedBrands]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleAttributeChange = (attrKey: string, attrValue: string) => {
    setSelectedAttributes(prev => {
      const currentVals = prev[attrKey] || [];
      const newVals = currentVals.includes(attrValue)
        ? currentVals.filter(v => v !== attrValue)
        : [...currentVals, attrValue];
      
      return {
        ...prev,
        [attrKey]: newVals
      };
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(100000000);
    setSelectedAttributes({});
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategoryNames || activeCategoryNames.has(p.category);
    
    // For brand, we check p.brand, or p.attributes['Thương hiệu']
    const productBrand = p.brand || (p.attributes && p.attributes['Thương hiệu']);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand || 'HP');
    
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

    // Dynamic Attribute Filtering
    let matchesAttributes = true;
    for (const [attrKey, attrSelectedValues] of Object.entries(selectedAttributes)) {
      if (attrSelectedValues.length === 0) continue; // No filter selected for this attribute

      // A product matches if IT has the attribute, OR ANY of its variants has the attribute
      let productHasValue = false;
      
      if (p.attributes && attrSelectedValues.includes(p.attributes[attrKey])) {
        productHasValue = true;
      } else if (p.productType === 'pre-packaged' && p.variants) {
        productHasValue = p.variants.some((v: any) => v.attributes && attrSelectedValues.includes(v.attributes[attrKey]));
      } else if (p.productType === 'custom-build' && p.customOptions) {
        const group = p.customOptions.find((g: any) => g.name === attrKey);
        if (group && group.choices.some((c: any) => attrSelectedValues.includes(c.name))) {
          productHasValue = true;
        }
      }

      if (!productHasValue) {
        matchesAttributes = false;
        break; // Fail early if one attribute filter doesn't match
      }
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesAttributes;
  });

  // Reset pagination state when filters or sort change
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, selectedCategories, selectedBrands, minPrice, maxPrice, selectedAttributes, sortBy]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return b.id - a.id;
        case 'best-sellers':
          return b.reviews - a.reviews;
        default:
          if (a.categoryOrder !== b.categoryOrder) {
            return (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0);
          }
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0);
          }
          return a.id - b.id;
      }
    });
  }, [filteredProducts, sortBy]);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  return (
    <main className="min-h-screen bg-[#F4F7F6]">
      <Header />
      
      {headerContent}
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-primary flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Sản phẩm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Mobile Overlay */}
          {isMobileFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Sidebar Filters */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-[280px] lg:w-[250px] bg-white lg:bg-transparent h-full lg:h-auto transition-transform duration-300
            ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            shrink-0
          `}>
            <div className="bg-white lg:border border-gray-200 lg:rounded-lg overflow-hidden flex flex-col h-full lg:h-auto shadow-xl lg:shadow-none">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky lg:static top-0 z-10">
                <h2 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Bộ lọc
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={clearFilters}
                    className="text-[12px] text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    Xóa
                  </button>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto lg:overflow-visible">
              {/* Danh Mục (Phân cấp danh mục cha con) */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-[13px] uppercase mb-3 flex items-center justify-between">
                  DANH MỤC
                </h3>
                <div className="space-y-1.5">
                  {categoryTree.map((cat) => {
                    const hasChildren = cat.children && cat.children.length > 0;
                    const isExpanded = !!expandedParents[cat.name];
                    const isParentChecked = selectedCategories.includes(cat.name);

                    return (
                      <div key={cat.name} className="space-y-1">
                        {/* Parent Category Row */}
                        <div className="flex items-center justify-between group py-0.5">
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" title={cat.name}>
                            <input
                              type="checkbox"
                              checked={isParentChecked}
                              onChange={() => handleCategoryChange(cat.name)}
                              className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5 shrink-0"
                            />
                            <span className={cn(
                              "text-[13px] text-gray-700 group-hover:text-primary leading-snug truncate",
                              hasChildren ? "font-semibold text-gray-900" : "font-normal"
                            )}>
                              {cat.name}
                            </span>
                          </label>

                          <div className="flex items-center shrink-0 ml-2">
                            {hasChildren ? (
                              <button
                                type="button"
                                onClick={(e) => toggleExpandParent(cat.name, e)}
                                className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors",
                                  isExpanded
                                    ? "bg-primary/10 text-primary"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                                title={isExpanded ? "Thu gọn danh mục con" : "Mở rộng danh mục con"}
                              >
                                <span>{cat.count}</span>
                                <ChevronDown
                                  className={cn(
                                    "w-3 h-3 transition-transform duration-200",
                                    isExpanded ? "rotate-180" : "rotate-0 text-gray-400"
                                  )}
                                />
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-normal">
                                {cat.count}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subcategories (Indented Tree) */}
                        {hasChildren && isExpanded && (
                          <div className="ml-3.5 pl-2 border-l border-gray-200 space-y-1 py-0.5">
                            {cat.children.map((child: any) => {
                              const isChildChecked = selectedCategories.includes(child.name);
                              return (
                                <label key={child.name} className="flex items-center justify-between cursor-pointer group py-0.5" title={child.name}>
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isChildChecked}
                                      onChange={() => handleCategoryChange(child.name)}
                                      className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5 shrink-0"
                                    />
                                    <span className="text-[12px] text-gray-600 group-hover:text-primary leading-snug truncate">
                                      {child.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 ml-1.5">
                                    {child.count}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Khoảng giá */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-[14px] mb-4">
                  Khoảng giá
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center text-[12px] text-gray-600 mb-2">
                      <span>Thấp nhất</span>
                      <span className="font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(minPrice)} ₫</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000000"
                      step="500000"
                      value={minPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= maxPrice) setMinPrice(val);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-[12px] text-gray-600 mb-2">
                      <span>Cao nhất</span>
                      <span className="font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(maxPrice)} ₫</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000000"
                      step="500000"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minPrice) setMaxPrice(val);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>


              {/* Thương Hiệu */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-[13px] uppercase mb-3 flex items-center justify-between cursor-pointer">
                  THƯƠNG HIỆU
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {brandCounts.map((brand) => (
                    <label key={brand.name} className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.name)}
                        onChange={() => handleBrandChange(brand.name)}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span className="text-[13px] text-gray-600 group-hover:text-primary flex-1 leading-snug">
                        {brand.name}
                      </span>
                      <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 rounded">
                        {brand.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Attributes Filters */}
              {Object.entries(availableAttributes).map(([attrKey, attrValues]) => (
                <div key={attrKey} className="p-4 border-b border-gray-200 last:border-b-0">
                  <h3 className="font-bold text-gray-800 text-[13px] uppercase mb-3 flex items-center justify-between cursor-pointer">
                    {attrKey}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </h3>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {attrValues.map((value) => (
                      <label key={value} className="flex items-start gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={(selectedAttributes[attrKey] || []).includes(value)}
                          onChange={() => handleAttributeChange(attrKey, value)}
                          className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-primary flex-1 leading-snug">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              </div>
              
              {/* Mobile Apply Button */}
              <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 lg:hidden">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-primary text-white py-2.5 rounded font-semibold text-sm hover:bg-primary/90"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Bar: Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm, mã SP, giải pháp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded bg-white border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  className="lg:hidden flex-1 sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 rounded px-4 py-2 text-sm text-gray-700 font-medium active:bg-gray-50"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </button>
                <div className="relative shrink-0 flex-1 sm:flex-none sm:w-56">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none w-full h-10 bg-white border border-gray-200 px-4 py-2 rounded text-sm text-gray-700 pr-10 cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} {...product} productType={product.productType} />
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < sortedProducts.length ? (
                  <div className="mt-10 mb-4 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 20)}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-primary text-white hover:bg-primary/90 font-semibold rounded-full shadow-md hover:shadow-lg transition-all text-sm group"
                    >
                      <span>Xem thêm sản phẩm</span>
                      <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                        (Còn {sortedProducts.length - visibleCount} sản phẩm)
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                    </button>
                    <p className="mt-3 text-xs text-gray-500">
                      Hiển thị {Math.min(visibleCount, sortedProducts.length)} / {sortedProducts.length} sản phẩm
                    </p>
                  </div>
                ) : (
                  <div className="mt-10 mb-4 text-center text-xs text-gray-400">
                    Đã hiển thị tất cả {sortedProducts.length} sản phẩm
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg text-center py-16 flex flex-col items-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
