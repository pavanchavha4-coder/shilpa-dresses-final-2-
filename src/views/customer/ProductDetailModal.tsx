import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Box, 
  ShieldCheck, 
  Ruler, 
  CalendarClock, 
  Check, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Product, GarmentSize } from '../../types';
import { ThreeDressShowroom } from '../../components/ThreeDressShowroom';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onBookTrial: (product: Product, size: GarmentSize) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBookTrial
}) => {
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(product.sizes[0] || 'M');
  const [show3DShowroom, setShow3DShowroom] = useState(false);
  const [activeImage, setActiveImage] = useState(product.imageUrl);

  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock <= 0;

  const allImages = [product.imageUrl, ...(product.additionalImages || [])];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#D4AF37]/30">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#FDFBF7]/95 px-4 py-3 border-b border-[#EADFCB] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase tracking-widest font-bold text-[#4A0E17]">
              {product.category}
            </span>
            <span className="text-xs text-[#D4AF37]">•</span>
            <span className="text-xs text-[#705545]">{product.subcategory}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#EFE8DC] text-[#4A0E17] hover:bg-[#4A0E17] hover:text-[#FDFBF7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Main Visual: 3D Showroom or Image Gallery */}
          {show3DShowroom ? (
            <div className="space-y-2">
              <ThreeDressShowroom 
                garmentName={product.name}
                initialColor={product.colors?.[0]?.includes('Gold') ? '#D4AF37' : '#4A0E17'}
                onClose={() => setShow3DShowroom(false)}
              />
              <button
                onClick={() => setShow3DShowroom(false)}
                className="w-full py-1.5 text-xs text-[#4A0E17] font-semibold border border-[#D4AF37]/50 rounded-xl hover:bg-[#F3E5AB]/30 transition-colors flex items-center justify-center gap-1"
              >
                <span>Switch back to Photo Gallery</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F2EADB] border border-[#EADFCB] shadow-inner">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* 3D Inspection Badge Trigger */}
                <button
                  onClick={() => setShow3DShowroom(true)}
                  className="absolute bottom-3 right-3 bg-[#4A0E17]/95 text-[#D4AF37] hover:bg-[#380B12] text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-[#D4AF37]/50 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
                >
                  <Box className="w-4 h-4 text-[#D4AF37]" />
                  <span>3D Mannequin Fit</span>
                </button>

                {/* Discount Badge */}
                {product.originalPrice > product.price && (
                  <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#4A0E17] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-transform ${
                        activeImage === img ? 'border-[#4A0E17] scale-105 shadow' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Title & Pricing */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-brand text-[#380B12] leading-snug">
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-[#4A0E17]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm line-through text-[#8F7E75]">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-[#2E7D32] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-full ml-auto">
                Taxes Included
              </span>
            </div>
          </div>

          {/* Stock Availability Badge */}
          <div className="py-2 px-3 rounded-xl bg-[#F7F2EA] border border-[#E8DEC8] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#543D32]">Trial Availability:</span>
            {isOutOfStock ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Temporarily Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Only {product.stock} pieces left in salon!
              </span>
            ) : (
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                In Stock ({product.stock} in boutique)
              </span>
            )}
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#380B12] flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                Select Trial Size
              </span>
              <span className="text-[#8F7E75]">Selected: <strong className="text-[#4A0E17]">{selectedSize}</strong></span>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow'
                        : 'bg-[#F7F2EA] text-[#4A0E17] border border-[#E2D5BE] hover:border-[#D4AF37]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fabric & Description */}
          <div className="space-y-2 text-xs text-[#4A3C38] leading-relaxed pt-1">
            <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] space-y-1.5">
              <div className="font-semibold text-[#380B12] uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Fabric & Artisan Craft
              </div>
              <p><strong className="text-[#380B12]">Fabric:</strong> {product.fabric}</p>
              {product.colors && product.colors.length > 0 && (
                <p><strong className="text-[#380B12]">Color Shades:</strong> {product.colors.join(', ')}</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-[#380B12] mb-1">Couture Overview</h4>
              <p>{product.description}</p>
            </div>
          </div>

          {/* VIP Trial Studio Perks */}
          <div className="p-3 bg-gradient-to-r from-[#4A0E17]/5 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30 text-[11px] space-y-1.5 text-[#543D32]">
            <div className="font-bold text-[#4A0E17] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              VIP In-Store Trial Privilege
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[#5C4538]">
              <li>Private trial suite with mirror lighting</li>
              <li>Master alteration tailor consultation on-site</li>
              <li>Complementary styling & fabric pairing advice</li>
              <li>Zero advance deposit required for trial reservation</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 bg-[#FDFBF7] border-t border-[#EADFCB] space-y-2">
          <button
            disabled={isOutOfStock}
            onClick={() => onBookTrial(product, selectedSize)}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
              isOutOfStock
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-[#4A0E17] hover:bg-[#380B12] text-[#D4AF37] border border-[#D4AF37]/50 active:scale-[0.98]'
            }`}
          >
            <CalendarClock className="w-4 h-4 text-[#D4AF37]" />
            <span>Reserve for VIP Trial ({selectedSize})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
