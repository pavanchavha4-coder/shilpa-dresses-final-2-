import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, GarmentCategory, GarmentSize } from '../../types';

interface AdminProductsViewProps {
  onOpenAddModalDirectly?: boolean;
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'All'>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>("Women's Wear");
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(15000);
  const [originalPrice, setOriginalPrice] = useState<number>(18000);
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('Pure Raw Silk');
  const [stock, setStock] = useState<number>(5);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(2);
  const [featured, setFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [sizes, setSizes] = useState<GarmentSize[]>(['S', 'M', 'L']);

  // Preset luxury boutique images for instant selection
  const luxuryPhotoPresets = [
    { label: 'Crimson Bridal Lehenga', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Gold Kanjeevaram Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Royal Jodhpuri Bandhgala', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80' },
    { label: 'Imperial Ivory Sherwani', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Emerald Velvet Anarkali', url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80' },
    { label: 'Kids Brocade Kurta Dhoti', url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80' },
  ];

  const availableSizesList: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Fit'];

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory("Women's Wear");
    setSubcategory('Bridal Wear');
    setPrice(18500);
    setOriginalPrice(22000);
    setDescription('Handcrafted luxury boutique couture with artisanal gold zari work.');
    setFabric('Pure Silk & Velvet');
    setStock(4);
    setLowStockThreshold(2);
    setFeatured(true);
    setIsNewArrival(true);
    setImageUrl(luxuryPhotoPresets[0].url);
    setSizes(['S', 'M', 'L', 'XL']);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setSubcategory(p.subcategory);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setDescription(p.description);
    setFabric(p.fabric);
    setStock(p.stock);
    setLowStockThreshold(p.lowStockThreshold);
    setFeatured(p.featured);
    setIsNewArrival(p.isNewArrival);
    setImageUrl(p.imageUrl);
    setSizes(p.sizes);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: name.trim(),
        category,
        subcategory: subcategory.trim(),
        price,
        originalPrice,
        description: description.trim(),
        fabric: fabric.trim(),
        stock,
        lowStockThreshold,
        featured,
        isNewArrival,
        imageUrl: imageUrl.trim(),
        sizes
      });
    } else {
      await addProduct({
        name: name.trim(),
        category,
        subcategory: subcategory.trim(),
        price,
        originalPrice,
        description: description.trim(),
        fabric: fabric.trim(),
        stock,
        lowStockThreshold,
        featured,
        isNewArrival,
        imageUrl: imageUrl.trim() || luxuryPhotoPresets[0].url,
        sizes,
        colors: ['Deep Burgundy', 'Champagne Gold']
      });
    }

    setIsAddModalOpen(false);
  };

  const toggleSize = (s: GarmentSize) => {
    setSizes(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const filtered = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-brand font-bold text-base tracking-wider uppercase text-[#380B12]">
            Garment Catalogue
          </h2>
          <p className="text-[11px] text-[#7A6458]">Total {products.length} outfits in catalog</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3 py-2 rounded-xl bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow hover:bg-[#380B12] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Outfit</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8F7E75] absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search products by title, fabric, category..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E0D5C3] text-[#241315] focus:outline-none focus:border-[#4A0E17]"
        />
      </div>

      {/* Product Cards List */}
      <div className="space-y-2.5">
        {filtered.map(product => (
          <div
            key={product.id}
            className="p-3 bg-white rounded-2xl border border-[#E8DEC8] shadow-sm flex items-center justify-between gap-3"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-14 h-16 object-cover rounded-xl border border-[#D4AF37]/30 flex-shrink-0"
            />

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[#4A0E17] tracking-wider">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="bg-[#D4AF37] text-[#4A0E17] text-[8px] font-extrabold px-1 rounded">
                    Featured
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs text-[#380B12] truncate">{product.name}</h4>
              <div className="text-[11px] flex items-center gap-2">
                <span className="font-bold text-[#4A0E17]">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-[#8F7E75]">Stock: {product.stock} pcs</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openEditModal(product)}
                className="p-2 rounded-lg bg-[#FAF6EE] text-[#4A0E17] hover:bg-[#4A0E17] hover:text-[#D4AF37] transition-colors"
                title="Edit Product"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeletingProductId(product.id)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#D4AF37]/40">
            {/* Header */}
            <div className="bg-[#4A0E17] text-[#FDFBF7] px-4 py-3 flex items-center justify-between">
              <h3 className="font-brand font-bold text-sm tracking-wider uppercase text-[#FDFBF7]">
                {editingProduct ? 'Edit Boutique Garment' : 'Add New Boutique Garment'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-[#FDFBF7]/80 hover:text-[#FDFBF7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-4 space-y-3 text-xs no-scrollbar">
              <div>
                <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Royal Maroon Zardozi Bridal Lehenga"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none focus:border-[#4A0E17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  >
                    <option value="Women's Wear">Women's Wear</option>
                    <option value="Men's Wear">Men's Wear</option>
                    <option value="Kids Wear">Kids Wear</option>
                    <option value="Bridal & Couture">Bridal & Couture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    placeholder="e.g. Bridal Lehenga"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={e => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Low Stock Alert at</label>
                  <input
                    type="number"
                    min={0}
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Fabric & Craftsmanship</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={e => setFabric(e.target.value)}
                  placeholder="e.g. Pure Mulberry Silk with Antique Gold Zari"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Available Sizes</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizesList.map(s => {
                    const isSelected = sizes.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isSelected
                            ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                            : 'bg-white text-[#4A3C38] border-[#E0D5C3]'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#4A0E17] uppercase tracking-wider">Garment Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="Paste direct HTTPS photo URL"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                />

                <div className="pt-1">
                  <span className="text-[10px] text-[#7A6458] block mb-1">Or choose a preset luxury photo:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {luxuryPhotoPresets.map(preset => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setImageUrl(preset.url)}
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-transform ${
                          imageUrl === preset.url ? 'border-[#4A0E17] scale-105' : 'border-transparent'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-0.5 truncate text-center">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="accent-[#4A0E17]"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={e => setIsNewArrival(e.target.checked)}
                    className="accent-[#4A0E17]"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider shadow hover:bg-[#380B12] transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Garment Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl border border-red-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#380B12]">Delete Garment?</h4>
            <p className="text-xs text-[#8F7E75]">
              This outfit will be removed from customer display and trial bookings.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
