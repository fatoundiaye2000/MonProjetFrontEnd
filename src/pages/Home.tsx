import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import eventService from '../services/event.service';
import uploadService from '../services/upload.service';
import { Evenement, TypeEventDTO, AdresseDTO, TarifDTO, UserDTO } from '../types/event.types';
import { STORAGE_KEYS } from '../config/constants';

// ── Evenix color palette ──────────────────────────────────────────────────────
// Primary:    #f97316 (orange)   #ea580c (dark orange)
// Secondary:  #fb923c (soft)     #fdba74 (light)
// Background: #fff8f0 (cream)    #fef3e6 (warm cream)
// Accent:     #f59e0b (amber)    #fbbf24 (gold)
// Text:       #1c0a00 (dark)     #78350f (brown)
// ─────────────────────────────────────────────────────────────────────────────

// ── Types locaux ─────────────────────────────────────────────────────────────
interface StoredUser {
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  role?: string;
  roles?: Array<{ role?: string; nom?: string }>;
}

interface FooterLink {
  label: string;
  href?: string;
  fn?: () => void;
}

interface FooterCol {
  title: string;
  links: FooterLink[];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [loading, setLoading]             = useState(true);
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [userName, setUserName]           = useState('');
  const [backendImages, setBackendImages] = useState<string[]>([]);
  const [mounted, setMounted]             = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [activeCard, setActiveCard]       = useState<number | null>(null);
  const [menuOpen, setMenuOpen]           = useState(false);
  const navigate = useNavigate();
  const menuRef  = useRef<HTMLDivElement>(null);

  // ── Demo events — camelCase conforme à event.types.ts ────────────────────
  const demoEvents: Evenement[] = [
    {
      idEvent: 1,
      titreEvent: "Festival de Jazz International",
      description: "Découvrez les plus grands noms du jazz dans un cadre unique. Trois jours de concerts exceptionnels avec des artistes internationaux.",
      dateDebut: new Date('2026-06-15T18:00:00').toISOString(),
      dateFin:   new Date('2026-06-17T23:00:00').toISOString(),
      nbPlace: 250,
      image: "event_1767732541267_a1d12c20.png",
      tarif:       { idTarif:1, prix:35,  isPromotion:false } as TarifDTO,
      typeEvent:   { idTypeEvent:1, nomType:"Festival"   } as TypeEventDTO,
      adresse:     { idAdresse:1, ville:"Paris",     codePostal:"75015" } as AdresseDTO,
      organisateur:{ idUser:1,   nom:"Admin", prenom:"Culture", email:"admin@cultureevents.com" } as UserDTO,
    },
    {
      idEvent: 2,
      titreEvent: "Exposition d'Art Contemporain",
      description: "Une collection exceptionnelle d'œuvres d'art contemporain d'artistes émergents et confirmés du monde entier.",
      dateDebut: new Date('2026-03-10T10:00:00').toISOString(),
      dateFin:   new Date('2026-05-10T18:00:00').toISOString(),
      nbPlace: 150,
      image: "event_1767732256076_7594c16a.jpg",
      tarif:       { idTarif:2, prix:0,   isPromotion:false } as TarifDTO,
      typeEvent:   { idTypeEvent:2, nomType:"Exposition" } as TypeEventDTO,
      adresse:     { idAdresse:2, ville:"Lyon",      codePostal:"69001" } as AdresseDTO,
      organisateur:{ idUser:1,   nom:"Admin", prenom:"Culture", email:"admin@cultureevents.com" } as UserDTO,
    },
    {
      idEvent: 3,
      titreEvent: "Spectacle de Danse Moderne",
      description: "Une performance captivante mêlant danse contemporaine et nouvelles technologies dans un spectacle inoubliable.",
      dateDebut: new Date('2026-09-22T20:00:00').toISOString(),
      dateFin:   new Date('2026-09-22T22:00:00').toISOString(),
      nbPlace: 200,
      image: "event_1767732304324_ee1f3d49.jpg",
      tarif:       { idTarif:3, prix:25,  isPromotion:false } as TarifDTO,
      typeEvent:   { idTypeEvent:3, nomType:"Spectacle"  } as TypeEventDTO,
      adresse:     { idAdresse:3, ville:"Marseille", codePostal:"13001" } as AdresseDTO,
      organisateur:{ idUser:1,   nom:"Admin", prenom:"Culture", email:"admin@cultureevents.com" } as UserDTO,
    },
  ];

  // ── Helpers stockage ─────────────────────────────────────────────────────
  const getStoredUser = (): StoredUser | null => {
    try { const s = localStorage.getItem(STORAGE_KEYS.USER); return s ? JSON.parse(s) : null; }
    catch { return null; }
  };
  const storedUser = getStoredUser();

  // ✅ isAdmin : compatible nouvelle structure Spring (roles[]) et ancienne (role string)
  const isAdmin = (() => {
    if (!storedUser) return false;
    if (Array.isArray(storedUser.roles) && storedUser.roles.length > 0)
      return storedUser.roles.some(r => r.role === 'ADMIN' || r.nom === 'ADMIN');
    if (typeof storedUser.role === 'string') return storedUser.role === 'ADMIN';
    if (storedUser.email === 'admin@example.com') return true;
    return false;
  })();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const checkAuth = () => {
    const tok = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const usr = localStorage.getItem(STORAGE_KEYS.USER);
    if (tok && usr) {
      try {
        const d: StoredUser = JSON.parse(usr);
        setIsLoggedIn(true);
        // ✅ Affiche nom, prénom, username ou email — dans cet ordre de priorité
        setUserName(d.nom || d.prenom || d.username || d.email || 'Utilisateur');
      } catch { setIsLoggedIn(false); setUserName(''); }
    } else { setIsLoggedIn(false); setUserName(''); }
  };

  useEffect(() => {
    checkAuth();
    let alive = true;
    (async () => { try { setLoading(true); await eventService.getAllEvents(); } catch { /* ignore */ } finally { if (alive) setLoading(false); } })();
    (async () => {
      try { const imgs = await uploadService.getAllImages(); if (alive) setBackendImages(imgs.length > 0 ? imgs : uploadService.BACKEND_IMAGES); }
      catch { if (alive) setBackendImages(uploadService.BACKEND_IMAGES); }
    })();
    return () => { alive = false; };
  }, []);

  const isAuth  = () => !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  const goGuard = (path: string) => { if (!isAuth()) navigate('/login'); else navigate(path); setMenuOpen(false); };
  const doLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN); localStorage.removeItem(STORAGE_KEYS.USER);
    setIsLoggedIn(false); setUserName(''); navigate('/'); setMenuOpen(false);
  };

  const getImg = useCallback((ev: Evenement): string => {
    if (ev.image?.trim()) return uploadService.getImageUrl(ev.image);
    if (backendImages.length > 0) {
      const found = backendImages.find(i => i.toLowerCase().includes(ev.typeEvent?.nomType?.toLowerCase() ?? ''));
      if (found) return uploadService.getImageUrl(found);
    }
    return uploadService.getRandomBackendImage();
  }, [backendImages]);

  const onImgErr = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const t = e.target as HTMLImageElement; t.src = uploadService.getRandomBackendImage(); t.onerror = null;
  };

  const fmtDate = (d: string) => {
    try { const dt = new Date(d); return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }); }
    catch { return ''; }
  };
  const fmtTime = (d: string) => {
    try { const dt = new Date(d); return isNaN(dt.getTime()) ? '' : `${dt.getHours().toString().padStart(2,'0')}h${dt.getMinutes().toString().padStart(2,'0')}`; }
    catch { return ''; }
  };

  // ✅ tarif.prix (conforme TarifDTO) — plus tarif.montant
  const fmtTarif = (ev: Evenement) => {
    if (!ev.tarif) return 'N/A';
    return (ev.tarif.prix === 0 || ev.tarif.prix === undefined) ? 'Gratuit' : `${ev.tarif.prix}€`;
  };

  // ── Evenix palette ────────────────────────────────────────────────────────
  const eventPalette = [
    { from:'#f97316', to:'#ea580c', shadow:'rgba(249,115,22,0.35)' },
    { from:'#f59e0b', to:'#f97316', shadow:'rgba(245,158,11,0.35)' },
    { from:'#fb923c', to:'#f59e0b', shadow:'rgba(251,146,60,0.35)' },
  ];

  const serviceList = [
    { icon:'🎭', title:'Festivals Culturels',     desc:'Festivals thématiques : musique, théâtre, danse, arts visuels pour tous',  tag:'Festival',   from:'#f97316', to:'#ea580c' },
    { icon:'🎵', title:'Concerts & Spectacles',   desc:'Concerts en plein air, spectacles vivants, théâtre, danse contemporaine',   tag:'Concert',    from:'#f59e0b', to:'#f97316' },
    { icon:'🎨', title:'Arts & Expositions',      desc:'Expositions artistiques, photographie, arts plastiques, installations',     tag:'Exposition', from:'#fb923c', to:'#f59e0b' },
    { icon:'💼', title:'Événements Entreprises',  desc:'Team building culturel, soirées de gala, lancements de produits',           tag:'Conférence', from:'#ea580c', to:'#dc2626' },
    { icon:'👥', title:'Ateliers Participatifs',  desc:'Ateliers danse, chant, peinture, création artistique pour tous niveaux',    tag:'Atelier',    from:'#f97316', to:'#f59e0b' },
    { icon:'🎤', title:'Conférences Culturelles', desc:'Tables rondes, conférences, débats sur des thématiques culturelles',         tag:'Conférence', from:'#f59e0b', to:'#ea580c' },
  ];

  const menuItems = [
    { emoji:'🏠', label:'Accueil',              from:'#f97316', to:'#fb923c', action: () => { document.getElementById('accueil')?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); } },
    { emoji:'📊', label:'Tableau de bord',       from:'#f97316', to:'#ea580c', action: () => goGuard('/dashboard') },
    { emoji:'📅', label:'Voir les événements',   from:'#f59e0b', to:'#f97316', action: () => goGuard('/events') },
    { emoji:'👥', label:'Inscription événement', from:'#fb923c', to:'#f59e0b', action: () => goGuard('/events') },
    { emoji:'🎫', label:'Les réservations',      from:'#ea580c', to:'#f97316', action: () => goGuard('/mes-reservations') },
    { emoji:'➕', label:'Créer un événement',    from:'#f97316', to:'#f59e0b', action: () => goGuard('/create-event') },
    { emoji:'📈', label:'Statistiques',          from:'#f59e0b', to:'#ea580c', action: () => goGuard('/statistiques') },
    { emoji:'⚙️', label:'Paramètres',            from:'#78350f', to:'#92400e', action: () => goGuard('/parametres') },
  ];

  // ── Footer columns ────────────────────────────────────────────────────────
  const footerCols: FooterCol[] = [
    { title:'Navigation', links:[
      { label:'Accueil',       fn: () => document.getElementById('accueil')?.scrollIntoView({behavior:'smooth'}) },
      { label:'Événements',    href:'#evenements' },
      { label:'Services',      href:'#services' },
      { label:'Tableau de bord', fn: () => goGuard('/dashboard') },
    ]},
    { title:'Événements', links:[
      { label:'Voir tous',         fn: () => goGuard('/events') },
      { label:'Créer',             fn: () => goGuard('/create-event') },
      { label:'Mes réservations',  fn: () => goGuard('/mes-reservations') },
      { label:'Connexion',         fn: () => navigate('/login') },
    ]},
    { title:'Technique', links:[
      { label:'React + TypeScript' },
      { label:'Spring Boot 3.5.0' },
      { label:'MySQL 5.7.24' },
    ]},
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#fff8f0', minHeight:'100vh' }}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.88)',
        backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${scrolled ? 'rgba(249,115,22,0.20)' : 'rgba(249,115,22,0.10)'}`,
        boxShadow: scrolled ? '0 4px 32px rgba(249,115,22,0.12)' : 'none',
        transition:'all 0.3s ease',
      }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:72 }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, color:'#fff', boxShadow:'0 6px 20px rgba(249,115,22,0.45)', flexShrink:0 }}>CE</div>
            <div>
              <div style={{ fontWeight:900, fontSize:20, background:'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1.2 }}>CultureEvents</div>
              <div style={{ fontSize:11, color:'#c2410c', fontWeight:600 }}>Gestion Événementielle</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop">
            {[
              { label:'Accueil',    fn: () => document.getElementById('accueil')?.scrollIntoView({behavior:'smooth'}) },
              { label:'Événements', href:'#evenements' },
              { label:'Services',   href:'#services' },
            ].map(lk => lk.href
              ? <a key={lk.label} href={lk.href} className="navpill">{lk.label}</a>
              : <button key={lk.label} onClick={lk.fn} className="navpill">{lk.label}</button>
            )}
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {!isLoggedIn && (
              <Link to="/login" className="nav-desktop" style={{ padding:'10px 20px', borderRadius:12, fontSize:14, fontWeight:700, color:'#c2410c', background:'rgba(249,115,22,0.09)', border:'2px solid rgba(249,115,22,0.25)', textDecoration:'none', transition:'all 0.2s', whiteSpace:'nowrap' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.18)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.09)'}>
                Connexion
              </Link>
            )}

            {/* HAMBURGER */}
            <div style={{ position:'relative' }} ref={menuRef}>
              <button onClick={() => setMenuOpen(p => !p)} aria-label="Menu"
                style={{ width:48, height:48, borderRadius:15, border:'none', cursor:'pointer', background: menuOpen ? 'linear-gradient(135deg,#ea580c,#dc2626)' : 'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, boxShadow: menuOpen ? '0 8px 28px rgba(249,115,22,0.60)' : '0 4px 16px rgba(249,115,22,0.42)', transform: menuOpen ? 'scale(0.93)' : 'scale(1)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', padding:0 }}>
                <span style={{ width:20, height:2.5, borderRadius:2, background:'#fff', display:'block', transition:'all 0.28s', transformOrigin:'center', transform: menuOpen ? 'rotate(45deg) translate(5px,5.5px)' : 'none' }}/>
                <span style={{ width:20, height:2.5, borderRadius:2, background:'#fff', display:'block', transition:'all 0.28s', opacity: menuOpen ? 0 : 1 }}/>
                <span style={{ width:20, height:2.5, borderRadius:2, background:'#fff', display:'block', transition:'all 0.28s', transformOrigin:'center', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5.5px)' : 'none' }}/>
              </button>

              {menuOpen && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 12px)', width:308, background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 28px 80px rgba(249,115,22,0.22), 0 0 0 1.5px rgba(249,115,22,0.13)', animation:'dropIn 0.26s cubic-bezier(0.34,1.56,0.64,1)', zIndex:200 }}>

                  {/* Header dropdown */}
                  {isLoggedIn ? (
                    <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:13, background:'linear-gradient(135deg,rgba(249,115,22,0.08),rgba(234,88,12,0.06))', borderBottom:'1px solid rgba(249,115,22,0.10)' }}>
                      <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18, flexShrink:0, boxShadow:'0 4px 14px rgba(249,115,22,0.42)' }}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {/* ✅ Affiche le nom réel (nom/prenom/username/email) */}
                        <div style={{ fontSize:14, fontWeight:800, color:'#1c0a00' }}>{userName}</div>
                        <div style={{ fontSize:12, color:'#10b981', fontWeight:600, marginTop:2 }}>● Connecté</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding:'15px 20px', background:'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(245,158,11,0.05))', borderBottom:'1px solid rgba(249,115,22,0.09)' }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'#c2410c', letterSpacing:2, textTransform:'uppercase', marginBottom:3 }}>Navigation</div>
                      <div style={{ fontSize:15, fontWeight:800, color:'#1c0a00' }}>CultureEvents 🎭</div>
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ padding:'10px 10px 8px', display:'flex', flexDirection:'column', gap:2 }}>
                    {menuItems.map((item, i) => (
                      <button key={i} onClick={item.action}
                        style={{ width:'100%', textAlign:'left', padding:'11px 14px', borderRadius:14, fontSize:14, fontWeight:600, color:'#78350f', border:'2px solid transparent', background:'transparent', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s ease', display:'flex', alignItems:'center', gap:10 }}
                        onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=`linear-gradient(135deg,${item.from}18,${item.to}0d)`; el.style.borderColor=`${item.from}35`; el.style.color=item.from; el.style.transform='translateX(5px)'; el.style.paddingLeft='18px'; }}
                        onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='transparent'; el.style.color='#78350f'; el.style.transform='translateX(0)'; el.style.paddingLeft='14px'; }}>
                        <span style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${item.from}22,${item.to}18)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.emoji}</span>
                        {item.label}
                      </button>
                    ))}

                    {isAdmin && (
                      <>
                        <div style={{ height:1, background:'linear-gradient(90deg,rgba(249,115,22,0.18),transparent)', margin:'4px 0' }}/>
                        <button onClick={() => goGuard('/admin/users')}
                          style={{ width:'100%', textAlign:'left', padding:'11px 14px', borderRadius:14, fontSize:14, fontWeight:600, color:'#d97706', border:'2px solid transparent', background:'rgba(245,158,11,0.07)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s', display:'flex', alignItems:'center', gap:10 }}
                          onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(245,158,11,0.15)'; el.style.transform='translateX(5px)'; }}
                          onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(245,158,11,0.07)'; el.style.transform='translateX(0)'; }}>
                          <span style={{ width:32, height:32, borderRadius:10, background:'rgba(245,158,11,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>👨‍💼</span>
                          Gestion utilisateurs
                        </button>
                      </>
                    )}

                    <div style={{ height:1, background:'linear-gradient(90deg,rgba(249,115,22,0.15),transparent)', margin:'4px 0' }}/>

                    {storedUser ? (
                      <button onClick={doLogout}
                        style={{ width:'100%', textAlign:'left', padding:'11px 14px', borderRadius:14, fontSize:14, fontWeight:700, color:'#dc2626', border:'2px solid transparent', background:'rgba(239,68,68,0.06)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s', display:'flex', alignItems:'center', gap:10 }}
                        onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(239,68,68,0.14)'; el.style.borderColor='rgba(239,68,68,0.25)'; el.style.transform='translateX(5px)'; }}
                        onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(239,68,68,0.06)'; el.style.borderColor='transparent'; el.style.transform='translateX(0)'; }}>
                        <span style={{ width:32, height:32, borderRadius:10, background:'rgba(239,68,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🚪</span>
                        Déconnexion
                      </button>
                    ) : (
                      <div style={{ display:'flex', gap:8, padding:'4px 0' }}>
                        <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
                          style={{ flex:1, padding:'11px 0', borderRadius:14, fontSize:13, fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#f97316,#ea580c)', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(249,115,22,0.42)', transition:'all 0.2s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform='translateY(0)'}>
                          🔑 Connexion
                        </button>
                        <button onClick={() => { navigate('/register'); setMenuOpen(false); }}
                          style={{ flex:1, padding:'11px 0', borderRadius:14, fontSize:13, fontWeight:700, color:'#c2410c', background:'rgba(249,115,22,0.09)', border:'2px solid rgba(249,115,22,0.28)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.20)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.09)'}>
                          📝 Inscription
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section id="accueil" style={{ position:'relative', overflow:'hidden', minHeight:'92vh', display:'flex', alignItems:'center', background:'linear-gradient(160deg,#fff8f0 0%,#fef3e6 50%,#fef0d8 100%)' }}>
        <div className="blob blob-orange1"/><div className="blob blob-orange2"/><div className="blob blob-amber"/><div className="blob blob-cream"/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(249,115,22,0.10) 1.5px,transparent 1.5px)', backgroundSize:'30px 30px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'80px 24px', width:'100%', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(40px)', transition:'opacity 0.9s ease,transform 0.9s ease' }}>

            <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'9px 22px', borderRadius:100, marginBottom:36, background:'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(234,88,12,0.08))', border:'2px solid rgba(249,115,22,0.25)', fontSize:13, fontWeight:700, color:'#c2410c', animation:'fadeUp 0.7s ease 0.2s both' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#ea580c)', display:'inline-block', animation:'pulseDot 2s infinite' }}/>
              ✨ Saison Culturelle 2026 — Réservations ouvertes !
            </div>

            <h1 style={{ fontSize:'clamp(44px,8vw,96px)', fontWeight:900, lineHeight:1.0, marginBottom:28, animation:'fadeUp 0.7s ease 0.3s both' }}>
              <span style={{ display:'block', color:'#1c0a00' }}>Gestion</span>
              <span style={{ display:'block', background:'linear-gradient(135deg,#f97316 0%,#ea580c 40%,#f59e0b 80%,#fbbf24 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'300% auto', animation:'shimmer 5s linear infinite' }}>Événementielle</span>
              <span style={{ display:'block', fontSize:'52%', fontWeight:700, color:'#c2410c', marginTop:8, opacity:0.75 }}>Pour les Professionnels de la Culture</span>
            </h1>

            <p style={{ fontSize:18, color:'#78350f', maxWidth:580, margin:'0 auto 44px', lineHeight:1.75, animation:'fadeUp 0.7s ease 0.45s both', opacity:0.85 }}>
              {isLoggedIn ? `Bienvenue ${userName} 👋 — Vos événements culturels 2026 vous attendent !` : "Découvrez, réservez et gérez vos événements culturels avec une plateforme intuitive et chaleureuse."}
            </p>

            <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap', animation:'fadeUp 0.7s ease 0.55s both' }}>
              {isLoggedIn
                ? <><Link to="/dashboard/evenements" className="btn-hero-primary">🎉 Voir les événements</Link><Link to="/dashboard" className="btn-hero-ghost">Tableau de bord</Link></>
                : <><Link to="/register" className="btn-hero-primary">🚀 Créer un compte</Link><a href="#evenements" className="btn-hero-ghost">Découvrir les événements</a></>
              }
            </div>

            <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:48, marginTop:72, paddingTop:48, borderTop:'2px solid rgba(249,115,22,0.12)', animation:'fadeUp 0.7s ease 0.7s both' }}>
              {[
                { n: demoEvents.length,                                          label:'Événements 2026',    emoji:'🎭', color:'#f97316' },
                { n: demoEvents.reduce((t, ev) => t + (ev.nbPlace ?? 0), 0),    label:'Places disponibles', emoji:'🎟️', color:'#ea580c' },
                { n: 3,                                                          label:'Catégories',          emoji:'🎨', color:'#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:6 }}>{s.emoji}</div>
                  <div style={{ fontSize:40, fontWeight:900, color:s.color, lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:13, color:'#92400e', fontWeight:600, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ EVENTS ══════════ */}
      <section id="evenements" style={{ padding:'100px 0', background:'#fff' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 18px', borderRadius:100, marginBottom:20, background:'rgba(249,115,22,0.10)', border:'2px solid rgba(249,115,22,0.22)', fontSize:12, fontWeight:800, color:'#c2410c', letterSpacing:2, textTransform:'uppercase' }}>
              🎭 Événements
            </div>
            <h2 style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:900, color:'#1c0a00', lineHeight:1.15, marginBottom:16 }}>
              À l'affiche en <span style={{ background:'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>2026</span>
            </h2>
            <p style={{ fontSize:17, color:'#78350f', maxWidth:480, margin:'0 auto', opacity:0.8 }}>Des événements uniques pour tous les passionnés de culture.</p>
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, padding:60 }}>
              <div className="spinner-orange"/>
              <p style={{ color:'#c2410c', fontSize:15, fontWeight:600 }}>Chargement des événements…</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:28 }}>
              {demoEvents.map((ev, idx) => {
                const c    = eventPalette[idx % eventPalette.length];
                const isHov = activeCard === ev.idEvent;
                return (
                  <article key={ev.idEvent}
                    onMouseEnter={() => setActiveCard(ev.idEvent)}
                    onMouseLeave={() => setActiveCard(null)}
                    style={{ borderRadius:24, background:'#fff', border:`2px solid ${isHov ? c.from+'45' : '#fde8d8'}`, boxShadow: isHov ? `0 24px 64px ${c.shadow}` : '0 4px 22px rgba(249,115,22,0.08)', overflow:'hidden', cursor:'pointer', transform: isHov ? 'translateY(-8px)' : 'translateY(0)', transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                    {/* Image */}
                    <div style={{ height:220, position:'relative', overflow:'hidden', background:`linear-gradient(135deg,${c.from}20,${c.to}12)` }}>
                      <img src={getImg(ev)} alt={ev.titreEvent} onError={onImgErr}
                        style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease', transform: isHov ? 'scale(1.07)' : 'scale(1)' }}/>
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(28,10,0,0.45) 0%,transparent 60%)' }}/>
                      <div style={{ position:'absolute', top:16, left:16 }}>
                        {/* ✅ typeEvent.nomType (camelCase) */}
                        <span style={{ padding:'5px 14px', borderRadius:100, fontSize:11, fontWeight:800, background:`linear-gradient(135deg,${c.from},${c.to})`, color:'#fff', boxShadow:`0 4px 12px ${c.shadow}`, letterSpacing:0.5 }}>
                          {ev.typeEvent?.nomType ?? 'Événement'}
                        </span>
                      </div>
                      <div style={{ position:'absolute', top:14, right:14 }}>
                        {/* ✅ tarif.prix (camelCase) */}
                        <span style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:800, background: (ev.tarif?.prix === 0) ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.92)', color: (ev.tarif?.prix === 0) ? '#fff' : c.from }}>
                          {fmtTarif(ev)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding:'22px 24px 24px' }}>
                      {/* ✅ titreEvent */}
                      <h3 style={{ fontSize:18, fontWeight:800, color:'#1c0a00', marginBottom:10, lineHeight:1.3 }}>{ev.titreEvent}</h3>
                      <p style={{ fontSize:13, color:'#78350f', lineHeight:1.7, marginBottom:18, opacity:0.8 }}>{ev.description?.substring(0,110)}…</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
                        {[
                          { emoji:'📅', val: fmtDate(ev.dateDebut) },        // ✅ dateDebut
                          { emoji:'🕐', val: fmtTime(ev.dateDebut) },        // ✅ dateDebut
                          { emoji:'📍', val: ev.adresse?.ville ?? 'Lieu TBD' },
                          { emoji:'🪑', val: `${ev.nbPlace ?? 0} places` },  // ✅ nbPlace
                        ].map((m, mi) => m.val ? (
                          <span key={mi} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:'#92400e', background:'rgba(249,115,22,0.08)', padding:'4px 12px', borderRadius:100, fontWeight:600 }}>
                            {m.emoji} {m.val}
                          </span>
                        ) : null)}
                      </div>
                      {/* ✅ idEvent */}
                      <button onClick={() => navigate(`/events/${ev.idEvent}`)}
                        style={{ width:'100%', padding:'12px', borderRadius:14, fontSize:14, fontWeight:800, color:'#fff', background:`linear-gradient(135deg,${c.from},${c.to})`, border:'none', cursor:'pointer', boxShadow:`0 6px 20px ${c.shadow}`, transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:"'DM Sans',sans-serif" }}
                        onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-2px) scale(1.01)'; el.style.boxShadow=`0 12px 32px ${c.shadow}`; }}
                        onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0) scale(1)'; el.style.boxShadow=`0 6px 20px ${c.shadow}`; }}>
                        🎫 Réserver ma place
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:56 }}>
            <button onClick={() => goGuard('/events')}
              style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'15px 36px', borderRadius:16, fontSize:16, fontWeight:800, color:'#fff', background:'linear-gradient(135deg,#f97316,#ea580c)', border:'none', cursor:'pointer', boxShadow:'0 10px 32px rgba(249,115,22,0.42)', transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:"'DM Sans',sans-serif" }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-3px) scale(1.02)'; el.style.boxShadow='0 18px 48px rgba(249,115,22,0.55)'; }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0) scale(1)'; el.style.boxShadow='0 10px 32px rgba(249,115,22,0.42)'; }}>
              Voir tous les événements <span style={{ fontSize:18 }}>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section id="services" style={{ padding:'100px 0', background:'linear-gradient(160deg,#fff8f0,#fef3e6)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 18px', borderRadius:100, marginBottom:20, background:'rgba(249,115,22,0.10)', border:'2px solid rgba(249,115,22,0.22)', fontSize:12, fontWeight:800, color:'#c2410c', letterSpacing:2, textTransform:'uppercase' }}>
              ✨ Services
            </div>
            <h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:900, color:'#1c0a00', lineHeight:1.15, marginBottom:16 }}>
              Tout pour votre <span style={{ background:'linear-gradient(135deg,#f97316,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Culture</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:22 }}>
            {serviceList.map((svc, i) => (
              <div key={i}
                style={{ padding:'28px 26px', borderRadius:22, background:'#fff', border:'2px solid #fde8d8', boxShadow:'0 4px 20px rgba(249,115,22,0.07)', cursor:'pointer', transition:'all 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}
                onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-6px)'; el.style.boxShadow='0 22px 52px rgba(249,115,22,0.18)'; el.style.borderColor=`${svc.from}45`; }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='0 4px 20px rgba(249,115,22,0.07)'; el.style.borderColor='#fde8d8'; }}>
                <div style={{ width:60, height:60, borderRadius:18, background:`linear-gradient(135deg,${svc.from}20,${svc.to}14)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:18 }}>{svc.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:800, color:'#1c0a00', marginBottom:10 }}>{svc.title}</h3>
                <p style={{ fontSize:13, color:'#78350f', lineHeight:1.75, marginBottom:16, opacity:0.82 }}>{svc.desc}</p>
                <span style={{ fontSize:11, fontWeight:800, color:svc.from, background:`${svc.from}15`, padding:'4px 12px', borderRadius:100 }}>{svc.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section style={{ padding:'80px 0', background:'linear-gradient(135deg,#f97316,#ea580c,#f59e0b)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.07) 1.5px,transparent 1.5px)', backgroundSize:'24px 24px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px', textAlign:'center', position:'relative' }}>
          <h2 style={{ fontSize:'clamp(28px,5vw,46px)', fontWeight:900, color:'#fff', marginBottom:16, lineHeight:1.2 }}>Prêt à créer des moments inoubliables ?</h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.87)', marginBottom:38, lineHeight:1.7 }}>Rejoignez CultureEvents et gérez tous vos événements culturels depuis une seule plateforme.</p>
          <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap' }}>
            <button onClick={() => navigate('/register')}
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'14px 32px', borderRadius:16, fontSize:16, fontWeight:800, color:'#f97316', background:'#fff', border:'none', cursor:'pointer', boxShadow:'0 8px 28px rgba(0,0,0,0.2)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:"'DM Sans',sans-serif" }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-3px) scale(1.03)'; el.style.boxShadow='0 16px 42px rgba(0,0,0,0.28)'; }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0) scale(1)'; el.style.boxShadow='0 8px 28px rgba(0,0,0,0.2)'; }}>
              🚀 Commencer maintenant
            </button>
            <button onClick={() => navigate('/login')}
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'14px 32px', borderRadius:16, fontSize:16, fontWeight:700, color:'#fff', background:'rgba(255,255,255,0.18)', border:'2px solid rgba(255,255,255,0.42)', cursor:'pointer', transition:'all 0.22s', fontFamily:"'DM Sans',sans-serif" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.30)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.18)'}>
              🔑 Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background:'#1c0a00', padding:'72px 0 32px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:48, marginBottom:56 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color:'#fff', boxShadow:'0 4px 14px rgba(249,115,22,0.4)' }}>CE</div>
                <div><div style={{ fontWeight:800, fontSize:18, color:'#fff' }}>CultureEvents</div><div style={{ fontSize:11, color:'#fb923c', fontWeight:600 }}>Gestion événementielle</div></div>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.40)', lineHeight:1.8 }}>Plateforme complète pour la gestion d'événements culturels professionnels.</p>
            </div>
            {/* ✅ footerCols typé — plus de (lk as any) */}
            {footerCols.map((col, ci) => (
              <div key={ci}>
                <h4 style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.38)', letterSpacing:3, textTransform:'uppercase', marginBottom:20 }}>{col.title}</h4>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12 }}>
                  {col.links.map((lk, li) => (
                    <li key={li}>
                      {lk.href
                        ? <a href={lk.href} style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.2s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#fb923c'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.45)'}>{lk.label}</a>
                        : lk.fn
                          ? <button onClick={lk.fn} style={{ fontSize:14, color:'rgba(255,255,255,0.45)', background:'none', border:'none', cursor:'pointer', padding:0, transition:'color 0.2s', textAlign:'left' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#fb923c'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.45)'}>{lk.label}</button>
                          : <span style={{ fontSize:14, color:'rgba(255,255,255,0.28)' }}>{lk.label}</span>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.08)', gap:12 }}>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.28)' }}>© {new Date().getFullYear()} CultureEvents. Tous droits réservés.</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.20)' }}>Projet BTS SIO SLAM · React + Spring Boot</p>
          </div>
        </div>
      </footer>

      {/* ══════════ GLOBAL STYLES ══════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        .blob { position:absolute; border-radius:50%; pointer-events:none; }
        .blob-orange1 { width:650px; height:650px; background:radial-gradient(circle,rgba(249,115,22,0.20) 0%,transparent 65%); top:-200px; left:-150px; animation:blob1 9s ease-in-out infinite; }
        .blob-orange2 { width:520px; height:520px; background:radial-gradient(circle,rgba(234,88,12,0.16) 0%,transparent 65%); top:-80px; right:-80px; animation:blob2 11s ease-in-out infinite; }
        .blob-amber   { width:460px; height:460px; background:radial-gradient(circle,rgba(245,158,11,0.14) 0%,transparent 65%); bottom:-80px; left:32%; animation:blob3 13s ease-in-out infinite; }
        .blob-cream   { width:360px; height:360px; background:radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 65%); bottom:0; right:8%; animation:blob1 10s ease-in-out infinite reverse; }
        .navpill { padding:8px 16px; border-radius:12px; font-size:14px; font-weight:600; color:#78350f; text-decoration:none; border:none; background:transparent; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .navpill:hover { color:#f97316; background:rgba(249,115,22,0.09); }
        .nav-desktop { display:flex; align-items:center; gap:4px; }
        @media(max-width:1023px) { .nav-desktop { display:none !important; } }
        .btn-hero-primary { padding:17px 40px; border-radius:18px; font-weight:800; font-size:17px; color:#fff; background:linear-gradient(135deg,#f97316,#ea580c); box-shadow:0 10px 35px rgba(249,115,22,0.45); text-decoration:none; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:inline-block; font-family:'DM Sans',sans-serif; }
        .btn-hero-primary:hover { transform:translateY(-4px) scale(1.03); box-shadow:0 18px 50px rgba(249,115,22,0.60); }
        .btn-hero-ghost { padding:17px 40px; border-radius:18px; font-weight:700; font-size:17px; color:#c2410c; background:rgba(249,115,22,0.09); border:2.5px solid rgba(249,115,22,0.28); text-decoration:none; transition:all 0.25s; display:inline-block; font-family:'DM Sans',sans-serif; }
        .btn-hero-ghost:hover { background:rgba(249,115,22,0.18); transform:translateY(-2px); }
        .spinner-orange { width:48px; height:48px; border:5px solid rgba(249,115,22,0.15); border-top:5px solid #f97316; border-radius:50%; animation:spin 0.8s linear infinite; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(249,115,22,0.30); border-radius:100px; }
        @keyframes blob1    { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(60px,-50px) scale(1.09);} 66%{transform:translate(-35px,35px) scale(0.94);} }
        @keyframes blob2    { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(-60px,50px) scale(1.07);} 70%{transform:translate(40px,-30px) scale(0.96);} }
        @keyframes blob3    { 0%,100%{transform:translate(0,0);} 50%{transform:translate(50px,-60px) scale(1.06);} }
        @keyframes shimmer  { 0%{background-position:0% center;} 100%{background-position:300% center;} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes dropIn   { from{opacity:0;transform:translateY(-14px) scale(0.93);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes spin     { to{transform:rotate(360deg);} }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }
      `}</style>
    </div>
  );
}