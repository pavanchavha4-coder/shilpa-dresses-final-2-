import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Box, 
  ShieldCheck, 
  Scissors, 
  Coffee, 
  CalendarClock, 
  Star,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Product, GarmentCategory } from '../../types';
import { useStore } from '../../context/StoreContext';

interface HomeViewProps {
  onSelectCategory: (category: GarmentCategory) => void;
  onSelectProduct: (product: Product) => void;
  onOpen3DShowroom: (product?: Product) => void;
  onNavigateToShop: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectProduct,
  onOpen3DShowroom,
  onNavigateToShop
}) => {
  const { products, categories, settings } = useStore();

  const featuredProducts = products.filter(p => p.featured);
  const newArrivals = products.filter(p => p.isNewArrival);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Regal Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#380B12] text-[#FDFBF7] shadow-xl border border-[#D4AF37]/40 mx-3 mt-3">
        {/* Background photo with luxury gradient blend */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80"
            alt="Royal Couture"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#25060B] via-[#4A0E17]/85 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-5 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Royal Festive Collection 2026</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-brand tracking-wider text-[#FDFBF7] leading-tight">
              Elegance Woven with Heritage & Grace
            </h1>
            <p className="text-xs text-[#FDFBF7]/85 line-clamp-2 max-w-sm">
              Discover bespoke bridal lehengas, handloom silk sarees, and regal royal sherwanis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={onNavigateToShop}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#4A0E17] font-extrabold text-xs tracking-wider uppercase shadow-lg hover:bg-[#F3E5AB] transition-colors flex items-center gap-1.5"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpen3DShowroom(featuredProducts[0])}
              className="px-3.5 py-2.5 rounded-xl bg-[#4A0E17]/80 text-[#D4AF37] font-bold text-xs tracking-wider border border-[#D4AF37]/50 hover:bg-[#4A0E17] transition-colors flex items-center gap-1.5"
            >
              <Box className="w-4 h-4 text-[#D4AF37]" />
              <span>3D Fitting</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive 3D Mannequin Showroom Banner */}
      <div className="mx-3 p-4 rounded-2xl bg-gradient-to-r from-[#4A0E17] via-[#5E121E] to-[#4A0E17] text-[#FDFBF7] border border-[#D4AF37]/40 shadow-lg flex items-center justify-between">
        <div className="space-y-1 max-w-[65%]">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
            <Box className="w-3.5 h-3.5" />
            <span>Virtual Fitting Lounge</span>
          </div>
          <h3 className="font-brand font-bold text-sm text-[#FDFBF7] leading-snug">
            Inspect Fabrics & Silhouettes in 3D
          </h3>
          <p className="text-[11px] text-[#FDFBF7]/80 line-clamp-2">
            Rotate 360°, test drape fits, and view zari embroideries in real-time.
          </p>
        </div>
        <button
          onClick={() => onOpen3DShowroom(featuredProducts[0])}
          className="px-3.5 py-2 rounded-xl bg-[#D4AF37] text-[#4A0E17] text-xs font-bold uppercase tracking-wider shadow hover:bg-[#F3E5AB] transition-transform active:scale-95 flex items-center gap-1 flex-shrink-0"
        >
          <span>Launch 3D</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Category Highlights */}
      <div className="px-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-brand font-bold text-base text-[#380B12] tracking-wider uppercase">
            Curated Categories
          </h2>
          <button
            onClick={onNavigateToShop}
            className="text-xs text-[#4A0E17] font-bold hover:underline flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group relative h-28 rounded-xl overflow-hidden cursor-pointer shadow border border-[#E8DEC8] transition-transform active:scale-98"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#25060B]/90 via-[#4A0E17]/50 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[#FDFBF7]">
                <div className="font-brand font-bold text-xs tracking-wider leading-snug">
                  {cat.name}
                </div>
                <div className="text-[10px] text-[#D4AF37] font-medium">
                  {cat.itemCount} Designs Available
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. New Arrivals Carousel */}
      <div className="space-y-3">
        <div className="px-3 flex items-center justify-between">
          <div>
            <h2 className="font-brand font-bold text-base text-[#380B12] tracking-wider uppercase">
              New Arrivals
            </h2>
            <p className="text-[11px] text-[#7A6458]">Freshly crafted boutique couture</p>
          </div>
          <button
            onClick={onNavigateToShop}
            className="text-xs text-[#4A0E17] font-bold hover:underline"
          >
            See All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-3 pb-2 no-scrollbar">
          {newArrivals.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="min-w-[170px] max-w-[170px] bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm flex flex-col cursor-pointer transition-transform active:scale-98"
            >
              <div className="relative aspect-[3/4] w-full bg-[#F2EADB]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-[#4A0E17] text-[#D4AF37] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  New
                </span>
                <span className="absolute bottom-2 right-2 bg-white/90 text-[#4A0E17] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  Trial Ready
                </span>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#7A6458] font-semibold">{product.subcategory}</div>
                  <h3 className="text-xs font-bold text-[#380B12] line-clamp-1 mt-0.5">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-xs font-extrabold text-[#4A0E17]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#D4AF37] font-bold">VIP Trial</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Featured Masterpieces */}
      <div className="px-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-brand font-bold text-base text-[#380B12] tracking-wider uppercase">
              Featured Masterpieces
            </h2>
            <p className="text-[11px] text-[#7A6458]">Handcrafted wedding & bridal signatures</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm flex flex-col cursor-pointer transition-transform active:scale-98"
            >
              <div className="relative aspect-[3/4] w-full bg-[#F2EADB]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-[#D4AF37] text-[#4A0E17] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                  Signature
                </div>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[10px] text-[#7A6458] font-semibold uppercase">{product.category}</div>
                  <h3 className="text-xs font-bold text-[#380B12] line-clamp-2 mt-0.5 leading-snug">
                    {product.name}
                  </h3>
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

                  <div className="mt-1.5 w-full py-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#D4AF37] text-[10px] font-bold text-center border border-[#E0D5C3] transition-colors flex items-center justify-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    <span>Reserve Trial</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. VIP Boutique Experience Pillars */}
      <div className="mx-3 p-4 rounded-2xl bg-[#FAF6EE] border border-[#EADBCA] space-y-3">
        <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#4A0E17] text-center">
          The Shilpa Dresses Experience
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs text-[#543D32]">
          <div className="p-2.5 bg-white rounded-xl border border-[#EADFCB] space-y-1">
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <div className="font-bold text-[#380B12] text-[11px]">Master Tailor Fitting</div>
            <p className="text-[10px] text-[#7A6458]">Personalized body measurement and bespoke alterations.</p>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#EADFCB] space-y-1">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <div className="font-bold text-[#380B12] text-[11px]">Private Salon Suite</div>
            <p className="text-[10px] text-[#7A6458]">Dedicated trial room reserved exclusively for you.</p>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#EADFCB] space-y-1">
            <Coffee className="w-4 h-4 text-[#D4AF37]" />
            <div className="font-bold text-[#380B12] text-[11px]">Champagne Hospitality</div>
            <p className="text-[10px] text-[#7A6458]">Complimentary refreshments for you and your family.</p>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#EADFCB] space-y-1">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <div className="font-bold text-[#380B12] text-[11px]">Authentic Handlooms</div>
            <p className="text-[10px] text-[#7A6458]">Certified mulberry silk, organza, and zardozi zari.</p>
          </div>
        </div>
      </div>

      {/* 7. Footer Developer Branding */}
      <div className="text-center text-[11px] text-[#8F7E75] space-y-1 pt-2">
        <div className="font-semibold text-[#4A0E17]">
          SHILPA DRESSES • {settings.city}
        </div>
        <div className="text-[10px] text-[#6B5A51]">
          Developed and branded by <strong className="text-[#380B12]">NEXORA Technologies</strong>
        </div>
        <div className="text-[9px] italic text-[#997819]">
          "Ideas to Impact"
        </div>
      </div>
    </div>
  );
};
