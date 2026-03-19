// src/pages/DashboardPage.tsx
// ── Evenix palette ────────────────────────────────────────────────────────────
// Primary:    #f97316 (orange)   #ea580c (dark orange)
// Soft:       #fb923c            #fdba74
// Background: #fff8f0 (cream)    #fef3e6
// Accent:     #f59e0b (amber)    #fbbf24 (gold)
// Text:       #1c0a00            #78350f  #92400e
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Evenement {
  id_event: number; titre_event: string; description: string;
  date_debut: string; date_fin: string; nb_place: number; image: string;
  type_event: { nom_type: string }; tarif: { montant: number };
}
interface Reservation {
  id: number; nom: string; email: string; evenement: string;
  date: string; places: number; montant: number;
  statut: 'confirmé' | 'en attente' | 'annulé';
}
interface User {
  id: number; name: string; email: string;
  role: 'admin' | 'organisateur' | 'utilisateur';
  status: 'actif' | 'inactif' | 'suspendu';
  date_inscription: string; evenements_inscrits: number;
}

// ── SVG ───────────────────────────────────────────────────────────────────────
const I = ({ d, s = 16 }: { d: string | string[]; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', flexShrink:0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  home:    "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  cal:     "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  ticket:  "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
  users:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  chart:   "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  cog:     ["M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z","M15 12a3 3 0 11-6 0 3 3 0 016 0z"],
  bell:    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  logout:  "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  eye:     ["M15 12a3 3 0 11-6 0 3 3 0 016 0z","M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"],
  edit:    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:   "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  plus:    "M12 4v16m8-8H4",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  dl:      "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  uplus:   "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  arrow:   "M13 7l5 5m0 0l-5 5m5-5H6",
  key:     "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  mail:    "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  shield:  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

// ── Tabs — all orange / amber tones ──────────────────────────────────────────
const TABS = [
  { id:'accueil',      label:'Accueil',      emoji:'🏠', g1:'#f97316', g2:'#ea580c' },
  { id:'evenements',   label:'Événements',   emoji:'🎭', g1:'#ea580c', g2:'#dc2626' },
  { id:'reservations', label:'Réservations', emoji:'🎟️', g1:'#f59e0b', g2:'#f97316' },
  { id:'utilisateurs', label:'Utilisateurs', emoji:'👥', g1:'#fb923c', g2:'#f59e0b' },
  { id:'statistiques', label:'Statistiques', emoji:'📊', g1:'#fbbf24', g2:'#f97316' },
  { id:'parametres',   label:'Paramètres',   emoji:'⚙️', g1:'#92400e', g2:'#78350f' },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Button components ─────────────────────────────────────────────────────────
const Btn = ({ children, g1, g2, sh, onClick, icon, sm=false, fw=false }: {
  children: React.ReactNode; g1: string; g2: string; sh: string;
  onClick?: () => void; icon?: string | string[]; sm?: boolean; fw?: boolean;
}) => (
  <button onClick={onClick} style={{
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    padding: sm ? '9px 16px' : '11px 24px', borderRadius:14, border:'none', cursor:'pointer',
    background:`linear-gradient(135deg,${g1},${g2})`, color:'#fff',
    fontSize: sm ? 13 : 14, fontWeight:700, boxShadow:`0 6px 20px ${sh}`,
    fontFamily:"'DM Sans',sans-serif", transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    width: fw ? '100%' : undefined,
  }}
  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-3px) scale(1.02)'; el.style.boxShadow=`0 14px 32px ${sh}`; }}
  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0) scale(1)'; el.style.boxShadow=`0 6px 20px ${sh}`; }}
  onMouseDown={e  => (e.currentTarget as HTMLElement).style.transform='scale(0.97)'}
  onMouseUp={e    => (e.currentTarget as HTMLElement).style.transform='translateY(-3px) scale(1.02)'}>
    {icon && <I d={icon} s={sm?14:15} />}{children}
  </button>
);

const Ghost = ({ children, color, onClick, icon, sm=false, fw=false }: {
  children: React.ReactNode; color: string; onClick?: () => void;
  icon?: string|string[]; sm?: boolean; fw?: boolean;
}) => (
  <button onClick={onClick} style={{
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
    padding: sm ? '8px 14px' : '10px 22px', borderRadius:14, cursor:'pointer',
    background:`${color}12`, color, fontSize: sm ? 12 : 14, fontWeight:700,
    border:`2px solid ${color}30`, fontFamily:"'DM Sans',sans-serif",
    transition:'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    width: fw ? '100%' : undefined,
  }}
  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}22`; el.style.borderColor=`${color}55`; el.style.transform='translateY(-2px)'; el.style.boxShadow=`0 8px 22px ${color}28`; }}
  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}12`; el.style.borderColor=`${color}30`; el.style.transform='translateY(0)'; el.style.boxShadow='none'; }}>
    {icon && <I d={icon} s={sm?13:14} />}{children}
  </button>
);

const ActBtn = ({ icon, color, title, onClick }: { icon:string|string[]; color:string; title:string; onClick:()=>void }) => (
  <button onClick={onClick} title={title} style={{
    width:36, height:36, borderRadius:11, border:`2px solid ${color}28`,
    background:`${color}12`, color, cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
  }}
  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}28`; el.style.borderColor=`${color}60`; el.style.transform='scale(1.18) rotate(-4deg)'; el.style.boxShadow=`0 4px 14px ${color}40`; }}
  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}12`; el.style.borderColor=`${color}28`; el.style.transform='scale(1) rotate(0)'; el.style.boxShadow='none'; }}>
    <I d={icon} s={14} />
  </button>
);

const QuickBtn = ({ emoji, title, sub, g1, g2, sh, onClick }: { emoji:string; title:string; sub:string; g1:string; g2:string; sh:string; onClick:()=>void }) => (
  <button onClick={onClick} style={{
    display:'flex', flexDirection:'column', alignItems:'flex-start',
    padding:'22px 22px 20px', borderRadius:22, border:`2px solid ${g1}22`,
    background:`linear-gradient(135deg,${g1}0e,${g2}0e)`,
    cursor:'pointer', textAlign:'left', width:'100%',
    fontFamily:"'DM Sans',sans-serif",
    transition:'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
  }}
  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=`linear-gradient(135deg,${g1},${g2})`; el.style.borderColor='transparent'; el.style.transform='translateY(-6px) scale(1.02)'; el.style.boxShadow=`0 20px 48px ${sh}`; el.querySelectorAll<HTMLElement>('.qt,.qs').forEach(x=>x.style.color='#fff'); }}
  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background=`linear-gradient(135deg,${g1}0e,${g2}0e)`; el.style.borderColor=`${g1}22`; el.style.transform='translateY(0) scale(1)'; el.style.boxShadow='none'; el.querySelectorAll<HTMLElement>('.qt').forEach(x=>x.style.color='#1c0a00'); el.querySelectorAll<HTMLElement>('.qs').forEach(x=>x.style.color='#78350f'); }}>
    <span style={{ fontSize:30, marginBottom:12, display:'block' }}>{emoji}</span>
    <span className="qt" style={{ fontSize:14, fontWeight:800, color:'#1c0a00', display:'block', transition:'color 0.25s' }}>{title}</span>
    <span className="qs" style={{ fontSize:12, color:'#78350f', marginTop:3, display:'block', transition:'color 0.25s' }}>{sub}</span>
  </button>
);

const ParamBtn = ({ icon, iconG1, iconG2, iconSh, title, sub, color, onClick }: { icon:string|string[]; iconG1:string; iconG2:string; iconSh:string; title:string; sub:string; color:string; onClick?:()=>void }) => (
  <button onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:18, padding:'18px 24px', borderRadius:20,
    border:`2px solid ${color}22`, background:`${color}08`,
    cursor:'pointer', textAlign:'left', width:'100%',
    fontFamily:"'DM Sans',sans-serif",
    transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
  }}
  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}16`; el.style.borderColor=`${color}45`; el.style.transform='translateX(7px)'; el.style.boxShadow=`0 8px 28px ${color}20`; }}
  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}08`; el.style.borderColor=`${color}22`; el.style.transform='translateX(0)'; el.style.boxShadow='none'; }}>
    <div style={{ width:48, height:48, borderRadius:16, background:`linear-gradient(135deg,${iconG1},${iconG2})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 5px 16px ${iconSh}`, color:'#fff' }}><I d={icon} s={22} /></div>
    <div>
      <div style={{ fontSize:15, fontWeight:800, color:color==='#dc2626'?'#dc2626':'#1c0a00' }}>{title}</div>
      <div style={{ fontSize:12, color:'#92400e', marginTop:3 }}>{sub}</div>
    </div>
  </button>
);

// ── Layout helpers ─────────────────────────────────────────────────────────────
const Card = ({ children }: { children:React.ReactNode }) => (
  <div style={{ background:'#fff', borderRadius:26, border:'2px solid #fde8d8', boxShadow:'0 4px 28px rgba(249,115,22,0.08)', overflow:'hidden' }}>{children}</div>
);
const CardHead = ({ title, sub, right }: { title:string; sub?:string; right?:React.ReactNode }) => (
  <div style={{ padding:'22px 28px', borderBottom:'2px solid #fff8f0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
    <div><h2 style={{ fontSize:18, fontWeight:900, color:'#1c0a00', margin:0 }}>{title}</h2>{sub&&<p style={{ fontSize:13, color:'#92400e', margin:'3px 0 0' }}>{sub}</p>}</div>
    {right&&<div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>{right}</div>}
  </div>
);
const TH = ({ cols }: { cols:string[] }) => (
  <thead><tr style={{ background:'linear-gradient(90deg,#fff8f0,#fef3e6)' }}>
    {cols.map(c=><th key={c} style={{ padding:'13px 20px', textAlign:'left', fontSize:10, fontWeight:900, color:'#c2410c', letterSpacing:1.5, textTransform:'uppercase', whiteSpace:'nowrap' }}>{c}</th>)}
  </tr></thead>
);
const SearchInput = ({ value, onChange, placeholder, accent='#f97316' }: { value:string; onChange:(v:string)=>void; placeholder:string; accent?:string }) => (
  <div style={{ padding:'16px 28px', borderBottom:'1px solid #fef3e6' }}>
    <div style={{ position:'relative', maxWidth:440 }}>
      <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#c2410c', pointerEvents:'none' }}><I d={IC.search} s={15} /></span>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', paddingLeft:42, paddingRight:16, paddingTop:11, paddingBottom:11, borderRadius:14, border:'2px solid #fde8d8', fontSize:14, color:'#1c0a00', background:'#fff8f0', outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box', transition:'all 0.2s' }}
        onFocus={e=>{e.target.style.borderColor=accent;e.target.style.boxShadow=`0 0 0 4px ${accent}18`;}}
        onBlur={e =>{e.target.style.borderColor='#fde8d8';e.target.style.boxShadow='none';}} />
    </div>
  </div>
);
const FootRow = ({ children }:{ children:React.ReactNode }) => (
  <div style={{ padding:'16px 28px', borderTop:'1px solid #fff8f0', display:'flex', gap:12, flexWrap:'wrap' }}>{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated, isLoading } = useAuth();

  const [activeTab,    setActiveTab]    = useState<TabId>('accueil');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [userSearch,   setUserSearch]   = useState('');
  const [roleFilter,   setRoleFilter]   = useState('Tous les rôles');
  const [statusFilter, setStatusFilter] = useState('Tous les statuts');
  const [users,        setUsers]        = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError,   setUsersError]   = useState('');
  const [mounted,      setMounted]      = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [hoverRow,     setHoverRow]     = useState<number|null>(null);

  const stats = { totalEvents:8, upcomingEvents:5, totalReservations:124, availablePlaces:76, revenue:8450, totalUsers:156, activeUsers:142 };

  const [evenements, setEvenements] = useState<Evenement[]>([
    { id_event:1, titre_event:"Festival de Jazz International",  description:"Concert de jazz avec des artistes internationaux renommés du monde entier", date_debut:new Date('2026-06-15T18:00:00').toISOString(), date_fin:new Date('2026-06-17T23:00:00').toISOString(), nb_place:150, image:"", type_event:{nom_type:"Festival"},   tarif:{montant:35} },
    { id_event:2, titre_event:"Exposition d'Art Contemporain",   description:"Collection exceptionnelle d'œuvres d'art contemporain d'artistes émergents",  date_debut:new Date('2026-03-10T10:00:00').toISOString(), date_fin:new Date('2026-05-10T18:00:00').toISOString(), nb_place:100, image:"", type_event:{nom_type:"Exposition"}, tarif:{montant:0}  },
    { id_event:3, titre_event:"Spectacle de Danse Moderne",      description:"Performance captivante mêlant danse contemporaine et nouvelles technologies",  date_debut:new Date('2026-09-22T20:00:00').toISOString(), date_fin:new Date('2026-09-22T22:00:00').toISOString(), nb_place:200, image:"", type_event:{nom_type:"Spectacle"},  tarif:{montant:25} },
  ]);
  const [reservations, setReservations] = useState<Reservation[]>([
    { id:1, nom:"Dupont",  email:"dupont@email.com",  evenement:"Festival de Jazz", date:"2026-06-15", places:2, montant:70,  statut:'confirmé'   },
    { id:2, nom:"Martin",  email:"martin@email.com",  evenement:"Exposition Art",   date:"2026-03-10", places:1, montant:0,   statut:'confirmé'   },
    { id:3, nom:"Bernard", email:"bernard@email.com", evenement:"Spectacle Danse",  date:"2026-09-22", places:4, montant:100, statut:'en attente' },
  ]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true); setUsersError('');
      await new Promise(r=>setTimeout(r,700));
      setUsers([
        { id:1, name:"Marie Dupont",   email:"marie.dupont@email.com",   role:'admin',        status:'actif',    date_inscription:"2024-01-15", evenements_inscrits:8  },
        { id:2, name:"Jean Martin",    email:"jean.martin@email.com",    role:'organisateur', status:'actif',    date_inscription:"2024-02-20", evenements_inscrits:5  },
        { id:3, name:"Sophie Bernard", email:"sophie.bernard@email.com", role:'utilisateur',  status:'actif',    date_inscription:"2024-03-10", evenements_inscrits:12 },
        { id:4, name:"Pierre Leroy",   email:"pierre.leroy@email.com",   role:'utilisateur',  status:'inactif',  date_inscription:"2024-01-30", evenements_inscrits:3  },
        { id:5, name:"Julie Petit",    email:"julie.petit@email.com",    role:'organisateur', status:'actif',    date_inscription:"2024-02-15", evenements_inscrits:7  },
        { id:6, name:"Thomas Moreau",  email:"thomas.moreau@email.com",  role:'utilisateur',  status:'suspendu', date_inscription:"2024-03-05", evenements_inscrits:4  },
      ]);
    } catch(err:unknown) { setUsersError(err instanceof Error?err.message:'Erreur'); setUsers([]); }
    finally { setLoadingUsers(false); }
  };

  useEffect(()=>{ setMounted(true); loadUsers(); },[]);
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>10); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);

  const handleLogout = ()=>{ logout(); navigate('/login'); };
  const delEvent = (id:number)=>{ if(window.confirm('Supprimer ?')) setEvenements(e=>e.filter(x=>x.id_event!==id)); };
  const delRes   = (id:number)=>{ if(window.confirm('Supprimer ?')) setReservations(r=>r.filter(x=>x.id!==id)); };
  const delUser  = (id:number)=>{ if(window.confirm('Supprimer ?')) setUsers(u=>u.filter(x=>x.id!==id)); };
  const updStatus = (id:number,s:User['status'])=>setUsers(u=>u.map(x=>x.id===id?{...x,status:s}:x));
  const updRole   = (id:number,r:User['role'])  =>setUsers(u=>u.map(x=>x.id===id?{...x,role:r}:x));

  const fEvents = evenements.filter(e=>e.titre_event.toLowerCase().includes(searchTerm.toLowerCase())||e.type_event.nom_type.toLowerCase().includes(searchTerm.toLowerCase()));
  const fRes    = reservations.filter(r=>r.nom.toLowerCase().includes(searchTerm.toLowerCase())||r.evenement.toLowerCase().includes(searchTerm.toLowerCase())||r.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const fUsers  = users.filter(u=>{
    const ms=u.name.toLowerCase().includes(userSearch.toLowerCase())||u.email.toLowerCase().includes(userSearch.toLowerCase());
    const mr=roleFilter==='Tous les rôles'||(roleFilter==='Admin'&&u.role==='admin')||(roleFilter==='Organisateur'&&u.role==='organisateur')||(roleFilter==='Utilisateur'&&u.role==='utilisateur');
    const mx=statusFilter==='Tous les statuts'||(statusFilter==='Actif'&&u.status==='actif')||(statusFilter==='Inactif'&&u.status==='inactif')||(statusFilter==='Suspendu'&&u.status==='suspendu');
    return ms&&mr&&mx;
  });

  const tab = TABS.find(t=>t.id===activeTab)!;

  // Event card palettes — all warm orange/amber
  const EP = [
    { g1:'#f97316', g2:'#ea580c', sh:'rgba(249,115,22,0.35)', bg:'rgba(249,115,22,0.07)' },
    { g1:'#f59e0b', g2:'#f97316', sh:'rgba(245,158,11,0.35)', bg:'rgba(245,158,11,0.07)' },
    { g1:'#ea580c', g2:'#dc2626', sh:'rgba(234,88,12,0.35)',  bg:'rgba(234,88,12,0.07)'  },
  ];
  // User avatar gradients — warm palette
  const UG = [
    'linear-gradient(135deg,#f97316,#ea580c)',
    'linear-gradient(135deg,#f59e0b,#f97316)',
    'linear-gradient(135deg,#fb923c,#f59e0b)',
    'linear-gradient(135deg,#ea580c,#dc2626)',
    'linear-gradient(135deg,#fbbf24,#f97316)',
    'linear-gradient(135deg,#f97316,#f59e0b)',
  ];

  // ─── RENDER TABS ────────────────────────────────────────────────────────────
  const renderContent = () => { switch(activeTab) {

  // ════ ACCUEIL ════════════════════════════════════════════════════════════════
  case 'accueil': return (
    <div style={{ display:'flex', flexDirection:'column', gap:26 }}>

      {/* Hero Banner */}
      <div style={{ borderRadius:28, padding:'38px 42px', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#f97316 0%,#ea580c 50%,#f59e0b 100%)', boxShadow:'0 18px 55px rgba(249,115,22,0.45)', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.07) 1.5px,transparent 1.5px)', backgroundSize:'24px 24px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:-80, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:11, fontWeight:900, letterSpacing:3, color:'rgba(255,255,255,0.75)', textTransform:'uppercase', marginBottom:10 }}>✦ Tableau de bord</div>
          <h1 style={{ fontSize:34, fontWeight:900, color:'#fff', margin:'0 0 10px', lineHeight:1.15 }}>Bonjour, {authUser?.username||'Admin'} 👋</h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.88)', margin:'0 0 28px' }}>Gérez vos événements culturels et suivez votre activité en temps réel.</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={()=>navigate('/dashboard/evenements/nouveau')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:14, fontSize:14, fontWeight:800, color:'#f97316', background:'#fff', border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(0,0,0,0.18)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:"'DM Sans',sans-serif" }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-3px) scale(1.03)';el.style.boxShadow='0 16px 40px rgba(0,0,0,0.26)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0) scale(1)';el.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)';}}>
              <I d={IC.plus} s={16} /> ✨ Créer un événement
            </button>
            <button onClick={()=>setActiveTab('evenements')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 22px', borderRadius:14, fontSize:14, fontWeight:700, color:'#fff', background:'rgba(255,255,255,0.20)', border:'2px solid rgba(255,255,255,0.42)', cursor:'pointer', transition:'all 0.22s', fontFamily:"'DM Sans',sans-serif" }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.32)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.20)'}>
              <I d={IC.cal} s={16} /> 🎭 Événements
            </button>
            <button onClick={()=>setActiveTab('statistiques')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 22px', borderRadius:14, fontSize:14, fontWeight:700, color:'#fff', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.30)', cursor:'pointer', transition:'all 0.22s', fontFamily:"'DM Sans',sans-serif" }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.26)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.15)'}>
              <I d={IC.chart} s={16} /> 📊 Statistiques
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:18 }}>
        {[
          { label:'Événements à venir',  value:stats.upcomingEvents,    emoji:'🎭', g1:'#f97316', g2:'#ea580c', sh:'rgba(249,115,22,0.32)' },
          { label:'Réservations totales', value:stats.totalReservations, emoji:'🎟️', g1:'#ea580c', g2:'#dc2626', sh:'rgba(234,88,12,0.32)'  },
          { label:'Utilisateurs actifs',  value:stats.activeUsers,       emoji:'👥', g1:'#f59e0b', g2:'#f97316', sh:'rgba(245,158,11,0.32)'  },
          { label:'Revenus estimés',      value:`${stats.revenue}€`,     emoji:'💰', g1:'#fbbf24', g2:'#f97316', sh:'rgba(251,191,36,0.32)'  },
        ].map((s,i)=>(
          <div key={i} style={{ borderRadius:22, padding:'24px 22px', background:'#fff', border:'2px solid #fde8d8', boxShadow:'0 4px 18px rgba(249,115,22,0.07)', cursor:'default', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:`opacity 0.55s ease ${0.1+i*0.08}s, transform 0.55s ease ${0.1+i*0.08}s, box-shadow 0.25s, border-color 0.25s` }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow=`0 22px 52px ${s.sh}`;el.style.borderColor=`${s.g1}45`;el.style.transform='translateY(-7px)';}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='0 4px 18px rgba(249,115,22,0.07)';el.style.borderColor='#fde8d8';el.style.transform='translateY(0)';}}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${s.g1}22,${s.g2}18)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{s.emoji}</div>
              <span style={{ fontSize:11, fontWeight:800, color:'#10b981', background:'rgba(16,185,129,0.10)', padding:'3px 10px', borderRadius:100 }}>▲ 12%</span>
            </div>
            <div style={{ fontSize:36, fontWeight:900, color:'#1c0a00', lineHeight:1, marginBottom:6 }}>{s.value}</div>
            <div style={{ fontSize:13, color:'#78350f', fontWeight:500 }}>{s.label}</div>
            <div style={{ height:4, borderRadius:100, background:`linear-gradient(90deg,${s.g1},${s.g2})`, marginTop:16, opacity:0.55 }}/>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <Card>
        <CardHead title="🚀 Navigation rapide" sub="Accédez directement à toutes les sections" />
        <div style={{ padding:22, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
          <QuickBtn emoji="✨" title="Créer un événement"  sub="Publier un nouvel event"   g1="#f97316" g2="#ea580c" sh="rgba(249,115,22,0.42)"  onClick={()=>navigate('/dashboard/evenements/nouveau')} />
          <QuickBtn emoji="📅" title="Voir les événements" sub="Gérer la liste complète"   g1="#ea580c" g2="#dc2626" sh="rgba(234,88,12,0.42)"   onClick={()=>setActiveTab('evenements')} />
          <QuickBtn emoji="🎟️" title="Réservations"        sub="Consulter & gérer"         g1="#f59e0b" g2="#f97316" sh="rgba(245,158,11,0.42)"  onClick={()=>setActiveTab('reservations')} />
          <QuickBtn emoji="👥" title="Utilisateurs"         sub="Gérer les comptes"         g1="#fb923c" g2="#f59e0b" sh="rgba(251,146,60,0.42)"  onClick={()=>setActiveTab('utilisateurs')} />
          <QuickBtn emoji="📊" title="Statistiques"         sub="Analyses & rapports"       g1="#fbbf24" g2="#f97316" sh="rgba(251,191,36,0.42)"  onClick={()=>setActiveTab('statistiques')} />
          <QuickBtn emoji="⚙️" title="Paramètres"           sub="Configurer le compte"      g1="#92400e" g2="#78350f" sh="rgba(146,64,14,0.35)"   onClick={()=>setActiveTab('parametres')} />
        </div>
      </Card>

      {/* Recent events */}
      <Card>
        <CardHead title="🎭 Événements récents" sub="Les derniers événements créés"
          right={<Btn g1="#f97316" g2="#ea580c" sh="rgba(249,115,22,0.38)" icon={IC.arrow} sm onClick={()=>setActiveTab('evenements')}>Voir tout</Btn>} />
        <div style={{ padding:'14px 20px', display:'flex', flexDirection:'column', gap:10 }}>
          {evenements.map((ev,idx)=>{
            const c=EP[idx%EP.length]; const ih=hoverRow===ev.id_event;
            return (
              <div key={ev.id_event} onMouseEnter={()=>setHoverRow(ev.id_event)} onMouseLeave={()=>setHoverRow(null)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderRadius:18, border:`2px solid ${ih?c.g1+'45':'#fde8d8'}`, background:ih?c.bg:'transparent', transform:ih?'translateX(5px)':'translateX(0)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:50, height:50, borderRadius:16, background:`linear-gradient(135deg,${c.g1},${c.g2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0, boxShadow:`0 6px 18px ${c.sh}` }}>🎭</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#1c0a00' }}>{ev.titre_event}</div>
                    <div style={{ display:'flex', gap:10, marginTop:5, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:800, color:c.g1, background:`${c.g1}18`, padding:'2px 10px', borderRadius:100 }}>{ev.type_event.nom_type}</span>
                      <span style={{ fontSize:12, color:'#92400e' }}>📅 {new Date(ev.date_debut).toLocaleDateString('fr-FR')}</span>
                      {ev.tarif.montant>0&&<span style={{ fontSize:12, color:'#92400e' }}>💰 {ev.tarif.montant}€</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Ghost color="#78350f" sm icon={IC.edit} onClick={()=>navigate(`/dashboard/evenements/modifier/${ev.id_event}`)}>Modifier</Ghost>
                  <Btn g1={c.g1} g2={c.g2} sh={c.sh} sm icon={IC.eye} onClick={()=>navigate(`/events/${ev.id_event}`)}>Voir</Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  // ════ ÉVÉNEMENTS ═════════════════════════════════════════════════════════════
  case 'evenements': return (
    <Card>
      <CardHead title="🎭 Gestion des Événements" sub="Créez, modifiez ou supprimez vos événements"
        right={<Btn g1="#f97316" g2="#ea580c" sh="rgba(249,115,22,0.42)" icon={IC.plus} onClick={()=>navigate('/dashboard/evenements/nouveau')}>Nouvel Événement</Btn>} />
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un événement…" accent="#f97316" />
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <TH cols={['Événement','Date','Type','Places','Prix','Actions']} />
          <tbody>
            {fEvents.map((ev,idx)=>{ const c=EP[idx%EP.length]; return (
              <tr key={ev.id_event} style={{ borderTop:'1px solid #fff8f0', transition:'background 0.15s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fff8f0'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                <td style={{ padding:'16px 20px' }}><div style={{ display:'flex', alignItems:'center', gap:14 }}><div style={{ width:46, height:46, borderRadius:15, background:`linear-gradient(135deg,${c.g1},${c.g2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, boxShadow:`0 4px 12px ${c.sh}` }}>🎭</div><div><div style={{ fontSize:14, fontWeight:700, color:'#1c0a00' }}>{ev.titre_event}</div><div style={{ fontSize:12, color:'#92400e', marginTop:2 }}>{ev.description.substring(0,46)}…</div></div></div></td>
                <td style={{ padding:'16px 20px', fontSize:13, color:'#78350f', whiteSpace:'nowrap' }}>{new Date(ev.date_debut).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding:'16px 20px' }}><span style={{ padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700, background:`${c.g1}18`, color:c.g1 }}>{ev.type_event.nom_type}</span></td>
                <td style={{ padding:'16px 20px', fontSize:13, fontWeight:600, color:'#78350f' }}>{ev.nb_place} 🪑</td>
                <td style={{ padding:'16px 20px' }}><span style={{ fontSize:14, fontWeight:800, color:ev.tarif.montant===0?'#10b981':'#1c0a00' }}>{ev.tarif.montant===0?'🆓 Gratuit':`${ev.tarif.montant}€`}</span></td>
                <td style={{ padding:'16px 20px' }}><div style={{ display:'flex', gap:6 }}><ActBtn icon={IC.eye} color="#f97316" title="Voir" onClick={()=>navigate(`/events/${ev.id_event}`)} /><ActBtn icon={IC.edit} color="#f59e0b" title="Modifier" onClick={()=>navigate(`/dashboard/evenements/modifier/${ev.id_event}`)} /><ActBtn icon={IC.trash} color="#dc2626" title="Supprimer" onClick={()=>delEvent(ev.id_event)} /></div></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <FootRow>
        <Ghost color="#f97316" icon={IC.plus}  onClick={()=>navigate('/dashboard/evenements/nouveau')}>Créer un événement</Ghost>
        <Ghost color="#ea580c" icon={IC.eye}   onClick={()=>navigate('/events')}>Voir publiquement</Ghost>
        <Ghost color="#f59e0b" icon={IC.dl}    onClick={()=>{}}>Exporter la liste</Ghost>
      </FootRow>
    </Card>
  );

  // ════ RÉSERVATIONS ═══════════════════════════════════════════════════════════
  case 'reservations': return (
    <Card>
      <CardHead title="🎟️ Gestion des Réservations" sub="Consultez et gérez toutes les réservations"
        right={<><Ghost color="#f59e0b" icon={IC.dl} onClick={()=>{}}>Exporter CSV</Ghost><Btn g1="#f97316" g2="#f59e0b" sh="rgba(249,115,22,0.38)" icon={IC.search}>Filtrer</Btn></>} />
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher une réservation…" accent="#f59e0b" />
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <TH cols={['Client','Événement','Date','Places','Montant','Statut','Actions']} />
          <tbody>
            {fRes.map(res=>{
              const S: Record<string,{bg:string;color:string;emoji:string}> = { 'confirmé':{bg:'rgba(16,185,129,0.12)',color:'#059669',emoji:'✅'},'en attente':{bg:'rgba(245,158,11,0.12)',color:'#d97706',emoji:'⏳'},'annulé':{bg:'rgba(239,68,68,0.12)',color:'#dc2626',emoji:'❌'} };
              const s=S[res.statut];
              return (
                <tr key={res.id} style={{ borderTop:'1px solid #fff8f0', transition:'background 0.15s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fff8f0'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'16px 20px' }}><div style={{ display:'flex', alignItems:'center', gap:12 }}><div style={{ width:40, height:40, borderRadius:13, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:16, flexShrink:0, boxShadow:'0 4px 12px rgba(249,115,22,0.4)' }}>{res.nom.charAt(0)}</div><div><div style={{ fontSize:14, fontWeight:700, color:'#1c0a00' }}>{res.nom}</div><div style={{ fontSize:12, color:'#92400e' }}>{res.email}</div></div></div></td>
                  <td style={{ padding:'16px 20px', fontSize:13, color:'#78350f' }}>{res.evenement}</td>
                  <td style={{ padding:'16px 20px', fontSize:13, color:'#78350f', whiteSpace:'nowrap' }}>{res.date}</td>
                  <td style={{ padding:'16px 20px', fontSize:13, fontWeight:700, color:'#1c0a00' }}>{res.places} 🪑</td>
                  <td style={{ padding:'16px 20px', fontSize:14, fontWeight:800, color:'#1c0a00' }}>{res.montant}€</td>
                  <td style={{ padding:'16px 20px' }}><span style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:700, background:s.bg, color:s.color }}>{s.emoji} {res.statut}</span></td>
                  <td style={{ padding:'16px 20px' }}><div style={{ display:'flex', gap:6 }}><ActBtn icon={IC.eye} color="#f97316" title="Voir" onClick={()=>navigate(`/dashboard/reservations/${res.id}`)} /><ActBtn icon={IC.trash} color="#dc2626" title="Supprimer" onClick={()=>delRes(res.id)} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <FootRow>
        <Ghost color="#f59e0b" icon={IC.dl}    onClick={()=>{}}>Exporter en CSV</Ghost>
        <Ghost color="#f97316" icon={IC.chart} onClick={()=>setActiveTab('statistiques')}>Voir statistiques</Ghost>
      </FootRow>
    </Card>
  );

  // ════ UTILISATEURS ═══════════════════════════════════════════════════════════
  case 'utilisateurs': return (
    <Card>
      <CardHead title="👥 Gestion des Utilisateurs" sub="Gérez les comptes et permissions"
        right={<><Ghost color="#f59e0b" icon={IC.refresh} onClick={loadUsers}>{loadingUsers?'Chargement…':'Actualiser'}</Ghost><Btn g1="#f97316" g2="#ea580c" sh="rgba(249,115,22,0.42)" icon={IC.uplus} onClick={()=>navigate('/dashboard/utilisateurs/nouveau')}>Nouvel utilisateur</Btn></>} />
      {usersError&&<div style={{ margin:'12px 28px', padding:'10px 16px', borderRadius:14, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#dc2626', fontSize:13 }}>{usersError}</div>}
      <div style={{ padding:'16px 28px', borderBottom:'1px solid #fef3e6', display:'flex', gap:12, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#c2410c', pointerEvents:'none' }}><I d={IC.search} s={15} /></span>
          <input type="text" value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Rechercher un utilisateur…" style={{ width:'100%', paddingLeft:42, paddingRight:16, paddingTop:11, paddingBottom:11, borderRadius:14, border:'2px solid #fde8d8', fontSize:14, color:'#1c0a00', background:'#fff8f0', outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box', transition:'all 0.2s' }} onFocus={e=>{e.target.style.borderColor='#f97316';e.target.style.boxShadow='0 0 0 4px rgba(249,115,22,0.15)';}} onBlur={e=>{e.target.style.borderColor='#fde8d8';e.target.style.boxShadow='none';}} />
        </div>
        {[{val:roleFilter,set:setRoleFilter,opts:['Tous les rôles','Admin','Organisateur','Utilisateur']},{val:statusFilter,set:setStatusFilter,opts:['Tous les statuts','Actif','Inactif','Suspendu']}].map((sel,si)=>(
          <select key={si} value={sel.val} onChange={e=>sel.set(e.target.value)} style={{ padding:'11px 16px', borderRadius:14, border:'2px solid #fde8d8', fontSize:13, fontWeight:600, color:'#78350f', background:'#fff8f0', outline:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            {sel.opts.map(o=><option key={o}>{o}</option>)}
          </select>
        ))}
      </div>
      {loadingUsers?(
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:56, gap:16 }}>
          <div style={{ width:44, height:44, border:'4px solid rgba(249,115,22,0.15)', borderTop:'4px solid #f97316', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          <p style={{ color:'#c2410c', fontSize:14 }}>Chargement des utilisateurs…</p>
        </div>
      ):fUsers.length===0?(
        <div style={{ padding:48, textAlign:'center', color:'#c2410c' }}>Aucun utilisateur trouvé.</div>
      ):(
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TH cols={['#','Utilisateur','Email','Rôle','Statut','Inscription','Événements','Actions']} />
            <tbody>
              {fUsers.map(u=>{
                const RS: Record<string,{bg:string;color:string}> = { admin:{bg:'rgba(249,115,22,0.12)',color:'#ea580c'}, organisateur:{bg:'rgba(245,158,11,0.12)',color:'#d97706'}, utilisateur:{bg:'rgba(234,88,12,0.10)',color:'#c2410c'} };
                const XS: Record<string,{bg:string;color:string}> = { actif:{bg:'rgba(16,185,129,0.12)',color:'#059669'}, inactif:{bg:'rgba(100,116,139,0.12)',color:'#475569'}, suspendu:{bg:'rgba(239,68,68,0.12)',color:'#dc2626'} };
                return (
                  <tr key={u.id} style={{ borderTop:'1px solid #fff8f0', transition:'background 0.15s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fff8f0'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td style={{ padding:'14px 18px', fontSize:12, color:'#c2410c', fontWeight:700 }}>{u.id}</td>
                    <td style={{ padding:'14px 18px' }}><div style={{ display:'flex', alignItems:'center', gap:12 }}><div style={{ width:40, height:40, borderRadius:13, background:UG[(u.id-1)%UG.length], display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:16, flexShrink:0 }}>{u.name.charAt(0)}</div><span style={{ fontSize:14, fontWeight:700, color:'#1c0a00' }}>{u.name}</span></div></td>
                    <td style={{ padding:'14px 18px', fontSize:13, color:'#78350f' }}>{u.email}</td>
                    <td style={{ padding:'14px 18px' }}><select value={u.role} onChange={e=>updRole(u.id,e.target.value as User['role'])} style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:700, color:RS[u.role].color, background:RS[u.role].bg, border:'none', cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif" }}><option value="admin">👑 Admin</option><option value="organisateur">🎯 Organisateur</option><option value="utilisateur">👤 Utilisateur</option></select></td>
                    <td style={{ padding:'14px 18px' }}><select value={u.status} onChange={e=>updStatus(u.id,e.target.value as User['status'])} style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:700, color:XS[u.status].color, background:XS[u.status].bg, border:'none', cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif" }}><option value="actif">🟢 Actif</option><option value="inactif">⚫ Inactif</option><option value="suspendu">🔴 Suspendu</option></select></td>
                    <td style={{ padding:'14px 18px', fontSize:12, color:'#92400e' }}>{u.date_inscription}</td>
                    <td style={{ padding:'14px 18px' }}><span style={{ fontSize:13, fontWeight:800, color:'#f97316', background:'rgba(249,115,22,0.10)', padding:'4px 12px', borderRadius:100 }}>{u.evenements_inscrits}</span></td>
                    <td style={{ padding:'14px 18px' }}><div style={{ display:'flex', gap:6 }}><ActBtn icon={IC.eye} color="#f97316" title="Voir" onClick={()=>navigate(`/dashboard/utilisateurs/${u.id}`)} /><ActBtn icon={IC.edit} color="#f59e0b" title="Modifier" onClick={()=>navigate(`/dashboard/utilisateurs/modifier/${u.id}`)} /><ActBtn icon={IC.trash} color="#dc2626" title="Supprimer" onClick={()=>delUser(u.id)} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <FootRow>
        <Ghost color="#f97316" icon={IC.uplus} onClick={()=>navigate('/dashboard/utilisateurs/nouveau')}>Ajouter un utilisateur</Ghost>
        <Ghost color="#f59e0b" icon={IC.dl}    onClick={()=>{}}>Exporter les données</Ghost>
      </FootRow>
    </Card>
  );

  // ════ STATISTIQUES ═══════════════════════════════════════════════════════════
  case 'statistiques': return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:22 }}>
        {[{title:'Tendance des réservations',emoji:'📈',g1:'#f97316',g2:'#ea580c'},{title:"Répartition par type",emoji:'🥧',g1:'#f59e0b',g2:'#f97316'}].map((ch,i)=>(
          <Card key={i}>
            <CardHead title={ch.title} right={<Ghost color={ch.g1} sm icon={IC.dl}>Exporter</Ghost>} />
            <div style={{ padding:24 }}><div style={{ height:200, borderRadius:18, background:`linear-gradient(135deg,${ch.g1}08,${ch.g2}06)`, border:`2px dashed ${ch.g1}35`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}><span style={{ fontSize:52 }}>{ch.emoji}</span><p style={{ fontSize:13, color:'#c2410c', fontWeight:600 }}>Graphique disponible prochainement</p></div></div>
          </Card>
        ))}
      </div>
      <div style={{ borderRadius:26, padding:'34px', overflow:'hidden', position:'relative', background:'linear-gradient(135deg,#f97316,#ea580c,#f59e0b)', boxShadow:'0 14px 44px rgba(249,115,22,0.42)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize:'22px 22px', pointerEvents:'none' }}/>
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:32 }}>
          {[{n:stats.totalEvents,l:'Événements',e:'🎭'},{n:stats.totalReservations,l:'Réservations',e:'🎟️'},{n:stats.availablePlaces,l:'Places dispo',e:'🪑'},{n:`${stats.revenue}€`,l:'Revenus',e:'💰'}].map((s,i)=>(
            <div key={i} style={{ textAlign:'center' }}><div style={{ fontSize:30 }}>{s.e}</div><div style={{ fontSize:36, fontWeight:900, color:'#fff', marginTop:4, lineHeight:1 }}>{s.n}</div><div style={{ fontSize:12, color:'rgba(255,255,255,0.78)', marginTop:5 }}>{s.l}</div></div>
          ))}
        </div>
      </div>
      <Card>
        <CardHead title="📋 Actions & Exports" sub="Téléchargez et analysez vos données" />
        <div style={{ padding:24, display:'flex', gap:14, flexWrap:'wrap' }}>
          <Btn g1="#f97316" g2="#ea580c" sh="rgba(249,115,22,0.40)" icon={IC.chart}>Rapport complet</Btn>
          <Btn g1="#f59e0b" g2="#f97316" sh="rgba(245,158,11,0.40)" icon={IC.dl}>Exporter PDF</Btn>
          <Ghost color="#f97316" icon={IC.dl}>Exporter CSV</Ghost>
          <Ghost color="#f59e0b" icon={IC.refresh} onClick={loadUsers}>Actualiser les données</Ghost>
        </div>
      </Card>
    </div>
  );

  // ════ PARAMÈTRES ═════════════════════════════════════════════════════════════
  case 'parametres': return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <Card>
        <CardHead title="⚙️ Paramètres du compte" sub="Gérez votre profil et vos préférences" />
        <div style={{ padding:'26px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:22, marginBottom:28, padding:'22px 26px', borderRadius:22, background:'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(234,88,12,0.05))' }}>
            <div style={{ width:76, height:76, borderRadius:24, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:32, flexShrink:0, boxShadow:'0 10px 30px rgba(249,115,22,0.50)' }}>{(authUser?.username||'A').charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:900, color:'#1c0a00' }}>{authUser?.username||'Administrateur'}</div>
              <div style={{ fontSize:13, color:'#92400e', marginTop:3 }}>{authUser?.roles?.join(', ')||'UTILISATEUR'}</div>
              <span style={{ marginTop:10, display:'inline-flex', padding:'5px 14px', borderRadius:100, fontSize:12, fontWeight:800, background:'rgba(16,185,129,0.12)', color:'#059669' }}>● Compte actif</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:28 }}>
            {[{label:"Nom d'utilisateur",val:authUser?.username||''},{label:'Rôles',val:authUser?.roles?.join(', ')||'UTILISATEUR'}].map(f=>(
              <div key={f.label}>
                <label style={{ fontSize:10, fontWeight:900, color:'#c2410c', letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:8 }}>{f.label}</label>
                <input type="text" value={f.val} readOnly style={{ width:'100%', padding:'12px 16px', borderRadius:14, border:'2px solid #fde8d8', fontSize:14, color:'#78350f', background:'#fff8f0', outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <ParamBtn icon={IC.key}    iconG1="#f97316" iconG2="#ea580c" iconSh="rgba(249,115,22,0.42)" title="🔒 Modifier mon mot de passe"  sub="Changer votre mot de passe actuel"          color="#f97316" />
            <ParamBtn icon={IC.mail}   iconG1="#f59e0b" iconG2="#f97316" iconSh="rgba(245,158,11,0.42)" title="🔔 Notifications par email"     sub="Gérer vos préférences de notifications"     color="#f59e0b" />
            <ParamBtn icon={IC.chart}  iconG1="#fb923c" iconG2="#f59e0b" iconSh="rgba(251,146,60,0.42)" title="📊 Voir les statistiques"       sub="Analyses et rapports d'activité"            color="#fb923c" onClick={()=>setActiveTab('statistiques')} />
            <ParamBtn icon={IC.shield} iconG1="#ea580c" iconG2="#f97316" iconSh="rgba(234,88,12,0.42)"  title="🛡️ Sécurité du compte"          sub="Authentification & sécurité avancée"        color="#ea580c" />
            <ParamBtn icon={IC.logout} iconG1="#dc2626" iconG2="#b91c1c" iconSh="rgba(220,38,38,0.42)"  title="🚪 Se déconnecter"              sub="Quitter votre session en cours"             color="#dc2626" onClick={handleLogout} />
          </div>
        </div>
      </Card>
    </div>
  );

  default: return null;
  }};

  // ─── Loading / guard ─────────────────────────────────────────────────────────
  if(isLoading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff8f0' }}><div style={{ width:52, height:52, border:'5px solid rgba(249,115,22,0.15)', borderTop:'5px solid #f97316', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/></div>;
  if(!isAuthenticated) return null;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#fff8f0', fontFamily:"'DM Sans',sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:scrolled?'rgba(255,255,255,0.97)':'rgba(255,255,255,0.90)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${scrolled?'rgba(249,115,22,0.20)':'rgba(249,115,22,0.10)'}`, boxShadow:scrolled?'0 4px 32px rgba(249,115,22,0.12)':'none', transition:'all 0.3s ease' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:72 }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:15, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, color:'#fff', boxShadow:'0 6px 22px rgba(249,115,22,0.48)', flexShrink:0 }}>CE</div>
              <div>
                <div style={{ fontWeight:900, fontSize:19, background:'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1.2 }}>CultureEvents</div>
                <div style={{ fontSize:11, color:'#c2410c', fontWeight:600 }}>Tableau de bord</div>
              </div>
            </div>
            {/* Right */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button style={{ width:42, height:42, borderRadius:13, background:'rgba(249,115,22,0.09)', border:'2px solid rgba(249,115,22,0.18)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f97316', cursor:'pointer', position:'relative', transition:'all 0.2s' }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(249,115,22,0.18)';el.style.transform='translateY(-2px)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(249,115,22,0.09)';el.style.transform='translateY(0)';}}>
                <I d={IC.bell} s={18} /><span style={{ position:'absolute', top:9, right:9, width:8, height:8, background:'linear-gradient(135deg,#f97316,#ea580c)', borderRadius:'50%', border:'2px solid #fff' }}/>
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 16px 6px 6px', borderRadius:15, background:'rgba(249,115,22,0.07)', border:'2px solid rgba(249,115,22,0.14)' }}>
                <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:16, boxShadow:'0 3px 10px rgba(249,115,22,0.4)' }}>{(authUser?.username||'A').charAt(0).toUpperCase()}</div>
                <div><div style={{ fontSize:13, fontWeight:700, color:'#1c0a00', lineHeight:1.2 }}>{authUser?.username||'Admin'}</div><div style={{ fontSize:11, color:'#c2410c' }}>{authUser?.roles?.[0]||'UTILISATEUR'}</div></div>
              </div>
              <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:14, fontSize:13, fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(220,38,38,0.38)', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-2px)';el.style.boxShadow='0 10px 26px rgba(220,38,38,0.52)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0)';el.style.boxShadow='0 4px 14px rgba(220,38,38,0.38)';}}>
                <I d={IC.logout} s={15} /> Déconnexion
              </button>
            </div>
          </div>
          {/* Tab bar */}
          <div style={{ display:'flex', gap:4, paddingBottom:14, overflowX:'auto', scrollbarWidth:'none' }}>
            {TABS.map(t=>{ const active=activeTab===t.id; return (
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:14, fontSize:14, fontWeight:700, border:'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif", transition:'all 0.28s cubic-bezier(0.34,1.56,0.64,1)', background:active?`linear-gradient(135deg,${t.g1},${t.g2})`:'transparent', color:active?'#fff':'#78350f', boxShadow:active?`0 6px 20px ${t.g1}55`:'none', transform:active?'translateY(-2px)':'translateY(0)' }}
                onMouseEnter={e=>{ if(!active){const el=e.currentTarget as HTMLElement;el.style.background=`${t.g1}14`;el.style.color=t.g1;} }}
                onMouseLeave={e=>{ if(!active){const el=e.currentTarget as HTMLElement;el.style.background='transparent';el.style.color='#78350f';} }}>
                <span style={{ fontSize:17 }}>{t.emoji}</span>{t.label}
              </button>
            );})}
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'16px 28px 0', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={()=>navigate('/')} style={{ fontSize:13, fontWeight:600, color:'#c2410c', background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:"'DM Sans',sans-serif", transition:'color 0.15s' }} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#f97316'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#c2410c'}>🏠 Accueil</button>
        <span style={{ color:'#fdba74' }}>›</span>
        <span style={{ fontSize:13, fontWeight:700, color:tab.g1 }}>{tab.emoji} {tab.label}</span>
      </div>

      <main style={{ maxWidth:1400, margin:'0 auto', padding:'22px 28px 56px' }}>
        {renderContent()}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to{transform:rotate(360deg);} }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(249,115,22,0.30); border-radius:100px; }
        select option { font-family:'DM Sans',sans-serif; }
      `}</style>
    </div>
  );
};

export default DashboardPage;