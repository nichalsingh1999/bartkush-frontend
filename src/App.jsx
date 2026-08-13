import { useEffect, useState } from 'react';
import axios from 'axios';
import bgImage from './assets/background.jpeg';
import profileImage from './assets/profile.jpeg';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState('ALL');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Interactive Modals & Menus States
  const [activeModal, setActiveModal] = useState(null); // 'music', 'dossier', 'tour', 'search', 'account'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch products from your backend MongoDB server
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log('Backend connection error (Ensure node server.js is running):', err));
  }, []);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Filter products based on selected category tag
  const categories = ['ALL', 'ALBUMS', 'T-SHIRTS', 'CAPS'];
  const displayedProducts = filteredCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category?.toUpperCase() === filteredCategory);

  // Search filtered items
  const searchedProducts = displayedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white font-sans flex flex-col justify-between selection:bg-[#d4af37] selection:text-black relative bg-[#050505]">
      
      {/* WORLD-CLASS FULLY ANIMATED DYNAMIC BACKGROUND CANVAS */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <img 
          src={bgImage} 
          alt="BartKush World-Class Animated Background" 
          className="w-[130%] h-[130%] object-contain filter brightness-110 contrast-125 opacity-90"
          style={{ animation: 'worldClassCinematicMotion 22s ease-in-out infinite alternate' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75"></div>
      </div>

      {/* Top Elite Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-[#d4af37] to-amber-700 text-black text-center text-[11px] font-black tracking-[0.25em] uppercase py-2.5 px-4 shadow-xl z-50">
        Worldwide Shipping Active • Official BartKush Music Co. Masterclass Drop
      </div>

      {/* World-Class Fully Functional Sticky Navigation Bar */}
      <header className="bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-6 lg:px-16 py-4 flex items-center justify-between">
        
        {/* Left Navigation Links */}
        <nav className="flex items-center space-x-6 lg:space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">
          <button 
            onClick={() => { setFilteredCategory('ALBUMS'); window.scrollTo({ top: 850, behavior: 'smooth' }); }}
            className="hover:text-[#d4af37] transition-colors"
          >
            music
          </button>
          <button 
            onClick={() => { setFilteredCategory('T-SHIRTS'); window.scrollTo({ top: 850, behavior: 'smooth' }); }}
            className="hover:text-[#d4af37] transition-colors"
          >
            merch
          </button>
          <button 
            onClick={() => { setFilteredCategory('ALBUMS'); window.scrollTo({ top: 850, behavior: 'smooth' }); }}
            className="hover:text-[#d4af37] transition-colors"
          >
            shop by album
          </button>
          <button 
            onClick={() => setActiveModal('dossier')}
            className="hover:text-[#d4af37] transition-colors hidden xl:inline"
          >
            dossier
          </button>
        </nav>

        {/* Center Brand Logo (Clicks back to home top) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center cursor-pointer z-10" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <h1 className="text-base lg:text-xl font-black tracking-[0.3em] uppercase bg-gradient-to-r from-[#d4af37] via-amber-200 to-white bg-clip-text text-transparent">
            BartKush
          </h1>
        </div>

        {/* Right Menu Links & Action Icons */}
        <div className="flex items-center space-x-6 lg:space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">
          <button 
            onClick={() => setActiveModal('tour')}
            className="hover:text-[#d4af37] transition-colors"
          >
            tour
          </button>
          <button 
            onClick={() => setActiveModal('search')}
            className="hover:text-[#d4af37] transition-colors"
          >
            search
          </button>
          
          {/* Action Icons */}
          <div className="flex items-center space-x-4 pl-4 border-l border-white/20 text-sm">
            <button 
              onClick={() => setActiveModal('search')} 
              className="hover:text-[#d4af37] transition-colors" 
              title="Search"
            >
              🔍
            </button>
            <button 
              onClick={() => setActiveModal('account')} 
              className="hover:text-[#d4af37] transition-colors" 
              title="Account"
            >
              👤
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="hover:text-[#d4af37] transition-colors relative" 
              title="Cart"
            >
              🛒 <span className="absolute -top-2 -right-3 bg-[#d4af37] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">{totalCartCount}</span>
            </button>
          </div>
        </div>

      </header>

      <div className="relative z-10">
        {/* Full-Page Cinematic Hero Section */}
        <section className="relative w-full h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-white/10 bg-transparent">
          
          {/* COMPLETELY TRANSPARENT PROFILE & TEXT CARD */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-8 py-12 bg-transparent rounded-3xl">
            
            {/* Transparent Shield Profile Badge */}
            <div className="relative mb-4 p-1.5 rounded-3xl border border-[#d4af37]/60 shadow-2xl bg-black/20 backdrop-blur-xs">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37] to-amber-700 rounded-3xl blur opacity-75"></div>
              <img 
                src={profileImage} 
                alt="Robin Chand Thakuri Shield Logo" 
                className="relative w-28 h-28 md:w-36 md:h-36 object-cover rounded-2xl shadow-inner mix-blend-screen opacity-95" 
                style={{ filter: 'contrast(1.15) brightness(1.05)' }}
              />
            </div>

            <span className="text-[11px] uppercase tracking-[0.4em] text-[#d4af37] font-extrabold mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              The Echoes Of The West
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-wider mb-3 uppercase text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
              Robin Chand Thakuri
            </h2>
            <p className="text-gray-100 text-xs md:text-sm max-w-md mb-8 font-medium tracking-wide leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Official masterclass apparel collection, albums & exclusive headwear. Built for elite culture.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 850, behavior: 'smooth' })}
              className="bg-[#d4af37] text-black font-black px-10 py-4 uppercase tracking-[0.25em] text-[11px] hover:bg-white hover:scale-105 transition-all duration-300 shadow-2xl rounded-none"
            >
              Explore Collection
            </button>
          </div>
        </section>

        {/* Masterclass Collection Section (Albums, T-Shirts, Caps) */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-24 w-full">
          
          {/* Section Header & Category Filter Pills */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-12 gap-6 bg-black/50 p-6 backdrop-blur-md rounded-xl">
            <div>
              <span className="text-[11px] text-[#d4af37] tracking-[0.25em] uppercase font-bold">Flagship Catalog</span>
              <h3 className="text-2xl md:text-4xl font-black tracking-wider uppercase mt-1">Explore Drops</h3>
            </div>

            {/* Interactive Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilteredCategory(cat)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border transition-all ${
                    filteredCategory === cat 
                      ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg' 
                      : 'bg-black/80 text-gray-300 border-white/10 hover:border-[#d4af37] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Dynamic Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {searchedProducts.length > 0 ? (
              searchedProducts.map(p => (
                <div 
                  key={p._id} 
                  className="group relative bg-[#0b0b0b]/85 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between hover:border-[#d4af37] transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                >
                  <div>
                    {/* Image / Mockup Box */}
                    <div className="w-full h-72 bg-[#040404]/90 mb-5 flex items-center justify-center overflow-hidden border border-white/5 relative">
                      <span className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-[#d4af37] transition-colors">
                        [{p.category || 'BartKush Item'}]
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                        <span className="w-full text-center text-xs font-bold text-black bg-[#d4af37] py-2.5 uppercase tracking-widest shadow-lg">
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Product Metadata */}
                    <span className="text-[9px] text-[#d4af37] tracking-[0.2em] uppercase font-bold">
                      {p.category || 'Limited Edition'}
                    </span>
                    <h4 className="font-bold text-sm text-gray-200 group-hover:text-[#d4af37] transition-colors tracking-wide mt-1">
                      {p.name}
                    </h4>
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                      ${p.price ? p.price.toFixed(2) : '0.00'}
                    </p>
                  </div>

                  {/* Add to Cart Action */}
                  <button 
                    onClick={() => handleAddToCart(p)}
                    className="mt-6 w-full bg-transparent border border-white/20 text-white py-3.5 text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-black transition-all duration-300"
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-28 text-center text-gray-300 uppercase tracking-[0.2em] text-xs border border-dashed border-white/10 bg-black/60 backdrop-blur-md">
                No items found matching your criteria.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Slide-out Cart Sidebar Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-50">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-black tracking-[0.25em] uppercase text-[#d4af37]">Your Cart ({totalCartCount})</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
                </div>
                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cartItems.length > 0 ? (
                    cartItems.map(item => (
                      <div key={item._id} className="flex items-center justify-between bg-[#111111] p-4 border border-white/5">
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          <p className="text-[11px] text-[#d4af37] mt-1">${item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item._id)} className="text-gray-500 hover:text-red-400 text-xs uppercase tracking-wider font-bold">Remove</button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-gray-500 text-xs uppercase tracking-widest">Your cart is currently empty.</div>
                  )}
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center mb-6 text-sm font-bold tracking-widest uppercase">
                  <span>Subtotal:</span>
                  <span className="text-[#d4af37]">${totalPrice.toFixed(2)}</span>
                </div>
                <button onClick={() => alert('Proceeding to secure checkout...')} className="w-full bg-[#d4af37] text-black font-black py-4 uppercase tracking-[0.25em] text-xs hover:bg-white transition-all shadow-xl">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Popups / Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          
          <div className="relative z-10 w-full max-w-lg bg-[#0b0b0b]/95 backdrop-blur-md border border-[#d4af37]/40 p-8 shadow-2xl rounded-2xl text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xs font-black tracking-[0.3em] uppercase text-[#d4af37]">{activeModal} archive</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            {activeModal === 'dossier' && (
              <div className="space-y-4 text-xs text-gray-300 leading-relaxed uppercase tracking-wider">
                <p className="text-[#d4af37] font-bold">The Echoes Of The West — Lore & History</p>
                <p>Founded by Robin Chand Thakuri, BartKush Music Co. represents a synthesis of traditional ethnic precision and high-grade modern minimalist streetwear culture.</p>
                <p className="text-gray-500 text-[10px]">Studio records, journal entries, and press archives logged under secure clearance.</p>
              </div>
            )}

            {activeModal === 'tour' && (
              <div className="space-y-3 text-xs uppercase tracking-wider">
                <div className="flex justify-between items-center bg-black/50 p-3 border border-white/10">
                  <span>Kathmandu — Masterclass Live</span>
                  <button className="bg-[#d4af37] text-black px-3 py-1 text-[10px] font-black">Sold Out</button>
                </div>
                <div className="flex justify-between items-center bg-black/50 p-3 border border-white/10">
                  <span>Tokyo — Echoes Session</span>
                  <button className="bg-white text-black px-3 py-1 text-[10px] font-black hover:bg-[#d4af37]">Tickets</button>
                </div>
              </div>
            )}

            {activeModal === 'search' && (
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Type to search drops..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-xs uppercase tracking-widest text-white focus:border-[#d4af37] outline-none"
                />
                <button onClick={() => { setActiveModal(null); window.scrollTo({ top: 850, behavior: 'smooth' }); }} className="w-full bg-[#d4af37] text-black py-3 text-xs uppercase tracking-widest font-black">
                  View Results in Catalog
                </button>
              </div>
            )}

            {activeModal === 'account' && (
              <div className="space-y-4 text-xs uppercase tracking-wider">
                <p className="text-gray-400">Elite Member Portal Access</p>
                <input type="email" placeholder="Enter Access Email" className="w-full bg-black border border-white/20 p-3 text-white outline-none focus:border-[#d4af37]" />
                <button onClick={() => alert('Access link dispatched.')} className="w-full bg-[#d4af37] text-black font-black py-3 uppercase tracking-widest">
                  Authenticate
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Professional Masterclass Footer */}
      <footer className="border-t border-white/10 bg-black/90 backdrop-blur-md py-16 px-8 text-center text-gray-400 text-xs tracking-widest uppercase relative z-10">
        <div className="flex flex-wrap justify-center gap-8 mb-8 text-gray-300 font-semibold text-xs">
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Help & Support</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Cookie Choices</span>
        </div>
        <p className="mb-3 text-[#d4af37] font-bold tracking-widest">BartKush Music Co. © {new Date().getFullYear()} Official Masterclass Store</p>
        <p className="text-[10px] text-gray-500 max-w-xl mx-auto mt-4 leading-normal">
          If you are using a screen reader and are having problems using this website, please call assistance at 866-682-4413.
        </p>
      </footer>

      {/* Inline Keyframes for World-Class Cinematic Motion Animation */}
      <style>{`
        @keyframes worldClassCinematicMotion {
          0% {
            transform: scale(1) translate(0%, 0%);
          }
          33% {
            transform: scale(1.06) translate(-2%, 2%);
          }
          66% {
            transform: scale(1.04) translate(2%, -2%);
          }
          100% {
            transform: scale(1.08) translate(-1%, -1%);
          }
        }
      `}</style>

    </div>
  );
}

export default App;