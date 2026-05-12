"use client";


import React, { useState, useEffect, useMemo } from 'react';
import { 
  Share2, 
  MessageCircle, 
  CheckCircle2, 
  PlusCircle, 
  Info, 
  Copy, 
  Smartphone,
  Trophy,
  Lock,
  Edit3,
  ExternalLink
} from 'lucide-react';

/**
 * ESTADOS DE STICKER:
 * 0: Me Falta (Gris)
 * 1: Lo Tengo (Azul)
 * 2: Repetida (Verde)
 */
const TOTAL_STICKERS = 980;
const APP_ID = "mundial-2026-album";

const App = () => {
  const [stickers, setStickers] = useState([]);
  const [phone, setPhone] = useState("71234567");
  const [viewMode, setViewMode] = useState('all'); 
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Inicialización y detección de modo (Compartido vs Dueño)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');

    if (sharedData) {
      try {
        // MODO LECTURA: Cargamos datos de la URL
        const decoded = JSON.parse(atob(sharedData));
        setStickers(decoded);
        setIsReadOnly(true);
        
        // Intentar obtener el teléfono de la URL si lo incluimos (opcional)
        const sharedPhone = params.get('p');
        if (sharedPhone) setPhone(sharedPhone);

      } catch (e) {
        loadLocalStorage();
      }
    } else {
      // MODO EDICIÓN: Cargamos datos del dueño
      loadLocalStorage();
      setIsReadOnly(false);
    }
    
    setIsLoading(false);
  }, []);

  const loadLocalStorage = () => {
    const saved = localStorage.getItem(`${APP_ID}-data`);
    const savedPhone = localStorage.getItem(`${APP_ID}-phone`);
    
    if (saved) setStickers(JSON.parse(saved));
    else setStickers(new Array(TOTAL_STICKERS).fill(0));
    
    if (savedPhone) setPhone(savedPhone);
  };

  // Guardar cambios automáticamente (Solo si no es modo lectura)
  useEffect(() => {
    if (!isLoading && !isReadOnly && stickers.length > 0) {
      localStorage.setItem(`${APP_ID}-data`, JSON.stringify(stickers));
      localStorage.setItem(`${APP_ID}-phone`, phone);
    }
  }, [stickers, phone, isLoading, isReadOnly]);

  const toggleSticker = (index) => {
    if (isReadOnly) return; // Bloquear edición en modo compartido
    const newStickers = [...stickers];
    newStickers[index] = ((newStickers[index] + 1) % 3);
    setStickers(newStickers);
  };

  const stats = useMemo(() => {
    const total = stickers.length;
    const missing = stickers.filter(s => s === 0).length;
    const owned = stickers.filter(s => s >= 1).length;
    const repeated = stickers.filter(s => s === 2).length;
    const progress = total > 0 ? ((owned / total) * 100).toFixed(1) : 0;
    
    return { missing, owned, repeated, progress };
  }, [stickers]);

  const handleShare = () => {
    const data = btoa(JSON.stringify(stickers));
    // Incluimos el teléfono en la URL para que el visitante sepa a quién contactar
    const url = `${window.location.origin}${window.location.pathname}?data=${data}&p=${phone}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getWhatsAppLink = () => {
    const repeatedList = stickers
      .map((s, i) => (s === 2 ? i + 1 : null))
      .filter(n => n !== null);

    const message = isReadOnly 
      ? `Hola, vi tu lista de repetidas del Mundial. Me interesan estas: ${repeatedList.slice(0, 10).join(', ')}...`
      : `¡Hola! Esta es mi lista de intercambio del Mundial 2026. Revísala aquí: ${window.location.href}`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      {/* Banner de Modo Lectura */}
      {isReadOnly && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center flex items-center justify-center gap-2">
          <Lock size={12} /> Vista de Invitado (Solo Lectura)          
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-100">
              <Trophy className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                Mundial <span className="text-indigo-600">2026</span>
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            {!isReadOnly && (
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                <Share2 size={16} /> Compartir
              </button>
            )}
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Estadísticas Visibles para todos */}
        <div className="bg-indigo-900 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Estado de la Colección</p>
              <h2 className="text-4xl font-black mb-2">{stats.progress}% completado</h2>
              <div className="w-full bg-indigo-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full transition-all" style={{ width: `${stats.progress}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-indigo-300 text-[9px] font-bold uppercase">Me Faltan</p>
                <p className="text-2xl font-black">{stats.missing}</p>
              </div>
              <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/10">
                <p className="text-emerald-300 text-[9px] font-bold uppercase text-emerald-300">Repetidas</p>
                <p className="text-2xl font-black text-emerald-400">{stats.repeated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Dueño vs Invitado */}
        {isReadOnly ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Contacto del Coleccionista</h4>
            </div>
            <a href={getWhatsAppLink()} target="_blank" className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Contactar
            </a>
          </div>
        ) : (
          <section className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center shadow-sm">
            <div className="flex items-center gap-3 flex-1 w-full px-2">
              <div className="text-indigo-600 bg-indigo-50 p-2 rounded-xl"><Edit3 size={18} /></div>
              <div className="flex-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tu WhatsApp para Intercambios</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full font-bold text-slate-700 bg-transparent focus:outline-none"
                  placeholder="Ej: 71234567"
                />
              </div>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
               <button onClick={() => setViewMode('all')} className={`flex-1 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${viewMode === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Todos</button>
               <button onClick={() => setViewMode('repeated')} className={`flex-1 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${viewMode === 'repeated' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>Repes</button>
            </div>
          </section>
        )}

        {/* Grid de Stickers */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {stickers.map((status, i) => {
            if (viewMode === 'repeated' && status !== 2) return null;
            
            return (
              <button
                key={i}
                onClick={() => toggleSticker(i)}
                disabled={isReadOnly}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-75 relative
                  border-b-4 text-[10px] font-black
                  ${status === 0 ? 'bg-white border-slate-100 text-slate-200' : ''}
                  ${status === 1 ? 'bg-indigo-500 border-indigo-700 text-white' : ''}
                  ${status === 2 ? 'bg-emerald-500 border-emerald-700 text-white shadow-lg shadow-emerald-100 ring-2 ring-emerald-100' : ''}
                  ${isReadOnly && status === 0 ? 'opacity-20 grayscale' : ''}
                  ${isReadOnly && status === 1 ? 'opacity-40' : ''}
                `}
              >
                {i + 1}
                {status === 2 && <PlusCircle size={8} className="absolute top-1 right-1" />}
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Flotante Solo para Invitados */}
      {isReadOnly && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-[60]">
          <a 
            href={getWhatsAppLink()} 
            target="_blank"
            className="flex items-center justify-center gap-3 bg-emerald-500 text-white p-4 rounded-3xl shadow-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition scale-105"
          >
            <MessageCircle size={20} /> Proponer Intercambio
          </a>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-widest">Enlace Copiado</span>
        </div>
      )}
    </div>
  );
};

export default App;