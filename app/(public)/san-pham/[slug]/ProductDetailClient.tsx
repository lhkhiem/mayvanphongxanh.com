'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Plus, Minus, CheckCircle2, Printer, Phone, PhoneCall, Mail, MapPin, CreditCard, ChevronRight, ChevronDown, ChevronUp, Download, Info, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { QuoteTemplate } from '@/components/print/QuoteTemplate';
import { ProductCard } from '@/components/products/ProductCard';
import { ShareButtons } from '@/components/blog/share-buttons';
import { VatBadge } from '@/components/products/VatBadge';
import { WatermarkedImage } from '@/components/products/WatermarkedImage';

import { cleanUrl } from '@/lib/utils';

export default function ProductDetailClient({
  product,
  settings = {},
  globalPolicies = [],
  similarProducts = [],
  sameBrandProducts = [],
  relatedProducts = [],
  consumables = []
}: {
  product: any,
  settings?: Record<string, string>,
  globalPolicies?: any[],
  similarProducts?: any[],
  sameBrandProducts?: any[],
  relatedProducts?: any[],
  consumables?: any[]
}) {
  const [quantity, setQuantity] = useState(1);
  const [showAllQuickSpecs, setShowAllQuickSpecs] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product?.variants?.length > 0 ? product.variants[0].id : null
  );

  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string>>(() => {
    if (product?.productType === 'custom-build' && product.customOptions) {
      const initial: Record<string, string> = {};
      product.customOptions.forEach((group: any) => {
        if (group.choices.length > 0) {
          initial[group.name] = group.choices[0].id;
        }
      });
      return initial;
    }
    return {};
  });

  const currentVariant = product?.variants?.find((v: any) => v.id === selectedVariantId) || product?.variants?.[0];

  const currentPrice = () => {
    if (product?.productType === 'custom-build' && product.customOptions) {
      let total = product.price || 0;
      product.customOptions.forEach((group: any) => {
        const choiceId = selectedCustomOptions[group.name];
        const choice = group.choices.find((c: any) => c.id === choiceId);
        if (choice) total += choice.priceModifier;
      });
      return total;
    }
    if (currentVariant) return currentVariant.price;
    return product?.price || 0;
  };

  const currentOriginalPrice = () => {
    if (currentVariant) return currentVariant.originalPrice;
    return product?.originalPrice;
  };

  const currentStock = () => {
    if (currentVariant) return currentVariant.stock || currentVariant.stockQuantity;
    return product?.stock || 0;
  };

  const currentCartItemId = () => {
    if (product?.productType === 'custom-build') {
      const optionIds = Object.values(selectedCustomOptions).sort().join('-');
      return `${product.id}-${optionIds}`;
    }
    if (currentVariant) return `${product.id}-${currentVariant.id}`;
    return product?.id.toString() || '';
  };

  const currentVariantName = () => {
    if (product?.productType === 'custom-build' && product?.customOptions) {
      const parts: string[] = [];
      product.customOptions.forEach((group: any) => {
        const choiceId = selectedCustomOptions[group.name];
        const choice = group.choices.find((c: any) => c.id === choiceId);
        if (choice) parts.push(choice.name);
      });
      return parts.join(', ');
    }
    if (currentVariant && currentVariant.name && currentVariant.name !== 'Mặc định') {
      return currentVariant.name.replace(`${product.name} - `, '');
    }
    return undefined;
  };
  if (!product) {
    notFound();
  }

  const cleanProductImages = (Array.isArray(product.images) ? product.images : [])
    .map((img: string) => cleanUrl(img))
    .filter(Boolean);

  const cleanVariantImages = (Array.isArray(currentVariant?.images) ? currentVariant.images : [])
    .map((img: string) => cleanUrl(img))
    .filter(Boolean);

  // Dynamic gallery logic:
  // 1. If Admin uploaded product-level images (cleanProductImages), use cleanProductImages as main gallery.
  // 2. If the product has variant-specific images AND product-level images are empty, fallback to cleanVariantImages.
  // 3. If selected variant has distinct custom images (different from product images), merge them appropriately.
  let gallery: string[] = [];
  if (cleanProductImages.length > 0) {
    const isDistinctVariant = currentVariant && currentVariant.name && currentVariant.name !== 'Mặc định';
    if (isDistinctVariant && cleanVariantImages.length > 0) {
      gallery = Array.from(new Set([...cleanVariantImages, ...cleanProductImages]));
    } else {
      gallery = cleanProductImages;
    }
  } else if (cleanVariantImages.length > 0) {
    gallery = cleanVariantImages;
  } else {
    gallery = [cleanUrl(product.image) || '/placeholder.jpg'];
  }

  if (gallery.length === 0) {
    gallery.push('/placeholder.jpg');
  }

  // Add state for image gallery
  const [activeImage, setActiveImage] = useState(() => gallery[0]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('desc');
  const [activeRelatedTab, setActiveRelatedTab] = useState(product.category === 'Máy in' ? 'consumables' : 'similar');

  useEffect(() => {
    if (cleanVariantImages.length > 0) {
      setActiveImage(cleanVariantImages[0]);
    } else if (gallery.length > 0 && !gallery.includes(activeImage)) {
      setActiveImage(gallery[0]);
    }
  }, [selectedVariantId]);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      variantId: currentVariant?.id,
      cartItemId: currentCartItemId(),
      name: product.name,
      variantName: currentVariantName(),
      sku: currentVariant?.sku,
      attributes: currentVariant?.attributes,
      customOptions: product?.productType === 'custom-build' ? selectedCustomOptions : undefined,
      price: currentPrice(),
      image: activeImage
    }, quantity);
  };

  const price = currentPrice();
  const originalPrice = currentOriginalPrice();
  const stock = currentStock();

  const showContactPrice = product?.isContactPrice || price <= 0;
  const discount = !showContactPrice && originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const isRental = product?.productType === 'rental';

  return (
    <>
      <main className="min-h-screen bg-background flex flex-col print:hidden">
        <Header />

        <div className="flex-1 mx-auto max-w-7xl px-4 py-6 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <Link href="/san-pham" className="hover:text-primary transition-colors">
              Sản phẩm
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <Link
                  href={product.categorySlug ? `/danh-muc/${product.categorySlug}` : `/san-pham?category=${encodeURIComponent(typeof product.category === 'string' ? product.category : (product.category.name || ''))}`}
                  className="hover:text-primary transition-colors"
                >
                  {typeof product.category === 'string' ? product.category : product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-foreground font-medium truncate">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-5">
            <div className="md:col-span-5 lg:col-span-5 flex flex-col">
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-border cursor-crosshair w-full h-full"
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  setMousePosition({ x, y });
                }}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <WatermarkedImage
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-contain transition-transform duration-200 ${isZooming ? 'scale-[2]' : 'scale-100'}`}
                  style={{
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                  }}
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-md z-10">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-7 flex flex-col min-h-0">
              <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                <ShareButtons title={product.name} excerpt={product.name} />
              </div>

              <div className="flex-shrink-0 mb-2.5 bg-secondary/20 rounded-xl p-3 sm:px-4 sm:py-2.5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {!showContactPrice ? (
                    <>
                      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight whitespace-nowrap">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                          {isRental && <span className="text-lg sm:text-xl font-semibold text-muted-foreground ml-1">/ tháng</span>}
                        </span>
                        {!isRental && (
                          <VatBadge vatStatus={product?.vatStatus} className="text-xs sm:text-sm font-semibold px-2 py-0.5" />
                        )}
                      </div>
                      {originalPrice && discount > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                          </span>
                          <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                            Giảm {discount}%
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-500 tracking-tight whitespace-nowrap">
                        Giá: Liên hệ
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                        (Vui lòng liên hệ để nhận báo giá chi tiết)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 self-start sm:self-center">
                  <span className={stock > 0 ? "inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary bg-primary/10 px-3.5 py-1.5 rounded-full whitespace-nowrap" : "inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-destructive bg-destructive/10 px-3.5 py-1.5 rounded-full whitespace-nowrap"}>
                    {stock > 0 ? (
                      <><CheckCircle2 className="w-4 h-4" /> Có sẵn hàng</>
                    ) : (
                      "Hết hàng"
                    )}
                  </span>
                </div>
              </div>

              {product.variants && product.variants.length > 1 && (
                <div className="flex-shrink-0 mb-2.5">
                  <h3 className="text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Chọn cấu hình:</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`relative text-left p-2 rounded-xl border-2 transition-all overflow-hidden flex flex-col justify-between min-h-[65px] ${selectedVariantId === variant.id
                          ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5'
                          : 'border-border hover:border-primary/40 bg-card hover:bg-secondary/20'
                          }`}
                      >
                        {selectedVariantId === variant.id && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground p-0.5 rounded-bl-lg">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                        <div className="text-xs font-bold text-foreground mb-0.5 pr-3 line-clamp-1">
                          {variant.name ? variant.name.replace(`${product.name} - `, '') : 'Mặc định'}
                        </div>
                        <div className="text-primary font-bold text-xs">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                          {isRental && <span className="font-normal text-[10px] text-muted-foreground ml-1">/ tháng</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.productType === 'custom-build' && product.customOptions && (
                <div className="flex-shrink-0 mb-2.5 space-y-2">
                  {product.customOptions.map((group: any) => (
                    <div key={group.name} className="bg-secondary/30 p-2.5 rounded-xl border border-border">
                      <h3 className="text-xs font-semibold text-foreground mb-1.5">{group.name}:</h3>
                      <div className="space-y-1">
                        {group.choices.map((choice: any) => (
                          <label key={choice.id} className="flex items-center gap-3 cursor-pointer group/label">
                            <input
                              type="radio"
                              name={`option-${group.name}`}
                              value={choice.id}
                              checked={selectedCustomOptions[group.name] === choice.id}
                              onChange={() => setSelectedCustomOptions(prev => ({ ...prev, [group.name]: choice.id }))}
                              className="w-3.5 h-3.5 text-primary focus:ring-primary border-border cursor-pointer"
                            />
                            <div className="flex-1 flex justify-between items-center text-xs">
                              <span className="text-foreground group-hover/label:text-primary transition-colors">{choice.name}</span>
                              {choice.priceModifier > 0 && (
                                <span className="text-muted-foreground">+ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(choice.priceModifier)}</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(() => {
                const hasQuickSpecs = Array.isArray(product.quickSpecs) && product.quickSpecs.length > 0;
                const specifications = Array.isArray(product.specifications) ? product.specifications : [];
                const allSpecs = hasQuickSpecs
                  ? product.quickSpecs
                  : (specifications.length > 0 ? specifications : []);

                const INITIAL_LIMIT = 11;
                const hasMore = allSpecs.length > INITIAL_LIMIT;
                const displaySpecs = showAllQuickSpecs ? allSpecs : allSpecs.slice(0, INITIAL_LIMIT);

                return (
                  <div className="flex-1 min-h-0 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-4 sm:p-4.5 shadow-xs flex flex-col justify-between overflow-hidden">
                    <h3 className="flex-shrink-0 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Thông số nổi bật
                    </h3>
                    <ul className="flex-1 flex flex-col justify-around text-xs sm:text-sm text-foreground space-y-1.5 overflow-y-auto pr-1 py-1">
                      {displaySpecs.length > 0 ? (
                        displaySpecs.map((spec: any, idx: number) => {
                          if (typeof spec === 'string') {
                            return (
                              <li key={idx} className="flex gap-2.5 items-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1 shrink-0" />
                                <span className="leading-snug">{spec}</span>
                              </li>
                            );
                          }
                          const label = spec?.label || spec?.name;
                          const value = spec?.value || spec?.val;
                          return (
                            <li key={idx} className="flex gap-2.5 items-start">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1 shrink-0" />
                              <span className="leading-snug">
                                {label ? <><span className="text-muted-foreground font-semibold">{label}:</span> {value}</> : value}
                              </span>
                            </li>
                          );
                        })
                      ) : (
                        <li className="flex gap-2 items-center text-muted-foreground text-xs italic py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                          <span>Thông tin nổi bật đang được cập nhật...</span>
                        </li>
                      )}
                    </ul>
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setShowAllQuickSpecs(!showAllQuickSpecs)}
                        className="flex-shrink-0 mt-2 pt-1.5 border-t border-emerald-100 dark:border-emerald-900/40 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center justify-center gap-1 w-full transition-colors cursor-pointer"
                      >
                        {showAllQuickSpecs ? (
                          <>Thu gọn <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Xem thêm ({allSpecs.length - INITIAL_LIMIT} thông số khác) <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-8">
            <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {gallery.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                  >
                    <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>

              {consumables && consumables.length > 0 && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-800 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" /> Vật tư tiêu hao khuyên dùng
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {consumables.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors shadow-sm group">
                        <Link href={`/san-pham/${item.slug}`} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-border block">
                          <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/san-pham/${item.slug}`} className="font-semibold text-[13px] text-foreground hover:text-primary block leading-snug mb-0.5 break-words">
                            {item.name}
                          </Link>
                          <div className="text-primary font-bold text-sm">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </div>
                        </div>
                        <Link
                          href={`/san-pham/${item.slug}`}
                          className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all flex-shrink-0"
                          title="Xem chi tiết"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-7 lg:col-span-7 flex flex-col gap-3">
              <div>
                {!showContactPrice ? (
                  <div className="flex flex-row items-center gap-1.5 sm:gap-3">
                    <div className="flex items-center border-2 border-primary/20 bg-background rounded-xl h-12 w-24 sm:w-28 lg:w-32 flex-shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 sm:w-9 h-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors rounded-l-xl"
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <span className="flex-1 text-center font-bold text-base sm:text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        className="w-7 sm:w-9 h-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors rounded-r-xl"
                        disabled={quantity >= stock}
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <div className="flex flex-1 items-center gap-1.5 sm:gap-3 min-w-0">
                      <button
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className="w-10 h-12 sm:w-12 sm:h-12 bg-primary/10 text-primary border-2 border-primary/20 rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                        title={isRental ? "Thêm vào giỏ (Thuê)" : "Thêm vào giỏ"}
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-bold text-xs sm:text-sm md:text-base hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 px-1.5 sm:px-3 whitespace-nowrap min-w-0"
                      >
                        {isRental ? 'ĐĂNG KÝ THUÊ' : 'MUA NGAY'}
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="w-10 sm:w-12 xl:w-auto h-12 px-0 xl:px-4 bg-transparent border-2 border-dashed border-border text-muted-foreground rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                        title="Yêu cầu báo giá"
                      >
                        <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden xl:inline">BÁO GIÁ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2 sm:gap-3">
                    <a
                      href="/lien-he"
                      className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 hover:-translate-y-0.5 px-3 whitespace-nowrap min-w-0"
                    >
                      <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      LIÊN HỆ BÁO GIÁ NGAY
                    </a>
                    <button
                      onClick={() => window.print()}
                      className="w-10 sm:w-auto px-0 sm:px-4 h-12 bg-transparent border-2 border-dashed border-border text-muted-foreground rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                      title="In báo giá"
                    >
                      <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">IN BÁO GIÁ</span>
                    </button>
                  </div>
                )}
              </div>

              {product.policies && product.policies.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-1 mb-0">
                  {product.policies.map((policy: any) => {
                    const Icon = (LucideIcons as any)[policy.icon] || LucideIcons.CheckCircle;
                    return (
                      <div key={policy.id} className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-background border border-border/80 rounded-xl shadow-xs">
                        <div className="bg-primary/10 p-1.5 rounded-lg text-primary shrink-0">
                          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground text-xs sm:text-[13px] leading-tight mb-0.5 truncate">{policy.title}</h4>
                          {policy.description && (
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1">{policy.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            {/* Tabs Navigation */}
            <div className="flex items-center overflow-x-auto scrollbar-hide border-b border-border mb-6 gap-1 sm:gap-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setActiveTab('desc')}
                className={`px-3.5 sm:px-6 py-3 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeTab === 'desc'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3.5 sm:px-6 py-3 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeTab === 'specs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
              >
                Thông số kỹ thuật
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3.5 sm:px-6 py-3 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeTab === 'docs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
              >
                Hướng dẫn & Tài liệu
              </button>
            </div>

            {/* Tabs Content */}
            <div className="min-h-[300px]">
              {activeTab === 'specs' && (
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                  {product.specifications && product.specifications.length > 0 ? (
                    <table className="w-full text-sm text-left border-collapse">
                      <tbody>
                        {product.specifications.map((spec: any, idx: number) => (
                          <tr key={idx} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 px-6 bg-gray-50/80 font-medium text-gray-600 w-1/3 md:w-1/4 lg:w-1/5 border-r border-border">
                              {spec.label}
                            </td>
                            <td className="py-3.5 px-6 text-gray-900 font-medium">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground italic text-sm">
                      Thông số kỹ thuật đang được cập nhật...
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'desc' && (
                <div className="prose prose-lg text-muted-foreground max-w-none bg-white p-8 rounded-xl border border-border shadow-sm">
                  <h3 className="text-xl font-bold text-foreground mb-4">Chi tiết sản phẩm: {product.name}</h3>
                  {product.description && product.description.trim() !== '' ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="text-muted-foreground italic text-sm">Nội dung chi tiết sản phẩm đang được cập nhật...</p>
                  )}
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-6">
                  {(product.manuals?.content || (product.manuals?.files && product.manuals.files.length > 0)) && (
                    <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                      <h3 className="text-lg font-bold text-foreground mb-4">Hướng dẫn sử dụng</h3>
                      {product.manuals.content && (
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground mb-6 break-words prose-a:text-primary prose-a:font-medium hover:prose-a:underline"
                          dangerouslySetInnerHTML={{
                            __html: product.manuals.content
                              .replace(/(?<!href=["'])(?<!src=["'])(?<!">)(https?:\/\/[^\s<"']+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary font-medium underline">$1</a>')
                              .replace(/<a\s+(?![^>]*target=)/gi, '<a target="_blank" rel="noopener noreferrer" ')
                          }}
                        />
                      )}
                      {product.manuals.files && product.manuals.files.length > 0 && (
                        <div className="space-y-3">
                          {product.manuals.files.map((file: string, idx: number) => (
                            <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <LucideIcons.FileText className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold text-foreground text-sm truncate max-w-[200px] sm:max-w-xs">{file.split('/').pop()}</h4>
                              </div>
                              <a href={file} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                <Download className="w-4 h-4" /> Tải xuống
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(product.drivers?.content || (product.drivers?.files && product.drivers.files.length > 0)) && (
                    <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                      <h3 className="text-lg font-bold text-foreground mb-4">Driver & Phần mềm</h3>
                      {product.drivers.content && (
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground mb-6 break-words prose-a:text-primary prose-a:font-medium hover:prose-a:underline"
                          dangerouslySetInnerHTML={{
                            __html: product.drivers.content
                              .replace(/(?<!href=["'])(?<!src=["'])(?<!">)(https?:\/\/[^\s<"']+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary font-medium underline">$1</a>')
                              .replace(/<a\s+(?![^>]*target=)/gi, '<a target="_blank" rel="noopener noreferrer" ')
                          }}
                        />
                      )}
                      {product.drivers.files && product.drivers.files.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2">
                          {product.drivers.files.map((file: string, idx: number) => (
                            <a key={idx} href={file} download target="_blank" rel="noopener noreferrer" className="border border-border p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 shrink-0 bg-secondary rounded flex items-center justify-center text-xl font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="truncate">
                                  <h4 className="font-semibold text-foreground text-sm truncate">{file.split('/').pop()}</h4>
                                  <p className="text-xs text-muted-foreground">Tải xuống Driver</p>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(!product.manuals?.content && !product.manuals?.files?.length && !product.drivers?.content && !product.drivers?.files?.length) && (
                    <div className="bg-white p-12 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-muted-foreground">
                      <LucideIcons.FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p>Sản phẩm này chưa có tài liệu hướng dẫn hay driver nào được đính kèm.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-16 bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="flex items-center overflow-x-auto scrollbar-hide border-b border-border bg-gray-50/50">
              {product.category === 'Máy in' && (
                <button
                  onClick={() => setActiveRelatedTab('consumables')}
                  className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeRelatedTab === 'consumables'
                      ? 'border-primary text-primary bg-white'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
                    }`}
                >
                  SẢN PHẨM VẬT TƯ TIÊU HAO
                </button>
              )}
              <button
                onClick={() => setActiveRelatedTab('similar')}
                className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeRelatedTab === 'similar'
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
                  }`}
              >
                SẢN PHẨM TƯƠNG TỰ
              </button>
              <button
                onClick={() => setActiveRelatedTab('same-brand')}
                className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeRelatedTab === 'same-brand'
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
                  }`}
              >
                SẢN PHẨM CÙNG HÃNG
              </button>
              <button
                onClick={() => setActiveRelatedTab('related')}
                className={`px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors border-b-2 ${activeRelatedTab === 'related'
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
                  }`}
              >
                SẢN PHẨM LIÊN QUAN
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {activeRelatedTab === 'consumables' && consumables.length > 0 && consumables.map(p => (
                  <div key={p.id}>
                    <ProductCard {...p} />
                  </div>
                ))}

                {activeRelatedTab === 'consumables' && consumables.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Đang cập nhật vật tư tiêu hao cho sản phẩm này.
                  </div>
                )}

                {activeRelatedTab === 'similar' && similarProducts.map(p => (
                  <div key={p.id}>
                    <ProductCard {...p} />
                  </div>
                ))}

                {activeRelatedTab === 'similar' && similarProducts.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Đang cập nhật sản phẩm tương tự.
                  </div>
                )}

                {activeRelatedTab === 'same-brand' && sameBrandProducts.map(p => (
                  <div key={p.id}>
                    <ProductCard {...p} />
                  </div>
                ))}

                {activeRelatedTab === 'related' && relatedProducts.map(p => (
                  <div key={p.id}>
                    <ProductCard {...p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
      <QuoteTemplate product={product} quantity={quantity} settings={settings} />
    </>
  );
}
