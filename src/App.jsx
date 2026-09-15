import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import bgImage from './assets/Background.jpeg';
import profileImage from './assets/profile.jpeg';

// ✅ Import ALL local product images
import echoesImage from './assets/Echoes.jpeg';
import multipleGenreImage from './assets/multiple-genre-disorder.jpg';
import blackTeeImage from './assets/BLACK.jpeg';
import maroonTeeImage from './assets/MORON.jpeg';
import greyTeeImage from './assets/GREY.jpeg';
import creamTeeImage from './assets/CREAM.jpeg';
import whiteTeeImage from './assets/WHITE.jpeg';
import blackCapImage from './assets/Blackcap.jpeg';
import blueCapImage from './assets/bluecap.jpeg';
import whiteCapImage from './assets/whitecap.jpeg';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState('ALL');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRefs = useRef([]);

  // ✅ Social Media Links
  const socialLinks = {
    facebook: "https://www.facebook.com/stelkor.robin",
    tiktok: "https://www.tiktok.com/@bartkushmusicco",
    instagram: "https://www.instagram.com/Robin_Chand_Thakuri",
    spotify: "https://open.spotify.com/artist/21AOFgxU0MKiQCw3MfNeIZ?si=il5xrd_NQtqOeega6BRvrQ"
  };

  // ✅ Contact Information
  const contactInfo = {
    email: "bartkushmussicco@gmail.com",
    phone: "9860426606"
  };

  // ✅ Masterclass Credits
  const albumCredits = [
    { role: "Collaboration", name: "bca$h" },
    { role: "Collaboration", name: "dk" },
    { role: "Music Producer", name: "12:50 on the beat" },
    { role: "Music Producer", name: "Aman Karna" },
    { role: "Music Producer", name: "Kushal Moktan" }
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log('Backend connection error:', err));
  }, []);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
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

  const handlePreSave = async (album, e) => {
    if (e) e.stopPropagation();
    
    const customerEmail = prompt('Enter your email to pre-save this album. We will notify you the moment it drops:');
    if (!customerEmail) return;

    try {
      await axios.post('http://localhost:5000/api/pre-save', {
        albumId: album._id,
        albumName: album.name,
        customerEmail: customerEmail,
        date: new Date().toISOString()
      });

      alert(`✅ Success! You have pre-saved "${album.name}".\n\nWe will notify you at ${customerEmail} when it officially launches.`);
      setSelectedAlbum(null);
    } catch (error) {
      console.error('Pre-save error:', error);
      alert('❌ Could not process your pre-save. Please try again later.');
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const togglePlay = (index, audioFile) => {
    if (!audioFile) return;
    
    if (currentlyPlaying === index) {
      if (isPlaying) {
        audioRefs.current[index]?.pause();
        setIsPlaying(false);
      } else {
        audioRefs.current[index]?.play();
        setIsPlaying(true);
      }
      return;
    }
    
    if (currentlyPlaying !== null && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying]?.pause();
    }
    
    if (audioRefs.current[index]) {
      audioRefs.current[index]?.play();
      setCurrentlyPlaying(index);
      setIsPlaying(true);
    }
  };

  const playAll = () => {
    const tracks = selectedAlbum?.albumDetails?.tracklist || [];
    const firstTrackWithAudio = tracks.findIndex(t => t.audioFile);
    if (firstTrackWithAudio !== -1) {
      togglePlay(firstTrackWithAudio, tracks[firstTrackWithAudio].audioFile);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const customerName = prompt('Enter your full name:');
    if (!customerName) return;

    const customerPhone = prompt('Enter your WhatsApp number (with country code, e.g., 977XXXXXXXXXX):');
    if (!customerPhone) return;

    const shippingAddress = prompt('Enter your shipping address:');
    if (!shippingAddress) return;

    const customerEmail = prompt('Enter your email (optional):');

    const orderData = {
      items: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || ''
      })),
      totalAmount: totalPrice,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      shippingAddress,
      paymentMethod: 'Cash on Delivery'
    };

    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      if (response.data.success) {
        alert(`✅ Order placed successfully!\n\nOrder ID: ${response.data.order.orderId}\n\n📧 Email notification sent to the owner!\n\nThe owner will contact you shortly.`);
        
        setCartItems([]);
        setIsCartOpen(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Failed to place order. Please try again.');
    }
  };

  const categories = ['ALL', 'ALBUMS', 'T-SHIRTS', 'CAPS', 'JEWELRIES'];
  const displayedProducts = filteredCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category?.toUpperCase() === filteredCategory);

  const searchedProducts = displayedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductImage = (product) => {
    const name = product.name.toLowerCase();
    if (name.includes('echoes')) return echoesImage;
    if (name.includes('multiple genre')) return multipleGenreImage;
    if (name.includes('black tee')) return blackTeeImage;
    if (name.includes('maroon tee')) return maroonTeeImage;
    if (name.includes('grey tee')) return greyTeeImage;
    if (name.includes('cream tee')) return creamTeeImage;
    if (name.includes('white tee')) return whiteTeeImage;
    if (name.includes('signature') || name.includes('black cap')) return blackCapImage;
    if (name.includes('blue cap')) return blueCapImage;
    if (name.includes('white cap')) return whiteCapImage;
    return null;
  };

  return (
    <div className="min-h-screen text-white font-sans flex flex-col justify-between selection:bg-[#d4af37] selection:text-black relative bg-[#050505]">
      
      {/* Background */}
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

      {/* Navigation Bar */}
      <header className="bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-6 lg:px-16 py-4 flex items-center justify-between">
        <nav className="flex items-center space-x-6 lg:space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">
          <button onClick={() => { setFilteredCategory('ALBUMS'); window.scrollTo({ top: 850, behavior: 'smooth' }); }} className="hover:text-[#d4af37] transition-colors">music</button>
          <button onClick={() => { setFilteredCategory('T-SHIRTS'); window.scrollTo({ top: 850, behavior: 'smooth' }); }} className="hover:text-[#d4af37] transition-colors">merch</button>
          <button onClick={() => { setFilteredCategory('ALBUMS'); window.scrollTo({ top: 850, behavior: 'smooth' }); }} className="hover:text-[#d4af37] transition-colors">shop by album</button>
          <button onClick={() => { setFilteredCategory('JEWELRIES'); window.scrollTo({ top: 850, behavior: 'smooth' }); }} className="hover:text-[#d4af37] transition-colors">jewelries</button>
          <button onClick={() => setActiveModal('dossier')} className="hover:text-[#d4af37] transition-colors hidden xl:inline">about</button>
        </nav>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-center cursor-pointer z-10" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <h1 className="text-sm md:text-base lg:text-lg font-black tracking-[0.3em] uppercase bg-gradient-to-r from-[#d4af37] via-amber-200 to-white bg-clip-text text-transparent">Bart kush music co.</h1>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">
          <button onClick={() => setActiveModal('tour')} className="hover:text-[#d4af37] transition-colors">tour</button>
          <button onClick={() => setActiveModal('search')} className="hover:text-[#d4af37] transition-colors">search</button>
          <div className="flex items-center space-x-4 pl-4 border-l border-white/20 text-sm">
            <button onClick={() => setActiveModal('search')} className="hover:text-[#d4af37] transition-colors" title="Search">🔍</button>
            <button onClick={() => setActiveModal('account')} className="hover:text-[#d4af37] transition-colors" title="Account">👤</button>
            <button onClick={() => setIsCartOpen(true)} className="hover:text-[#d4af37] transition-colors relative" title="Cart">
              🛒 <span className="absolute -top-2 -right-3 bg-[#d4af37] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">{totalCartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative w-full h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-white/10 bg-transparent">
          <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-8 py-12 bg-transparent rounded-3xl">
            
            <div 
              className="relative mb-4 p-1.5 rounded-3xl border border-[#d4af37]/60 shadow-2xl bg-black/20 backdrop-blur-xs cursor-pointer hover:scale-105 transition-transform duration-300" 
              onClick={() => setIsImageModalOpen(true)}
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37] to-amber-700 rounded-3xl blur opacity-75"></div>
              <img 
                src={profileImage} 
                alt="Robin Chand Thakuri Shield Logo" 
                className="relative w-28 h-28 md:w-36 md:h-36 object-cover rounded-2xl"
              />
            </div>

            {/* ✅ SOCIAL MEDIA ICONS */}
            <div className="flex items-center gap-4 mb-6">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Follow on Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Follow on TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Follow on Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Listen on Spotify">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </a>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#d4af37]/70"></span>
              <span className="text-[11px] uppercase tracking-[0.5em] text-[#d4af37] font-black drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]" style={{ animation: 'goldPulse 2.5s ease-in-out infinite' }}>
                ✦ Releasing Soon ✦
              </span>
              <span className="w-8 h-px bg-[#d4af37]/70"></span>
            </div>

            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-bold mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">The Echoes Of The West — Upcoming Album</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-wider mb-3 uppercase text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">Robin Chand Thakuri</h2>
            <p className="text-gray-100 text-xs md:text-sm max-w-md mb-8 font-medium tracking-wide leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">Official masterclass apparel collection, albums, exclusive headwear & premium jewelries. Built for elite culture.</p>
            <button onClick={() => window.scrollTo({ top: 850, behavior: 'smooth' })} className="bg-[#d4af37] text-black font-black px-10 py-4 uppercase tracking-[0.25em] text-[11px] hover:bg-white hover:scale-105 transition-all duration-300 shadow-2xl rounded-none">Explore Collection</button>
          </div>
        </section>

        {/* Image Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg" onClick={() => setIsImageModalOpen(false)}>
            <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsImageModalOpen(false)} className="absolute -top-12 right-0 text-white hover:text-[#d4af37] text-3xl font-bold transition-colors z-10">✕</button>
              <img src={profileImage} alt="Robin Chand Thakuri Shield Logo" className="w-full h-auto rounded-2xl shadow-2xl border-2 border-[#d4af37]/60" />
              <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-24 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-12 gap-6 bg-black/50 p-6 backdrop-blur-md rounded-xl">
            <div>
              <span className="text-[11px] text-[#d4af37] tracking-[0.25em] uppercase font-bold">Flagship Catalog</span>
              <h3 className="text-2xl md:text-4xl font-black tracking-wider uppercase mt-1">Explore Drops</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilteredCategory(cat)} className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border transition-all ${filteredCategory === cat ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg' : 'bg-black/80 text-gray-300 border-white/10 hover:border-[#d4af37] hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCategory === 'JEWELRIES' ? (
              <div className="col-span-full py-16 text-center">
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/30 rounded-2xl p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-6">💎</div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-wider uppercase text-[#d4af37]">Coming Soon</h3>
                    <div className="w-24 h-0.5 bg-[#d4af37] mx-auto my-4"></div>
                    <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase max-w-md mx-auto">Premium Jewelry Collection</p>
                    <p className="text-gray-500 text-xs mt-3 tracking-wide max-w-sm mx-auto">Elite masterclass jewelry pieces are being curated for the discerning connoisseur.</p>
                  </div>
                </div>
              </div>
            ) : searchedProducts.length > 0 ? (
              searchedProducts.map(p => {
                const localImage = getProductImage(p);
                const imageSrc = localImage || p.image;

                return (
                  <div key={p._id} onClick={() => { if (p.category === 'ALBUMS') setSelectedAlbum(p); }} className="group relative bg-[#0b0b0b]/85 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between hover:border-[#d4af37] transition-all duration-500 hover:-translate-y-2 shadow-2xl cursor-pointer">
                    <div>
                      <div className="w-full h-72 bg-[#040404]/90 mb-5 flex items-center justify-center overflow-hidden border border-white/5 relative">
                        {imageSrc && imageSrc !== '' && !imageSrc.includes('placeholder') ? (
                          <img src={imageSrc} alt={p.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; const span = document.createElement('span'); span.className = 'text-xs text-gray-400 uppercase tracking-widest group-hover:text-[#d4af37] transition-colors'; span.textContent = `[${p.category || 'BartKush Item'}]`; parent.appendChild(span); }} />
                        ) : (
                          <span className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-[#d4af37] transition-colors">[{p.category || 'BartKush Item'}]</span>
                        )}
                        {p.name.toLowerCase().includes('echoes') && (
                          <span className="absolute top-3 right-3 bg-[#d4af37] text-black text-[9px] font-black px-2 py-1 uppercase tracking-widest">Releasing Soon</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                          <span className="w-full text-center text-xs font-bold text-black bg-[#d4af37] py-2.5 uppercase tracking-widest shadow-lg">{p.category === 'ALBUMS' ? 'Open Album Folder' : 'Quick View'}</span>
                        </div>
                      </div>
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="text-[9px] text-[#d4af37] tracking-[0.2em] uppercase font-bold">{p.category || 'Limited Edition'}</span>
                        {p.isLimitedEdition && <span className="inline-block text-[8px] bg-[#d4af37] text-black font-black px-2 py-0.5 uppercase tracking-wider">Limited Edition</span>}
                      </div>
                      <h4 className="font-bold text-sm text-gray-200 group-hover:text-[#d4af37] transition-colors tracking-wide mt-1">{p.name}</h4>
                      {p.color && <p className="text-[10px] text-gray-400 mt-1">Color: {p.color}</p>}
                      {p.description && <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-2 max-h-10 overflow-hidden">{p.description}</p>}
                      <p className="text-gray-400 text-sm mt-2 font-medium">Rs {p.price ? p.price.toFixed(2) : '0.00'}</p>
                      {p.sizes && p.sizes.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {p.sizes.map((size) => (<span key={size} className="text-[8px] border border-white/20 px-2 py-0.5 rounded hover:border-[#d4af37] transition-colors cursor-pointer">{size}</span>))}
                        </div>
                      )}
                    </div>
                    <button onClick={(e) => handleAddToCart(p, e)} className="mt-6 w-full bg-transparent border border-white/20 text-white py-3.5 text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-black transition-all duration-300">Add to Cart</button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-28 text-center text-gray-300 uppercase tracking-[0.2em] text-xs border border-dashed border-white/10 bg-black/60 backdrop-blur-md">No items found matching your criteria.</div>
            )}
          </div>
        </main>
      </div>

      {/* ALBUM MODAL */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedAlbum(null)}></div>
          
          <div className="relative z-10 w-full max-w-2xl bg-[#0b0b0b] border border-[#d4af37]/60 p-8 shadow-2xl rounded-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-[#d4af37] tracking-[0.25em] uppercase font-bold">
                  {selectedAlbum.name.toLowerCase().includes('echoes') ? 'Upcoming Masterclass Album' : 'Official Masterclass Album'}
                </span>
                <h3 className="text-xl font-black tracking-wider uppercase text-white mt-1">{selectedAlbum.name}</h3>
                {selectedAlbum.albumDetails?.releaseYear && !selectedAlbum.name.toLowerCase().includes('echoes') && (
                  <p className="text-[10px] text-gray-400 mt-1">Released: {selectedAlbum.albumDetails.releaseYear}</p>
                )}
              </div>
              <button onClick={() => setSelectedAlbum(null)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="space-y-6">
              {(getProductImage(selectedAlbum) || selectedAlbum.image) && (
                <div className="w-full h-64 bg-black/40 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                  <img src={getProductImage(selectedAlbum) || selectedAlbum.image} alt={selectedAlbum.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}

              <div className="bg-black/60 p-4 border border-white/10">
                <p className="text-xs text-gray-300 uppercase tracking-widest leading-relaxed">{selectedAlbum.description || "Official studio record masterclass release by Robin Chand Thakuri."}</p>
                {selectedAlbum.albumDetails?.label && <p className="text-[10px] text-[#d4af37] mt-2">Label: {selectedAlbum.albumDetails.label}</p>}
                <p className="text-sm font-black text-[#d4af37] mt-3">Price: ${selectedAlbum.price.toFixed(2)}</p>
              </div>

              {selectedAlbum.name.toLowerCase().includes('echoes') && (
                <div className="bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-[#d4af37]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-[#d4af37]"></div>
                    <h4 className="text-xs uppercase font-black tracking-[0.3em] text-[#d4af37]">Masterclass Credits</h4>
                  </div>
                  <div className="space-y-3">
                    {albumCredits.map((credit, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{credit.role}</span>
                        <span className="text-sm text-white font-bold tracking-wide">{credit.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#d4af37]/20 text-center">
                    <p className="text-[9px] text-[#d4af37] uppercase tracking-[0.3em] font-black">✦ A BartKush Masterclass Production ✦</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs uppercase font-black tracking-[0.2em] text-[#d4af37]">Tracklist / Songs</h4>
                  {!selectedAlbum.name.toLowerCase().includes('echoes') && (
                    <button onClick={playAll} className="text-[10px] text-gray-400 hover:text-[#d4af37] transition-colors uppercase tracking-wider font-bold">Play all ▶</button>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedAlbum.name.toLowerCase().includes('echoes') ? (
                    <div className="bg-[#141414] p-8 text-center border border-white/5 rounded-lg">
                      <div className="text-3xl mb-3">🎵</div>
                      <p className="text-[#d4af37] text-sm font-black uppercase tracking-widest">Tracklist Coming Soon</p>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-2">This album has not been officially released yet.</p>
                    </div>
                  ) : (
                    selectedAlbum.albumDetails?.tracklist && selectedAlbum.albumDetails.tracklist.length > 0 ? (
                      selectedAlbum.albumDetails.tracklist.map((track, index) => (
                        <div key={index} className={`bg-[#141414] p-4 border border-white/5 hover:border-[#d4af37] transition-all duration-300 rounded-lg ${currentlyPlaying === index && isPlaying ? 'border-[#d4af37] bg-[#1a1a1a]' : ''}`}>
                          <div className="flex items-center gap-4">
                            <button onClick={() => togglePlay(index, track.audioFile)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${currentlyPlaying === index && isPlaying ? 'bg-[#d4af37] text-black' : 'bg-[#d4af37] text-black hover:scale-110'}`}>
                              {currentlyPlaying === index && isPlaying ? <span className="text-sm">⏸</span> : <span className="text-sm ml-0.5">▶</span>}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-sm text-white truncate">{track.title}</span>
                                {track.artist && <span className="text-xs text-gray-400">{track.artist}</span>}
                                {track.youtubeLink && (
                                  <a href={track.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#d4af37] transition-colors" title="Watch on YouTube" onClick={(e) => e.stopPropagation()}>
                                    <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                  </a>
                                )}
                              </div>
                              {track.views && <div className="text-[10px] text-gray-500 mt-0.5">{track.views}</div>}
                            </div>
                            <div className="text-xs text-gray-500 flex-shrink-0">{track.duration}</div>
                          </div>
                          {track.audioFile && (
                            <audio ref={el => audioRefs.current[index] = el} src={track.audioFile} onPlay={() => { setCurrentlyPlaying(index); setIsPlaying(true); }} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); setCurrentlyPlaying(null); }} className="hidden" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center py-8 text-sm">No tracklist available</div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-black tracking-[0.2em] text-[#d4af37] mb-3">Official Stream / YouTube Preview</h4>
                <a href={selectedAlbum.albumDetails?.youtubeLink || "https://www.youtube.com/watch?v=Ri3JuT-MquA"} target="_blank" rel="noopener noreferrer" className="block w-full h-48 bg-black border border-white/10 overflow-hidden relative group hover:border-[#d4af37] transition-all duration-300">
                  <img src={`https://img.youtube.com/vi/${(selectedAlbum.albumDetails?.youtubeLink || 'Ri3JuT-MquA').split('v=')[1] || 'Ri3JuT-MquA'}/hqdefault.jpg`} alt={selectedAlbum.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-300">
                    <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl"><span className="text-2xl text-black ml-1">▶</span></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">Watch on YouTube</span>
                  </div>
                </a>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                {selectedAlbum.name.toLowerCase().includes('echoes') ? (
                  <button onClick={(e) => handlePreSave(selectedAlbum, e)} className="flex-1 bg-[#d4af37] text-black font-black py-4 uppercase tracking-[0.25em] text-xs hover:bg-white transition-all shadow-xl">🔔 Pre-Save Album — ${selectedAlbum.price.toFixed(2)}</button>
                ) : (
                  <button onClick={(e) => { handleAddToCart(selectedAlbum, e); setSelectedAlbum(null); }} className="flex-1 bg-[#d4af37] text-black font-black py-4 uppercase tracking-[0.25em] text-xs hover:bg-white transition-all shadow-xl">Add Album to Cart — ${selectedAlbum.price.toFixed(2)}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ABOUT / DOSSIER PAGE (Music-Focused) */}
      {activeModal === 'dossier' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050505]">
          
          {/* Cinematic Background */}
          <div className="fixed inset-0 z-0">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-25 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/95 to-black"></div>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setActiveModal(null)} 
            className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/70 border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all duration-300 flex items-center justify-center text-xl font-bold"
          >
            ✕
          </button>

          <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20">

            {/* HERO TITLE */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-5">
                <span className="w-12 h-px bg-[#d4af37]"></span>
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#d4af37] font-black">The Artist</span>
                <span className="w-12 h-px bg-[#d4af37]"></span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-wider uppercase text-white mb-4 drop-shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
                Robin Chand Thakuri
              </h1>
              <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400 font-bold">
                Musician • Producer • Songwriter
              </p>
            </div>

            {/* PROFILE PHOTO + MUSIC INTRO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 items-center">
              <div className="md:col-span-1 flex justify-center">
                <div className="relative p-1.5 rounded-3xl border border-[#d4af37]/60 bg-black/40 shadow-2xl">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37] to-amber-700 rounded-3xl blur opacity-50"></div>
                  <img 
                    src={profileImage} 
                    alt="Robin Chand Thakuri" 
                    className="relative w-56 h-56 md:w-72 md:h-72 object-cover rounded-2xl"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="w-12 h-1 bg-[#d4af37] mb-6"></div>
                <h2 className="text-2xl md:text-3xl font-black tracking-wide uppercase text-white mb-4">
                  The Sound, The Story
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Robin Chand Thakuri is a musician and producer from Nepal whose work sits at the intersection of tradition and modern sound. His music explores the spaces between genres — weaving together the textures of hip-hop, rock, and experimental production into something entirely his own.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  His debut studio project, <span className="text-white italic">"Multiple Genre Disorder, Vol.1"</span>, was a statement of intent: a refusal to be boxed in. Now, with his upcoming album <span className="text-[#d4af37] italic">"The Echoes Of The West"</span>, he goes deeper — a cinematic exploration of western sound, culture, and the echoes that shape us.
                </p>
              </div>
            </div>

            {/* STATS BAR - MUSIC FOCUSED */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { value: "2021", label: "Since" },
                { value: "2+", label: "Projects" },
                { value: "∞", label: "Genre" },
                { value: "1", label: "Vision" }
              ].map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-[#d4af37]/30 rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-black text-[#d4af37] mb-2">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* MUSICAL MILESTONES */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#d4af37]"></div>
                <h3 className="text-xs uppercase font-black tracking-[0.3em] text-[#d4af37]">The Journey</h3>
              </div>
              <div className="space-y-4">
                {[
                  { year: "2021", title: "The Beginning", desc: "Robin Chand Thakuri begins his musical journey — writing, recording, and building his sound." },
                  { year: "2024", title: "Multiple Genre Disorder, Vol.1", desc: "Debut studio project released. A multi-genre statement that refuses to fit one box." },
                  { year: "2025", title: "The Echoes Of The West", desc: "Upcoming masterclass album. A cinematic exploration of western sound and culture." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-6 bg-[#0b0b0b]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#d4af37] transition-all duration-300">
                    <div className="flex-shrink-0">
                      <span className="text-2xl font-black text-[#d4af37]">{item.year}</span>
                    </div>
                    <div className="border-l border-[#d4af37]/30 pl-6">
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIGNATURE QUOTE - MUSIC FOCUSED */}
            <div className="bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-[#d4af37]/30 rounded-2xl p-10 text-center mb-16 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
              <div className="text-4xl text-[#d4af37] mb-4">"</div>
              <p className="text-lg md:text-xl text-white italic font-light leading-relaxed mb-4">
                Music is not a genre. It's a feeling. The Echoes Of The West is that feeling — the sound of where I've been and where I'm going.
              </p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37] font-black">— Robin Chand Thakuri</p>
            </div>

            {/* ✅ CONTACT SECTION */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#d4af37]"></div>
                <h3 className="text-xs uppercase font-black tracking-[0.3em] text-[#d4af37]">Bookings & Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Card */}
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-5 bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-[#d4af37]/30 rounded-xl p-6 hover:border-[#d4af37] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">Email</p>
                    <p className="text-white font-bold text-sm break-all">{contactInfo.email}</p>
                  </div>
                </a>

                {/* Phone Card */}
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-5 bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-[#d4af37]/30 rounded-xl p-6 hover:border-[#d4af37] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-all duration-300 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">Phone</p>
                    <p className="text-white font-bold text-sm break-all">{contactInfo.phone}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="w-12 h-px bg-[#d4af37]"></span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37] font-black">Listen</span>
                <span className="w-12 h-px bg-[#d4af37]"></span>
              </div>
              <div className="flex items-center justify-center gap-5">
                <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Spotify">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </a>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#d4af37] hover:text-black hover:scale-110 transition-all duration-300 text-[#d4af37]" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* FOOTER SIGNATURE */}
            <div className="text-center mt-20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-16 h-px bg-[#d4af37]/50"></span>
                <span className="text-[#d4af37] text-lg">✦</span>
                <span className="w-16 h-px bg-[#d4af37]/50"></span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">
                A BartKush Music Co. Masterclass Presentation
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Cart Sidebar */}
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
                          <p className="text-[11px] text-[#d4af37] mt-1">Rs {item.price.toFixed(2)} × {item.quantity}</p>
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
                  <span className="text-[#d4af37]">Rs {totalPrice.toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-[#d4af37] text-black font-black py-4 uppercase tracking-[0.25em] text-xs hover:bg-white transition-all shadow-xl">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals (tour, search, account) */}
      {activeModal && activeModal !== 'dossier' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          <div className="relative z-10 w-full max-w-lg bg-[#0b0b0b]/95 backdrop-blur-md border border-[#d4af37]/40 p-8 shadow-2xl rounded-2xl text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xs font-black tracking-[0.3em] uppercase text-[#d4af37]">{activeModal} archive</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

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
                <input type="text" placeholder="Type to search drops..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-xs uppercase tracking-widest text-white focus:border-[#d4af37] outline-none" />
                <button onClick={() => { setActiveModal(null); window.scrollTo({ top: 850, behavior: 'smooth' }); }} className="w-full bg-[#d4af37] text-black py-3 text-xs uppercase tracking-widest font-black">View Results in Catalog</button>
              </div>
            )}

            {activeModal === 'account' && (
              <div className="space-y-4 text-xs uppercase tracking-wider">
                <p className="text-gray-400">Elite Member Portal Access</p>
                <input type="email" placeholder="Enter Access Email" className="w-full bg-black border border-white/20 p-3 text-white outline-none focus:border-[#d4af37]" />
                <button onClick={() => alert('Access link dispatched.')} className="w-full bg-[#d4af37] text-black font-black py-3 uppercase tracking-widest">Authenticate</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/90 backdrop-blur-md py-16 px-8 text-center text-gray-400 text-xs tracking-widest uppercase relative z-10">
        <div className="flex flex-wrap justify-center gap-8 mb-8 text-gray-300 font-semibold text-xs">
          <span onClick={() => setActiveModal('dossier')} className="hover:text-[#d4af37] cursor-pointer transition-colors">About</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Help & Support</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-[#d4af37] cursor-pointer transition-colors">Cookie Choices</span>
        </div>
        <p className="mb-3 text-[#d4af37] font-bold tracking-widest">Bart kush music co. © {new Date().getFullYear()} Official Masterclass Store</p>
        <p className="text-[10px] text-gray-500 max-w-xl mx-auto mt-4 leading-normal">If you are using a screen reader and are having problems using this website, please call assistance at 866-682-4413.</p>
      </footer>

      <style>{`
        @keyframes worldClassCinematicMotion {
          0% { transform: scale(1) translate(0%, 0%); }
          33% { transform: scale(1.06) translate(-2%, 2%); }
          66% { transform: scale(1.04) translate(2%, -2%); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
        @keyframes goldPulse {
          0%, 100% { text-shadow: 0 0 6px rgba(212, 175, 55, 0.4), 0 0 12px rgba(212, 175, 55, 0.2); opacity: 0.95; }
          50% { text-shadow: 0 0 12px rgba(212, 175, 55, 0.9), 0 0 24px rgba(212, 175, 55, 0.6); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;