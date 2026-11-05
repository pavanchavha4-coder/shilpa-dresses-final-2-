import React, { useState } from 'react';
import { 
  PackageCheck, 
  Search, 
  Plus, 
  Minus, 
  AlertCircle, 
  Check, 
  TrendingDown, 
  SlidersHorizontal 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const AdminStockView: React.FC = () => {
  const { products, adjustStock, updateProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [newThreshold, setNewThreshold] = useState<number>(2);

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  const filteredProducts = products.filter(p => {
    if (filterLowStockOnly && p.stock > p.lowStockThreshold) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveThreshold = async (productId: string) => {
    await updateProduct(productId, { lowStockThreshold: newThreshold });
    setEditingThresholdId(null);
  };

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-brand font-bold text-base tracking-wider uppercase text-[#380B12]">
            Inventory & Stock Manager
          </h2>
          <p className="text-[11px] text-[#7A6458]">Real-time boutique inventory synchronization</p>
        </div>

        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm ${
            filterLowStockOnly
              ? 'bg-red-600 text-white'
              : 'bg-white border border-[#E0D5C3] text-[#4A0E17]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Alerts ({lowStockCount})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8F7E75] absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter garments by name or category..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E0D5C3] text-[#241315] focus:outline-none focus:border-[#4A0E17]"
        />
      </div>

      {/* Products Stock Table / Cards */}
      <div className="space-y-2.5">
        {filteredProducts.map(product => {
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

          return (
            <div
              key={product.id}
              className={`p-3.5 rounded-2xl bg-white border shadow-sm space-y-2.5 transition-all ${
                isOutOfStock ? 'border-red-400 bg-red-50/20' :
                isLowStock ? 'border-amber-400 bg-amber-50/20' :
                'border-[#E8DEC8]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="w-12 h-14 object-cover rounded-xl border border-[#D4AF37]/30 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-[#7A6458] uppercase font-bold tracking-wider">
                      {product.category}
                    </span>
                    <h4 className="font-bold text-xs text-[#380B12] line-clamp-1">{product.name}</h4>
                    <div className="text-[11px] text-[#4A0E17] font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Stock Count Display */}
                <div className="text-right">
                  <div className={`text-xl font-extrabold ${
                    isOutOfStock ? 'text-red-600' :
                    isLowStock ? 'text-amber-600' :
                    'text-[#2E7D32]'
                  }`}>
                    {product.stock}
                  </div>
                  <span className="text-[10px] text-[#8F7E75]">in boutique</span>
                </div>
              </div>

              {/* Threshold & Adjustment Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EADBCA]">
                {/* Threshold edit */}
                <div className="text-[10px] text-[#7A6458]">
                  {editingThresholdId === product.id ? (
                    <div className="flex items-center gap-1">
                      <span>Alert at:</span>
                      <input
                        type="number"
                        min={0}
                        value={newThreshold}
                        onChange={e => setNewThreshold(Number(e.target.value))}
                        className="w-12 p-0.5 text-xs text-center border rounded"
                      />
                      <button
                        onClick={() => handleSaveThreshold(product.id)}
                        className="p-1 text-emerald-700 hover:text-emerald-900"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingThresholdId(product.id);
                        setNewThreshold(product.lowStockThreshold);
                      }}
                      className="hover:underline text-[#4A0E17]"
                    >
                      Alert Threshold: <strong>{product.lowStockThreshold} pcs</strong>
                    </button>
                  )}
                </div>

                {/* Increments / Decrements */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => adjustStock(product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-[#FAF6EE] border border-[#E0D5C3] text-[#4A0E17] font-bold flex items-center justify-center hover:bg-[#4A0E17] hover:text-[#D4AF37] disabled:opacity-40"
                    title="Deduct 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => adjustStock(product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#FAF6EE] border border-[#E0D5C3] text-[#4A0E17] font-bold flex items-center justify-center hover:bg-[#4A0E17] hover:text-[#D4AF37]"
                    title="Add 1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => adjustStock(product.id, 5)}
                    className="px-2 h-7 rounded-lg bg-[#4A0E17] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center hover:bg-[#380B12]"
                    title="Add 5"
                  >
                    +5
                  </button>

                  <button
                    onClick={() => adjustStock(product.id, 10)}
                    className="px-2 h-7 rounded-lg bg-[#380B12] text-[#FDFBF7] text-[10px] font-bold flex items-center justify-center hover:bg-black"
                    title="Add 10"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
