import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  CalendarClock, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Product, GarmentCategory, GarmentSize } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ShopViewProps {
  initialCategory?: GarmentCategory | 'All';
  onSelectProduct: (product: Product) => void;
  onBookTrial: (product: Product, size: GarmentSize) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  initialCategory = 'All',
  onSelectProduct,
  onBookTrial
}) => {
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'All'>(initialCategory);
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(50000);

  const categoriesList: Array<GarmentCategory | 'All'> = [
    'All',
    "Women's Wear",
    "Men's Wear",
    "Kids Wear",
    "Bridal & Couture"
  ];

  const uniqueFabrics = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.fabric.split(' ')[0])));
    return ['All', ...list];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesSubcategory = product.subcategory.toLowerCase().includes(q);
        const matchesFabric = product.fabric.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesSubcategory && !matchesFabric) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Fabric
      if (selectedFabric !== 'All' && !product.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
        return false;
      }

      // Max price
      if (product.price > priceMax) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, selectedFabric, priceMax, sortBy]);

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8F7E75] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search sarees, sherwanis, lehengas, silk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs text-[#241315] placeholder:text-[#8F7E75] focus:outline-none focus:border-[#4A0E17] shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-[#8F7E75] hover:text-[#4A0E17]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow-sm'
                  : 'bg-white text-[#543D32] border border-[#E0D5C3] hover:border-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sort & Filter Action Bar */}
      <div className="flex items-center justify-between text-xs text-[#6B5A51] border-b border-[#EADBCA] pb-2">
        <span className="font-semibold">
          Showing <strong className="text-[#4A0E17]">{filteredProducts.length}</strong> Outfits
        </span>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white border border-[#E0D5C3] rounded-lg px-2 py-1 text-[11px] font-semibold text-[#4A0E17] focus:outline-none"
          >
            <option value="featured">Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer(true)}
            className="p-1.5 rounded-lg bg-white border border-[#E0D5C3] hover:border-[#4A0E17] text-[#4A0E17] flex items-center gap-1 text-[11px] font-semibold shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Modal / Drawer */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in">
          <div className="bg-[#FDFBF7] w-full max-w-md rounded-t-3xl p-5 space-y-4 shadow-2xl border-t border-[#D4AF37]">
            <div className="flex items-center justify-between border-b border-[#EADBCA] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-brand font-bold text-sm tracking-wider uppercase text-[#380B12]">
                  Refine Boutique Collection
                </h3>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 rounded-full bg-[#EFE8DC] text-[#4A0E17]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Maximum Price:</span>
                <span className="text-[#4A0E17] font-bold">₹{priceMax.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={3000}
                max={50000}
                step={1000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#4A0E17]"
              />
              <div className="flex justify-between text-[10px] text-[#8F7E75]">
                <span>₹3,000</span>
                <span>₹25,000</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* Fabric Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#380B12] block">Fabric Type</label>
              <div className="flex flex-wrap gap-1.5">
                {uniqueFabrics.map(fab => (
                  <button
                    key={fab}
                    onClick={() => setSelectedFabric(fab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      selectedFabric === fab
                        ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                        : 'bg-white text-[#4A3C38] border-[#E0D5C3]'
                    }`}
                  >
                    {fab}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply & Reset */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedFabric('All');
                  setPriceMax(50000);
                  setSearchQuery('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E0D5C3] text-xs font-semibold text-[#6B5A51]"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#4A0E17] text-[#D4AF37] text-xs font-bold uppercase tracking-wider shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6EE] border border-[#EADBCA] flex items-center justify-center text-[#8F7E75]">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-[#380B12]">No matching garments found</h4>
          <p className="text-xs text-[#8F7E75] max-w-xs mx-auto">
            Try adjusting your search keyword, category, or maximum price filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedFabric('All');
              setPriceMax(50000);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] text-[#D4AF37] text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm flex flex-col justify-between cursor-pointer transition-transform active:scale-[0.98] hover:shadow-md"
              >
                <div className="relative aspect-[3/4] w-full bg-[#F2EADB]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Stock Tag */}
                  {isOutOfStock ? (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="absolute top-2 left-2 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      Only {product.stock} Left
                    </span>
                  ) : null}

                  {/* Category Pill */}
                  <span className="absolute bottom-2 left-2 bg-[#380B12]/80 text-[#FDFBF7] text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-none">
                    {product.subcategory}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#380B12] line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-[#7A6458] mt-0.5 line-clamp-1">{product.fabric}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-extrabold text-[#4A0E17]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] line-through text-[#8F7E75]">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#7A6458]">
                      <span>Sizes:</span>
                      <strong className="text-[#4A0E17] font-semibold truncate">
                        {product.sizes.join(', ')}
                      </strong>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookTrial(product, product.sizes[0] || 'M');
                      }}
                      className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${
                        isOutOfStock
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-[#4A0E17] hover:bg-[#380B12] text-[#D4AF37] shadow-sm'
                      }`}
                    >
                      <CalendarClock className="w-3 h-3 text-[#D4AF37]" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Book Trial'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
