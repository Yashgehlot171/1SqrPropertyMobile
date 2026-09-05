import React, { useState } from "react";
import {
  Search, MapPin, Bell, Heart, Share2, Phone, MessageCircle,
  SlidersHorizontal, ChevronLeft, ChevronRight, Home as HomeIcon,
  Building2, User, Wallet, FileText, Star, BedDouble, Bath, Maximize,
  Compass, Check, ArrowRight, Camera, ShieldCheck, Sparkles, X,
  ChevronDown, Plus, LayoutGrid, Briefcase, Landmark, TreePine,
  Store, Factory, BadgeCheck, Settings, HelpCircle, LogOut,
  ChevronRight as CR, Image as ImageIcon, Eye, MessageSquare,
  Edit3, Trash2, TrendingUp, Users, ClipboardList
} from "lucide-react";

const T = {
  primary: "#1A0533",
  secondary: "#6C3BFF",
  accent: "#FFB800",
  success: "#22C55E",
  error: "#EF4444",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  textMuted: "#6B7280",
  border: "#E5E7EB",
};

const SCREENS = [
  "Splash",
  "Login",
  "OTP",
  "Role Select",
  "Complete Profile",
  "Home",
  "Search & Filters",
  "Property Listing",
  "Property Details",
  "Property Gallery",
  "Add Property 1",
  "Add Property 2",
  "Add Property 3",
  "Add Property 4",
  "Add Property 5",
  "My Properties",
  "Lead Details",
  "Portfolio",
  "Services",
  "Construction Services",
  "Construction Plan Details",
  "Construction Comparison",
  "Material Directory",
  "Provider Directory",
  "Cost Calculator",
  "Quotation Result",
  "Loan Calculator",
  "EMI Result",
  "Legal Services",
  "Legal Request",
  "Registration Request",
  "Notifications",
  "Profile",
  "Saved Properties",
  "My Enquiries",
  "Loan & Construction",
  "Legal Requests",
  "Settings",
  "Help & Support",
];

function PhoneShell({ children }) {
  return (
    <div
      style={{
        width: 375,
        height: 812,
        background: T.bg,
        borderRadius: 40,
        border: "10px solid #111",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        fontFamily:
          "'Poppins','Inter',ui-sans-serif,system-ui,-apple-system,sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 140,
          height: 26,
          background: "#111",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          zIndex: 50,
        }}
      />
      {children}
    </div>
  );
}

// Every screen is: fixed status bar -> fixed header (optional) -> scrollable
// body -> fixed bottom (nav or action bar, optional). This keeps the bottom
// tab bar / action bar pinned while only the middle content scrolls.
function ScreenFrame({ header, children, bottom, bg }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: bg || T.bg,
      }}
    >
      {header}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</div>
      {bottom}
    </div>
  );
}

function StatusBar({ dark }) {
  const c = dark ? "#fff" : T.primary;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 22px 6px",
        fontSize: 13,
        fontWeight: 600,
        color: c,
        flexShrink: 0,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 11 }}>●●●●</span>
        <span style={{ fontSize: 11 }}>Wi-Fi</span>
        <span style={{ fontSize: 11 }}>100%</span>
      </div>
    </div>
  );
}

const NAV_TARGETS = {
  home: "Home",
  saved: "Saved Properties",
  add: "Add Property 1",
  portfolio: "Portfolio",
  services: "Services",
  profile: "Profile",
};

function BottomNav({ active = "home", onNavigate }) {
  const items = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "saved", label: "Saved", icon: Heart },
    { key: "add", label: "Add", icon: Plus },
    { key: "portfolio", label: "Portfolio", icon: Briefcase },
    { key: "services", label: "Services", icon: Wallet },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div
      style={{
        flexShrink: 0,
        background: "#fff",
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 4px 22px",
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = it.key === active;
        const isAdd = it.key === "add";
        return (
          <div
            key={it.key}
            onClick={() => onNavigate && onNavigate(NAV_TARGETS[it.key])}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: isAdd ? 40 : 24,
                height: isAdd ? 40 : 24,
                borderRadius: isAdd ? 20 : 0,
                background: isAdd ? T.accent : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: isAdd ? -18 : 0,
              }}
            >
              <Icon
                size={isAdd ? 20 : 20}
                color={isAdd ? T.primary : isActive ? T.secondary : "#9CA3AF"}
                strokeWidth={isActive ? 2.4 : 2}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? T.secondary : "#9CA3AF",
              }}
            >
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        border: `1px solid ${active ? T.secondary : T.border}`,
        background: active ? T.secondary : "#fff",
        color: active ? "#fff" : "#374151",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }) {
  const map = {
    Active: { bg: "#DCFCE7", fg: "#15803D" },
    "Under Review": { bg: "#FEF3C7", fg: "#92400E" },
    Sold: { bg: "#E5E7EB", fg: "#374151" },
    Rejected: { bg: "#FEE2E2", fg: "#B91C1C" },
    "In Progress": { bg: "#DBEAFE", fg: "#1D4ED8" },
    New: { bg: "#F3F0FF", fg: T.secondary },
    Closed: { bg: "#E5E7EB", fg: "#374151" },
  };
  const c = map[status] || map["Active"];
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        fontSize: 10,
        fontWeight: 700,
        padding: "4px 9px",
        borderRadius: 8,
      }}
    >
      {status}
    </span>
  );
}

function PropertyCard({ img, title, price, loc, beds, baths, area, tag, wide }) {
  return (
    <div
      style={{
        width: wide ? "100%" : 210,
        flexShrink: 0,
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 120,
          background: img,
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: 8,
        }}
      >
        {tag && (
          <span
            style={{
              background: T.accent,
              color: T.primary,
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {tag}
          </span>
        )}
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "auto",
          }}
        >
          <Heart size={13} color={T.error} />
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.primary }}>
          {price}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111827",
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            color: T.textMuted,
            fontSize: 11,
          }}
        >
          <MapPin size={11} />
          <span>{loc}</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${T.border}`,
            fontSize: 11,
            color: "#374151",
          }}
        >
          {beds && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <BedDouble size={12} /> {beds}
            </span>
          )}
          {baths && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Bath size={12} /> {baths}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Maximize size={12} /> {area}
          </span>
        </div>
      </div>
    </div>
  );
}

const gradients = [
  "linear-gradient(135deg,#C4B5FD,#818CF8)",
  "linear-gradient(135deg,#FDE68A,#FCA5A5)",
  "linear-gradient(135deg,#A7F3D0,#6EE7B7)",
  "linear-gradient(135deg,#BFDBFE,#93C5FD)",
  "linear-gradient(135deg,#FBCFE8,#F9A8D4)",
];

const sampleProperties = [
  { img: gradients[0], title: "Green Valley 3BHK Flat", price: "₹78,00,000", loc: "Sector 57, Gurugram", beds: "3", baths: "2", area: "1450 sqft", tag: "Verified" },
  { img: gradients[1], title: "Independent House, Corner Plot", price: "₹1.35 Cr", loc: "DLF Phase 3, Gurugram", beds: "4", baths: "3", area: "2200 sqft", tag: "New" },
  { img: gradients[2], title: "Residential Plot 200 sq.yd", price: "₹52,00,000", loc: "Sohna Road, Gurugram", area: "1800 sqft" },
  { img: gradients[3], title: "Commercial Shop, Main Market", price: "₹95,00,000", loc: "MG Road, Gurugram", area: "620 sqft", tag: "Owner" },
];

const myProperties = [
  { title: "Green Valley 3BHK Flat", price: "₹78,00,000", loc: "Sector 57, Gurugram", status: "Active", views: 214, inquiries: 12, img: gradients[0] },
  { title: "Independent House, Corner Plot", price: "₹1.35 Cr", loc: "DLF Phase 3, Gurugram", status: "Under Review", views: 0, inquiries: 0, img: gradients[1] },
  { title: "2BHK Builder Floor", price: "₹58,00,000", loc: "Sushant Lok, Gurugram", status: "Sold", views: 340, inquiries: 28, img: gradients[3] },
];

function Section({ title, action, onAction, children }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 18px",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: T.primary }}>
          {title}
        </span>
        {action && (
          <span
            onClick={onAction}
            style={{ fontSize: 12, fontWeight: 600, color: T.secondary, cursor: onAction ? "pointer" : "default" }}
          >
            {action}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function BackHeader({ title, right, onBack }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 18px 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ChevronLeft
            size={20}
            color={T.primary}
            onClick={onBack}
            style={{ cursor: onBack ? "pointer" : "default" }}
          />
          {title && (
            <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>
              {title}
            </span>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}

function ListRow({ icon, label, sub, right }) {
  const Icon = icon;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 4px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {Icon && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "#F3F0FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={T.secondary} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? T.secondary : "#D1D5DB",
        display: "flex",
        alignItems: "center",
        padding: 2,
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
    </div>
  );
}

// ---------------- SCREENS ----------------

function SplashScreen() {
  return (
    <div
      style={{
        height: "100%",
        background: T.primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 22,
          background: T.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Building2 size={38} color={T.primary} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0.5 }}>
        UrbanKart
      </div>
      <div style={{ fontSize: 13, color: "#C4B5FD", textAlign: "center", padding: "0 60px" }}>
        Property. Construction. Finance. Legal — all in one place.
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 30 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              background: i === 0 ? T.accent : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <ScreenFrame bg="#fff">
      <div>
        <StatusBar />
        <div
          style={{
            height: 200,
            background: `linear-gradient(160deg, ${T.primary}, ${T.secondary})`,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HomeIcon size={30} color={T.accent} />
          </div>
        </div>
        <div style={{ padding: "28px 24px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>
            Welcome to UrbanKart
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>
            Enter your mobile number to continue
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 26,
              border: `1.5px solid ${T.border}`,
              borderRadius: 14,
              padding: "13px 14px",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>+91</span>
            <div style={{ width: 1, height: 18, background: T.border }} />
            <span style={{ fontSize: 14, color: "#9CA3AF" }}>98XXXXXX10</span>
          </div>

          <button
            style={{
              width: "100%",
              marginTop: 24,
              padding: "15px 0",
              borderRadius: 14,
              background: T.secondary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Send OTP <ArrowRight size={16} />
          </button>

          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 18, textAlign: "center", lineHeight: 1.6 }}>
            By continuing, you agree to UrbanKart's{" "}
            <span style={{ color: T.secondary, fontWeight: 600 }}>Terms</span> and{" "}
            <span style={{ color: T.secondary, fontWeight: 600 }}>Privacy Policy</span>.
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function OtpScreen() {
  const [otp] = useState(["4", "8", "2", "", "", ""]);
  return (
    <ScreenFrame bg="#fff" header={<BackHeader />}>
      <div style={{ padding: "10px 24px" }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: T.primary }}>Verify OTP</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>
          Enter the 6-digit code sent to <b style={{ color: "#111827" }}>+91 98XXXXXX10</b>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
          {otp.map((d, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 52,
                borderRadius: 12,
                border: `1.5px solid ${d ? T.secondary : T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: T.primary,
                background: d ? "#F3F0FF" : "#fff",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: T.textMuted }}>
          Resend OTP in <span style={{ color: T.error, fontWeight: 700 }}>00:28</span>
        </div>

        <button
          style={{
            width: "100%",
            marginTop: 30,
            padding: "15px 0",
            borderRadius: 14,
            background: T.secondary,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
          }}
        >
          Verify & Continue
        </button>
      </div>
    </ScreenFrame>
  );
}

function RoleScreen({ onNavigate }) {
  const [sel, setSel] = useState("Buyer");
  const roles = [
    { key: "Buyer", icon: Search, desc: "Discover, save and enquire about properties." },
    { key: "Seller", icon: HomeIcon, desc: "List and manage your own properties for sale." },
    { key: "Broker", icon: Briefcase, desc: "Manage listings, leads and client portfolios." },
  ];
  return (
    <ScreenFrame bg="#fff" header={<BackHeader />}>
      <div style={{ padding: "10px 24px" }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: T.primary }}>
          Choose your role
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>
          This helps us personalize your UrbanKart experience.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
          {roles.map((r) => {
            const Icon = r.icon;
            const active = sel === r.key;
            return (
              <div
                key={r.key}
                onClick={() => setSel(r.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  border: `1.5px solid ${active ? T.secondary : T.border}`,
                  background: active ? "#F3F0FF" : "#fff",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: active ? T.secondary : "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={active ? "#fff" : "#6B7280"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {r.key}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    {r.desc}
                  </div>
                </div>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    border: `2px solid ${active ? T.secondary : T.border}`,
                    background: active ? T.secondary : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {active && <Check size={12} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate && onNavigate("Complete Profile")}
          style={{
            width: "100%",
            marginTop: 26,
            padding: "15px 0",
            borderRadius: 14,
            background: T.secondary,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
          }}
        >
          Continue
        </button>
      </div>
    </ScreenFrame>
  );
}

function CompleteProfileScreen({ onNavigate }) {
  const [isBroker, setIsBroker] = useState(false);
  const commonFields = [
    { l: "Full Name", ph: "Enter your name" },
    { l: "Email", ph: "Enter your email (optional)" },
    { l: "City", ph: "Select your city" },
  ];
  const brokerFields = [
    { l: "Firm / Agency Name", ph: "Enter firm name" },
    { l: "Office Address", ph: "Enter office address" },
    { l: "Experience (Years)", ph: "e.g. 5" },
    { l: "RERA Number", ph: "Enter RERA registration number" },
    { l: "GST Number", ph: "Enter GSTIN" },
    { l: "Office City", ph: "Select office city" },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Complete Profile" />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button
            onClick={() => onNavigate && onNavigate("Home")}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: T.secondary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Finish & Continue
          </button>
        </div>
      }
    >
      <div style={{ padding: "6px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              border: `1.5px dashed ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageIcon size={22} color={T.secondary} />
          </div>
        </div>

        {commonFields.map((f) => (
          <div key={f.l} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{f.l}</div>
            <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>{f.ph}</span>
            </div>
          </div>
        ))}

        <div
          onClick={() => setIsBroker(!isBroker)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 4px",
            marginTop: 6,
            marginBottom: isBroker ? 14 : 0,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: `2px solid ${isBroker ? T.secondary : T.border}`,
              background: isBroker ? T.secondary : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isBroker && <Check size={12} color="#fff" />}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
            I'm registering as a Broker
          </span>
        </div>

        {isBroker && (
          <div style={{ background: "#F8F7FF", borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.secondary, marginBottom: 10 }}>
              BROKER / KYC DETAILS
            </div>
            {brokerFields.map((f) => (
              <div key={f.l} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{f.l}</div>
                <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{f.ph}</span>
                </div>
              </div>
            ))}
            <div
              style={{
                border: `1.5px dashed ${T.border}`,
                borderRadius: 10,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "#fff",
              }}
            >
              <FileText size={18} color={T.secondary} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.secondary }}>Upload KYC documents</span>
            </div>
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}

function HomeScreen({ onNavigate }) {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "New Launches", "Owner", "Ready To Move", "Verified"];
  const cats = [
    { l: "Plot", i: LayoutGrid },
    { l: "House", i: HomeIcon },
    { l: "Flat", i: Building2 },
    { l: "Agri Land", i: TreePine },
    { l: "Commercial", i: Store },
    { l: "Warehouse", i: Factory },
  ];
  const plans = [
    { n: "Basic", r: "₹1,500/sqft" },
    { n: "Silver", r: "₹1,600/sqft" },
    { n: "Gold", r: "₹1,800/sqft" },
    { n: "Platinum", r: "₹2,000/sqft" },
  ];

  const header = (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "6px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={16} color={T.secondary} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>Gurugram, Haryana</span>
            <ChevronDown size={14} color={T.primary} />
          </div>
          <div
            onClick={() => onNavigate && onNavigate("Notifications")}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: "#fff",
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={16} color={T.primary} />
            <div style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: 4, background: T.error }} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 14,
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "12px 14px",
          }}
        >
          <Search size={16} color="#9CA3AF" />
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>Search locality, project or landmark</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 10, overflowX: "auto", paddingBottom: 4 }}>
          {tabs.map((t) => (
            <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ScreenFrame header={header} bottom={<BottomNav active="home" onNavigate={onNavigate} />}>
      <Section title="Categories">
        <div style={{ display: "flex", gap: 16, padding: "0 18px", overflowX: "auto" }}>
          {cats.map((c) => {
            const Icon = c.i;
            return (
              <div key={c.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "#fff",
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={22} color={T.secondary} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>{c.l}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <div style={{ padding: "0 18px", marginTop: 18 }}>
        <div
          style={{
            background: `linear-gradient(120deg, ${T.primary}, ${T.secondary})`,
            borderRadius: 18,
            padding: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>LIMITED OFFER</div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginTop: 4 }}>
              Zero brokerage on <br /> owner listings
            </div>
          </div>
          <Sparkles size={30} color={T.accent} />
        </div>
      </div>

      <Section title="Featured Properties" action="See all">
        <div style={{ display: "flex", gap: 12, padding: "0 18px", overflowX: "auto" }}>
          {sampleProperties.map((p, i) => (
            <PropertyCard key={i} {...p} />
          ))}
        </div>
      </Section>

      <Section
        title="Construction Plans"
        action="Compare"
        onAction={() => onNavigate && onNavigate("Construction Comparison")}
      >
        <div style={{ display: "flex", gap: 12, padding: "0 18px", overflowX: "auto" }}>
          {plans.map((p) => (
            <div
              key={p.n}
              onClick={() => onNavigate && onNavigate("Construction Plan Details")}
              style={{
                minWidth: 130,
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 14,
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{p.n}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{p.r}</div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.secondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                View Details <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Popular Locations">
        <div style={{ display: "flex", gap: 8, padding: "0 18px 24px", overflowX: "auto" }}>
          {["Sector 57", "DLF Phase 3", "Sohna Road", "MG Road", "Golf Course Ext."].map((l) => (
            <Chip key={l} label={l} />
          ))}
        </div>
      </Section>
    </ScreenFrame>
  );
}

function SearchScreen() {
  const [openFilter, setOpenFilter] = useState(true);
  const chips = ["2-3 BHK ✕", "Under ₹80L ✕", "Ready To Move ✕"];

  const header = (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "8px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ChevronLeft size={20} color={T.primary} />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: `1.5px solid ${T.secondary}`,
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <Search size={15} color={T.secondary} />
            <span style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>Sector 57, Gurugram</span>
          </div>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: T.secondary,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SlidersHorizontal size={16} color="#fff" />
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto" }}>
          {chips.map((c) => (
            <span
              key={c}
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: "#F3F0FF",
                color: T.secondary,
                padding: "6px 10px",
                borderRadius: 16,
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 12, fontWeight: 600 }}>
          128 properties found
        </div>
      </div>
    </div>
  );

  return (
    <ScreenFrame header={header}>
      <div style={{ padding: "0 18px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sampleProperties.map((p, i) => (
            <PropertyCard key={i} {...p} wide />
          ))}
        </div>
      </div>

      {openFilter && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            boxShadow: "0 -8px 30px rgba(0,0,0,0.18)",
            padding: "16px 20px 24px",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>Filters</span>
            <X size={18} color="#6B7280" onClick={() => setOpenFilter(false)} style={{ cursor: "pointer" }} />
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Budget</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Chip label="Under ₹50L" />
              <Chip label="₹50L - ₹1Cr" active />
              <Chip label="₹1Cr+" />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>BHK Type</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["1", "2", "3", "4+"].map((b) => (
                <Chip key={b} label={b + " BHK"} active={b === "2" || b === "3"} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Property Type</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Flat", "House", "Plot", "Commercial"].map((b) => (
                <Chip key={b} label={b} />
              ))}
            </div>
          </div>

          <button
            style={{
              width: "100%",
              marginTop: 20,
              padding: "14px 0",
              borderRadius: 14,
              background: T.secondary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
            }}
          >
            Apply Filters
          </button>
        </div>
      )}
    </ScreenFrame>
  );
}

function ListingScreen() {
  const header = (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <ChevronLeft size={20} color={T.primary} />
        <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>Flats in Gurugram</span>
      </div>
      <div style={{ padding: "0 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>84 results</span>
        <span style={{ fontSize: 12, color: T.secondary, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
          Sort: Price (Low-High) <ChevronDown size={13} />
        </span>
      </div>
    </div>
  );
  return (
    <ScreenFrame header={header}>
      <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[...sampleProperties, ...sampleProperties].slice(0, 6).map((p, i) => (
          <PropertyCard key={i} {...p} wide />
        ))}
      </div>
    </ScreenFrame>
  );
}

function DetailsScreen({ onNavigate }) {
  const bottom = (
    <div
      style={{
        flexShrink: 0,
        background: "#fff",
        borderTop: `1px solid ${T.border}`,
        padding: "12px 18px 22px",
        display: "flex",
        gap: 10,
      }}
    >
      <button
        style={{
          flex: 1,
          padding: "13px 0",
          borderRadius: 12,
          border: `1.5px solid ${T.secondary}`,
          background: "#fff",
          color: T.secondary,
          fontWeight: 700,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Phone size={14} /> Contact
      </button>
      <button
        style={{
          flex: 1,
          padding: "13px 0",
          borderRadius: 12,
          border: "none",
          background: T.secondary,
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <MessageCircle size={14} /> Enquire Now
      </button>
    </div>
  );

  return (
    <ScreenFrame bg="#fff" bottom={bottom}>
      <div
        onClick={() => onNavigate && onNavigate("Property Gallery")}
        style={{ height: 260, background: gradients[0], position: "relative", cursor: "pointer" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", padding: "44px 16px 0" }}>
          <div
            onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate("Property Listing"); }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: "rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={17} color={T.primary} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                background: "rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share2 size={15} color={T.primary} />
            </div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                background: "rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart size={15} color={T.error} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, background: i === 0 ? "#fff" : "rgba(255,255,255,0.5)" }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 14, right: 16, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <Camera size={12} color="#fff" />
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>1/12</span>
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.primary }}>₹78,00,000</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 2 }}>
              Green Valley 3BHK Flat
            </div>
          </div>
          <span
            style={{
              background: "#DCFCE7",
              color: "#15803D",
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 9px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <ShieldCheck size={11} /> Verified
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, color: T.textMuted, fontSize: 12 }}>
          <MapPin size={13} />
          <span>Sector 57, Golf Course Road, Gurugram</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            padding: "14px 4px",
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          {[
            { i: BedDouble, v: "3", l: "Bedrooms" },
            { i: Bath, v: "2", l: "Bathrooms" },
            { i: Maximize, v: "1450", l: "Sq.ft" },
            { i: Compass, v: "NE", l: "Facing" },
          ].map((s, idx) => {
            const Icon = s.i;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Icon size={17} color={T.secondary} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.v}</span>
                <span style={{ fontSize: 9, color: T.textMuted }}>{s.l}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 6 }}>Description</div>
          <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
            Spacious 3BHK apartment with modular kitchen, covered parking and
            clubhouse access. Ready-to-move with clear title and RERA
            registration.
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8 }}>Amenities</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {["Parking", "Gym", "Power Backup", "Lift", "24x7 Security", "Park"].map((a) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={12} color={T.success} />
                <span style={{ fontSize: 11, color: "#374151" }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: T.secondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            RK
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 4 }}>
              Rakesh Kumar <BadgeCheck size={13} color={T.secondary} />
            </div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Broker · RERA Verified</div>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function AddPropertyScreen({ onNavigate }) {
  const fields = [
    { label: "Property Type", value: "Select type", placeholder: true },
    { label: "Category", value: "Select category", placeholder: true },
    { label: "Listing Type", value: "Sell", placeholder: false },
    { label: "Title", value: "e.g. Green Valley 3BHK Flat", placeholder: true },
    { label: "Price (₹)", value: "Enter price", placeholder: true },
    { label: "Area", value: "Enter area + unit", placeholder: true },
  ];

  const header = (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "8px 18px 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <ChevronLeft size={20} color={T.primary} />
        <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>Add Property</span>
      </div>
      <StepProgress step={1} label="Basic Information" />
    </div>
  );

  const bottom = (
    <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
      <button
        onClick={() => onNavigate && onNavigate("Add Property 2")}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 12,
          border: "none",
          background: T.secondary,
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        Continue to Location <ArrowRight size={15} />
      </button>
    </div>
  );

  return (
    <ScreenFrame bg="#fff" header={header} bottom={bottom}>
      <div style={{ padding: "4px 18px 20px" }}>
        <div
          style={{
            border: `1.5px dashed ${T.border}`,
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginBottom: 18,
          }}
        >
          <ImageIcon size={22} color={T.secondary} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.secondary }}>Add cover photo</span>
          <span style={{ fontSize: 10, color: T.textMuted }}>At least 1 image required</span>
        </div>

        {fields.map((f) => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              {f.label} <span style={{ color: T.error }}>*</span>
            </div>
            <div
              style={{
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: f.placeholder ? "#9CA3AF" : "#111827", fontWeight: f.placeholder ? 400 : 600 }}>
                {f.value}
              </span>
              {f.placeholder && <ChevronDown size={15} color="#9CA3AF" />}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Description</div>
          <div
            style={{
              border: `1.5px solid ${T.border}`,
              borderRadius: 12,
              padding: "12px 14px",
              minHeight: 70,
            }}
          >
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>Describe your property...</span>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function StepProgress({ step, total = 5, label }) {
  return (
    <div style={{ padding: "6px 18px 14px" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < step ? T.secondary : T.border,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, fontWeight: 600 }}>
        Step {step} of {total} — {label}
      </div>
    </div>
  );
}

function StepHeader({ title, onBack }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "8px 18px 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <ChevronLeft size={20} color={T.primary} onClick={onBack} style={{ cursor: "pointer" }} />
        <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>{title}</span>
      </div>
    </div>
  );
}

function FieldBox({ label, value, placeholder, required, dropdown }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
        {label} {required && <span style={{ color: T.error }}>*</span>}
      </div>
      <div
        style={{
          border: `1.5px solid ${T.border}`,
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: placeholder ? "#9CA3AF" : "#111827", fontWeight: placeholder ? 400 : 600 }}>
          {value}
        </span>
        {dropdown && <ChevronDown size={15} color="#9CA3AF" />}
      </div>
    </div>
  );
}

function AddPropertyStepFooter({ onBack, onNext, label }) {
  return (
    <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px", display: "flex", gap: 10 }}>
      <button
        onClick={onBack}
        style={{
          padding: "14px 20px",
          borderRadius: 12,
          border: `1.5px solid ${T.border}`,
          background: "#fff",
          color: "#374151",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        Back
      </button>
      <button
        onClick={onNext}
        style={{
          flex: 1,
          padding: "14px 0",
          borderRadius: 12,
          border: "none",
          background: T.secondary,
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {label} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function AddPropertyLocationScreen({ onNavigate }) {
  const fields = [
    { l: "State", ph: "Select state", dd: true },
    { l: "City", ph: "Select city", dd: true },
    { l: "Area / Locality", ph: "Select area", dd: true },
    { l: "Pincode", ph: "6-digit pincode", dd: false },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={
        <div style={{ flexShrink: 0 }}>
          <StepHeader title="Add Property" onBack={() => onNavigate("Add Property 1")} />
          <StepProgress step={2} label="Location" />
        </div>
      }
      bottom={<AddPropertyStepFooter onBack={() => onNavigate("Add Property 1")} onNext={() => onNavigate("Add Property 3")} label="Continue to Details" />}
    >
      <div style={{ padding: "4px 18px 20px" }}>
        {fields.map((f) => (
          <FieldBox key={f.l} label={f.l} value={f.ph} placeholder required dropdown={f.dd} />
        ))}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
            Address <span style={{ color: T.error }}>*</span>
          </div>
          <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", minHeight: 60 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>Enter full address</span>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "16px 0 8px" }}>
          Map Location <span style={{ color: T.error }}>*</span>
        </div>
        <div
          style={{
            height: 130,
            borderRadius: 14,
            background: "linear-gradient(135deg,#E0E7FF,#C7D2FE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <MapPin size={26} color={T.secondary} />
          <span style={{ position: "absolute", bottom: 10, fontSize: 10, color: T.secondary, fontWeight: 700, background: "#fff", padding: "3px 8px", borderRadius: 8 }}>
            Tap to pin exact location
          </span>
        </div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 8 }}>
          Latitude / Longitude will be auto-captured from the map pin.
        </div>
      </div>
    </ScreenFrame>
  );
}

function AddPropertyDetailsScreen({ onNavigate }) {
  const rows = [
    "BHK Type", "Bedrooms", "Bathrooms", "Balcony", "Floor / Total Floors",
    "Built-up Area", "Carpet Area", "Plot Area", "Parking", "Facing / Direction",
    "Road Width", "Furnishing", "Ready To Move / Under Construction",
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={
        <div style={{ flexShrink: 0 }}>
          <StepHeader title="Add Property" onBack={() => onNavigate("Add Property 2")} />
          <StepProgress step={3} label="Property Details" />
        </div>
      }
      bottom={<AddPropertyStepFooter onBack={() => onNavigate("Add Property 2")} onNext={() => onNavigate("Add Property 4")} label="Continue to Media" />}
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>
          Fields shown adapt automatically based on the Property Category selected in Step 1.
        </div>
        {rows.map((r) => (
          <FieldBox key={r} label={r} value={`Select ${r.toLowerCase()}`} placeholder dropdown />
        ))}
      </div>
    </ScreenFrame>
  );
}

function AddPropertyMediaScreen({ onNavigate }) {
  return (
    <ScreenFrame
      bg="#fff"
      header={
        <div style={{ flexShrink: 0 }}>
          <StepHeader title="Add Property" onBack={() => onNavigate("Add Property 3")} />
          <StepProgress step={4} label="Media & Documents" />
        </div>
      }
      bottom={<AddPropertyStepFooter onBack={() => onNavigate("Add Property 3")} onNext={() => onNavigate("Add Property 5")} label="Continue to Preview" />}
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Photos <span style={{ color: T.error }}>*</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          {gradients.map((g, i) => (
            <div key={i} style={{ height: 74, borderRadius: 10, background: g, position: "relative" }}>
              <X size={13} color="#fff" style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: 2 }} />
            </div>
          ))}
          <div
            style={{
              height: 74,
              borderRadius: 10,
              border: `1.5px dashed ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} color={T.secondary} />
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Video (optional)</div>
        <div
          style={{
            border: `1.5px dashed ${T.border}`,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <ImageIcon size={18} color={T.secondary} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.secondary }}>Upload a walkthrough video</span>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Documents (optional)</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={15} color={T.secondary} />
            <span style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>Sale_Deed.pdf</span>
          </div>
          <span style={{ fontSize: 10, color: T.success, fontWeight: 700 }}>Uploaded</span>
        </div>
        <div
          style={{
            border: `1.5px dashed ${T.border}`,
            borderRadius: 12,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FileText size={18} color={T.secondary} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.secondary }}>Add another document</span>
        </div>
      </div>
    </ScreenFrame>
  );
}

function AddPropertyPreviewScreen({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ScreenFrame bg="#fff">
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Check size={30} color="#15803D" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.primary }}>Listing submitted</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8, lineHeight: 1.6 }}>
            Your property is now Pending Approval. Reference ID <b style={{ color: "#111827" }}>UK-2026-08341</b>. You'll be notified once it's reviewed.
          </div>
          <button
            onClick={() => onNavigate("My Properties")}
            style={{ marginTop: 22, padding: "13px 26px", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 13 }}
          >
            Go to My Properties
          </button>
        </div>
      </ScreenFrame>
    );
  }

  const summary = [
    { l: "Basic Info", v: "Green Valley 3BHK Flat · ₹78,00,000", target: "Add Property 1" },
    { l: "Location", v: "Sector 57, Gurugram, 122018", target: "Add Property 2" },
    { l: "Property Details", v: "3 BHK · 2 Bath · 1450 sqft", target: "Add Property 3" },
    { l: "Media", v: "5 photos uploaded, 1 document", target: "Add Property 4" },
  ];

  return (
    <ScreenFrame
      bg="#fff"
      header={<StepHeader title="Preview & Submit" onBack={() => onNavigate("Add Property 4")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button
            onClick={() => setSubmitted(true)}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}
          >
            Submit Listing
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <PropertyCard {...sampleProperties[0]} wide />
        <div style={{ marginTop: 16 }}>
          {summary.map((s) => (
            <div
              key={s.l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 4px",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{s.l}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{s.v}</div>
              </div>
              <span
                onClick={() => onNavigate(s.target)}
                style={{ fontSize: 11, fontWeight: 700, color: T.secondary, cursor: "pointer" }}
              >
                Edit
              </span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 14, lineHeight: 1.6 }}>
          On submission, your listing status becomes Pending Approval until reviewed by the Admin team.
        </div>
      </div>
    </ScreenFrame>
  );
}

function MyPropertiesScreen({ onNavigate }) {
  const header = (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "8px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ChevronLeft
            size={20}
            color={T.primary}
            onClick={() => onNavigate && onNavigate("Profile")}
            style={{ cursor: "pointer" }}
          />
          <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>My Properties</span>
        </div>
        <div
          onClick={() => onNavigate && onNavigate("Add Property 1")}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: T.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Plus size={17} color="#fff" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 18px 12px", overflowX: "auto" }}>
        <Chip label="All (3)" active />
        <Chip label="Active (1)" />
        <Chip label="Under Review (1)" />
        <Chip label="Sold (1)" />
      </div>
    </div>
  );

  return (
    <ScreenFrame header={header}>
      <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {myProperties.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex" }}>
              <div style={{ width: 96, height: 96, background: p.img, flexShrink: 0 }} />
              <div style={{ padding: 12, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.title}</span>
                  <StatusPill status={p.status} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginTop: 4 }}>{p.price}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, color: T.textMuted, fontSize: 11 }}>
                  <MapPin size={11} />
                  <span>{p.loc}</span>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                borderTop: `1px solid ${T.border}`,
                padding: "10px 12px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.textMuted }}>
                  <Eye size={13} /> {p.views}
                </span>
                <span
                  onClick={() => onNavigate && onNavigate("Lead Details")}
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.secondary, fontWeight: 700, cursor: "pointer" }}
                >
                  <MessageSquare size={13} /> {p.inquiries} inquiries
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Edit3 size={15} color={T.secondary} />
                <Trash2 size={15} color={T.error} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

function PortfolioScreen({ onNavigate }) {
  const [tab, setTab] = useState("Selling");
  const header = (
    <div style={{ flexShrink: 0 }}>
      <StatusBar />
      <div style={{ padding: "8px 18px 0" }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: T.primary }}>Portfolio</span>
      </div>
      <div style={{ padding: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { l: "Active Listings", v: "2", i: HomeIcon },
          { l: "Total Leads", v: "18", i: Users },
          { l: "This Month", v: "+5", i: TrendingUp },
        ].map((s) => {
          const Icon = s.i;
          return (
            <div key={s.l} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 10 }}>
              <Icon size={14} color={T.secondary} />
              <div style={{ fontSize: 16, fontWeight: 800, color: T.primary, marginTop: 6 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>{s.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "14px 18px 12px" }}>
        <Chip label="Selling Properties" active={tab === "Selling"} onClick={() => setTab("Selling")} />
        <Chip label="Purchase Interest" active={tab === "Interest"} onClick={() => setTab("Interest")} />
      </div>
    </div>
  );

  return (
    <ScreenFrame header={header} bottom={<BottomNav active="portfolio" onNavigate={onNavigate} />}>
      {tab === "Selling" ? (
        <div style={{ padding: "0 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {myProperties.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 10,
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 10, background: p.img, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{p.title}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{p.price}</div>
              </div>
              <StatusPill status={p.status} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "0 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {sampleProperties.slice(0, 3).map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 10,
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 10, background: p.img, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{p.title}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{p.price}</div>
              </div>
              <StatusPill status={i === 0 ? "New" : "In Progress"} />
            </div>
          ))}
        </div>
      )}
    </ScreenFrame>
  );
}

function ProfileScreen({ onNavigate }) {
  const menu = [
    { l: "My Properties", i: HomeIcon, target: "My Properties" },
    { l: "Saved Properties", i: Heart, target: "Saved Properties" },
    { l: "My Enquiries", i: ClipboardList, target: "My Enquiries" },
    { l: "Loan & Construction Requests", i: Wallet, target: "Loan & Construction" },
    { l: "Legal Requests", i: FileText, target: "Legal Requests" },
    { l: "Settings", i: Settings, target: "Settings" },
    { l: "Help & Support", i: HelpCircle, target: "Help & Support" },
  ];
  return (
    <ScreenFrame bottom={<BottomNav active="profile" onNavigate={onNavigate} />}>
      <StatusBar />
      <div style={{ padding: "6px 18px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            background: T.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          YG
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>Yashwant Gehlot</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>+91 98XXXXXX10</div>
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              fontSize: 10,
              fontWeight: 700,
              background: "#F3F0FF",
              color: T.secondary,
              padding: "3px 9px",
              borderRadius: 8,
            }}
          >
            Seller Account
          </span>
        </div>
      </div>

      <div style={{ padding: "0 18px" }}>
        {menu.map((m) => {
          const Icon = m.i;
          return (
            <div
              key={m.l}
              onClick={() => onNavigate && onNavigate(m.target)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 4px",
                borderBottom: `1px solid ${T.border}`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#F3F0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color={T.secondary} />
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.l}</span>
              <ChevronRight size={16} color="#9CA3AF" />
            </div>
          );
        })}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 4px",
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={16} color={T.error} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.error }}>Log Out</span>
        </div>
      </div>
    </ScreenFrame>
  );
}

// ---- New sub-screens reached from the Profile menu ----

const savedTabs = ["Saved", "Interested", "Contacted", "Recently Viewed"];

function SavedPropertiesScreen({ onNavigate }) {
  const [tab, setTab] = useState("Saved");
  const header = (
    <div style={{ flexShrink: 0 }}>
      <BackHeader title="Saved Properties" onBack={() => onNavigate("Profile")} />
      <div style={{ display: "flex", gap: 8, padding: "0 18px 12px", overflowX: "auto" }}>
        {savedTabs.map((t) => (
          <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>
    </div>
  );
  return (
    <ScreenFrame bg="#fff" header={header}>
      <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {sampleProperties.map((p, i) => (
          <PropertyCard key={i} {...p} wide />
        ))}
      </div>
    </ScreenFrame>
  );
}

const enquiries = [
  { title: "Green Valley 3BHK Flat", loc: "Sector 57, Gurugram", status: "New", date: "10 Aug 2026", img: gradients[0] },
  { title: "Independent House, Corner Plot", loc: "DLF Phase 3, Gurugram", status: "In Progress", date: "07 Aug 2026", img: gradients[1] },
  { title: "Residential Plot 200 sq.yd", loc: "Sohna Road, Gurugram", status: "Responded", date: "02 Aug 2026", img: gradients[2] },
  { title: "Commercial Shop, Main Market", loc: "MG Road, Gurugram", status: "Closed", date: "28 Jul 2026", img: gradients[3] },
];

function MyEnquiriesScreen({ onNavigate }) {
  return (
    <ScreenFrame bg="#fff" header={<BackHeader title="My Enquiries" onBack={() => onNavigate("Profile")} />}>
      <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {enquiries.map((e, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: 10,
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 10, background: e.img, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{e.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, color: T.textMuted, fontSize: 11 }}>
                <MapPin size={11} />
                <span>{e.loc}</span>
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{e.date}</div>
            </div>
            <StatusPill status={e.status} />
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

const serviceRequests = [
  { title: "Home Loan Enquiry — ₹65,00,000", type: "Loan", status: "Under Review", date: "09 Aug 2026", icon: Wallet },
  { title: "Construction Quotation — Gold Plan, 1800 sqft", type: "Construction", status: "In Progress", date: "05 Aug 2026", icon: Building2 },
  { title: "Home Loan Pre-Approval — ₹40,00,000", type: "Loan", status: "Active", date: "22 Jul 2026", icon: Wallet },
];

function LoanConstructionScreen({ onNavigate }) {
  return (
    <ScreenFrame bg="#fff" header={<BackHeader title="Loan & Construction Requests" onBack={() => onNavigate("Profile")} />}>
      <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {serviceRequests.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#F3F0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} color={T.secondary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{r.title}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{r.type} · {r.date}</div>
              </div>
              <StatusPill status={r.status} />
            </div>
          );
        })}
      </div>
    </ScreenFrame>
  );
}

const legalRequests = [
  { title: "Property Verification — Green Valley Flat", status: "In Progress", date: "08 Aug 2026" },
  { title: "Registration Assistance — DLF Phase 3 House", status: "Under Review", date: "03 Aug 2026" },
  { title: "Title Search — Sohna Road Plot", status: "Closed", date: "19 Jul 2026" },
];

function LegalRequestsScreen({ onNavigate }) {
  return (
    <ScreenFrame bg="#fff" header={<BackHeader title="Legal Requests" onBack={() => onNavigate("Profile")} />}>
      <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {legalRequests.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#F3F0FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={17} color={T.secondary} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{r.title}</div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{r.date}</div>
            </div>
            <StatusPill status={r.status} />
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

function SettingsScreen({ onNavigate }) {
  const rows = [
    { l: "Push Notifications", sub: "Alerts for enquiries, leads and offers", on: true },
    { l: "Email Notifications", sub: "Weekly digest and updates", on: false },
    { l: "Dark Mode", sub: "Switch app appearance", on: false },
    { l: "Show Contact Number", sub: "Visible to buyers on your listings", on: true },
  ];
  return (
    <ScreenFrame bg="#fff" header={<BackHeader title="Settings" onBack={() => onNavigate("Profile")} />}>
      <div style={{ padding: "4px 18px 4px" }}>
        {rows.map((r) => (
          <ListRow key={r.l} label={r.l} sub={r.sub} right={<Toggle on={r.on} />} />
        ))}
        <ListRow icon={User} label="Edit Profile" right={<ChevronRight size={16} color="#9CA3AF" />} />
        <ListRow icon={FileText} label="Change Password" right={<ChevronRight size={16} color="#9CA3AF" />} />
        <ListRow icon={Landmark} label="Language — English" right={<ChevronRight size={16} color="#9CA3AF" />} />
      </div>
    </ScreenFrame>
  );
}

const faqs = [
  "How do I add a property for sale?",
  "How is my listing verified?",
  "How do I contact a Seller or Broker?",
  "How does the Construction Plan comparison work?",
  "How do I track my legal service request?",
];

function HelpSupportScreen({ onNavigate }) {
  return (
    <ScreenFrame bg="#fff" header={<BackHeader title="Help & Support" onBack={() => onNavigate("Profile")} />}>
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
            <Phone size={18} color={T.secondary} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>Call Support</div>
          </div>
          <div style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
            <MessageCircle size={18} color={T.secondary} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>Chat with Us</div>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8 }}>
          Frequently Asked Questions
        </div>
        {faqs.map((q) => (
          <div
            key={q}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 2px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, paddingRight: 10 }}>{q}</span>
            <ChevronRight size={15} color="#9CA3AF" />
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

// ---- Property Gallery (full screen) ----

function PropertyGalleryScreen({ onNavigate }) {
  const [idx, setIdx] = useState(0);
  return (
    <ScreenFrame bg="#000">
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "44px 16px 10px" }}>
          <X size={22} color="#fff" onClick={() => onNavigate("Property Details")} style={{ cursor: "pointer" }} />
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{idx + 1} / {gradients.length}</span>
          <Share2 size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, background: gradients[idx], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft size={24} color="rgba(255,255,255,0.7)" style={{ position: "absolute", left: 10 }} onClick={() => setIdx(Math.max(0, idx - 1))} />
          <ChevronRight size={24} color="rgba(255,255,255,0.7)" style={{ position: "absolute", right: 10 }} onClick={() => setIdx(Math.min(gradients.length - 1, idx + 1))} />
        </div>
        <div style={{ display: "flex", gap: 8, padding: 14, overflowX: "auto" }}>
          {gradients.map((g, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: g,
                flexShrink: 0,
                border: i === idx ? `2px solid ${T.accent}` : "2px solid transparent",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

// ---- Lead Details (Seller/Broker side) ----

function LeadDetailsScreen({ onNavigate }) {
  const [status, setStatus] = useState("Contacted");
  const statuses = ["New", "Contacted", "Interested", "Site Visit Planned", "Negotiation", "Closed", "Lost"];
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Lead Details" onBack={() => onNavigate("Portfolio")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px", display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1.5px solid ${T.secondary}`, background: "#fff", color: T.secondary, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Phone size={14} /> Call
          </button>
          <button style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <MessageCircle size={14} /> WhatsApp
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: T.secondary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
            AS
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Ankit Sharma</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>+91 98XXXXXX42 · Buyer</div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: gradients[0], flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Green Valley 3BHK Flat</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>₹78,00,000 · Sector 57, Gurugram</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 11, color: T.textMuted }}>
          <span>Enquiry Date: <b style={{ color: "#111827" }}>07 Aug 2026</b></span>
          <span>Follow-up: <b style={{ color: "#111827" }}>13 Aug 2026</b></span>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Lead Status</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statuses.map((s) => (
              <Chip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Remarks</div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#111827" }}>Buyer requested a site visit this weekend.</div>
            <div style={{ fontSize: 9, color: T.textMuted, marginTop: 4 }}>08 Aug 2026, 4:20 PM</div>
          </div>
          <div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: "10px 12px" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>Add a remark...</span>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

// ---- Services hub ----

function ServicesScreen({ onNavigate }) {
  const cards = [
    { t: "Construction Services", d: "Contract construction plans & self-build support", i: Building2, target: "Construction Services" },
    { t: "Loan Calculator", d: "Estimate your EMI and apply for a home loan", i: Wallet, target: "Loan Calculator" },
    { t: "Legal Services", d: "Property verification & registration assistance", i: FileText, target: "Legal Services" },
  ];
  return (
    <ScreenFrame
      header={
        <div style={{ flexShrink: 0 }}>
          <StatusBar />
          <div style={{ padding: "6px 18px 4px" }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: T.primary }}>Services</span>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
              Everything beyond the listing — build, finance and legalize.
            </div>
          </div>
        </div>
      }
      bottom={<BottomNav active="services" onNavigate={onNavigate} />}
    >
      <div style={{ padding: "14px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {cards.map((c) => {
          const Icon = c.i;
          return (
            <div
              key={c.t}
              onClick={() => onNavigate(c.target)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                padding: 16,
                cursor: "pointer",
              }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={21} color={T.secondary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{c.t}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{c.d}</div>
              </div>
              <ChevronRight size={18} color="#9CA3AF" />
            </div>
          );
        })}
      </div>
    </ScreenFrame>
  );
}

// ---- Construction module ----

const constructionPlans = [
  { n: "Basic", r: "₹1,500/sqft" },
  { n: "Silver", r: "₹1,600/sqft" },
  { n: "Gold", r: "₹1,800/sqft" },
  { n: "Platinum", r: "₹2,000/sqft" },
];

function ConstructionServicesScreen({ onNavigate }) {
  const [tab, setTab] = useState("Contract");
  const selfBuild = [
    { l: "Material Suppliers", i: Store },
    { l: "Builders / Mason", i: HomeIcon },
    { l: "Painters", i: Sparkles },
    { l: "Plumbers", i: Landmark },
    { l: "Electricians", i: Factory },
    { l: "Architects", i: Building2 },
    { l: "Interior Designers", i: LayoutGrid },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={
        <div style={{ flexShrink: 0 }}>
          <BackHeader title="Construction Services" onBack={() => onNavigate("Services")} />
          <div style={{ display: "flex", gap: 8, padding: "0 18px 12px" }}>
            <Chip label="Contract Construction" active={tab === "Contract"} onClick={() => setTab("Contract")} />
            <Chip label="Self-Build Support" active={tab === "Self"} onClick={() => setTab("Self")} />
          </div>
        </div>
      }
    >
      {tab === "Contract" ? (
        <div style={{ padding: "4px 18px 20px" }}>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
            Choose a plan to see full material brands, specifications and estimated timeline.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {constructionPlans.map((p) => (
              <div
                key={p.n}
                onClick={() => onNavigate("Construction Plan Details")}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, cursor: "pointer" }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{p.n}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{p.r} · Material + Labour</div>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("Construction Comparison")}
            style={{ width: "100%", marginTop: 16, padding: "13px 0", borderRadius: 12, border: `1.5px solid ${T.secondary}`, background: "#fff", color: T.secondary, fontWeight: 700, fontSize: 13 }}
          >
            Compare Plans
          </button>
          <button
            onClick={() => onNavigate("Cost Calculator")}
            style={{ width: "100%", marginTop: 10, padding: "13px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 13 }}
          >
            Open Cost Calculator
          </button>
        </div>
      ) : (
        <div style={{ padding: "4px 18px 20px" }}>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
            Browse verified suppliers and service providers for a self-managed build.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {selfBuild.map((s) => {
              const Icon = s.i;
              return (
                <div
                  key={s.l}
                  onClick={() => onNavigate(s.l === "Material Suppliers" ? "Material Directory" : "Provider Directory")}
                  style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={17} color={T.secondary} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{s.l}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ScreenFrame>
  );
}

const planSpecCategories = [
  { c: "Structure / RCC", items: ["M20 grade concrete", "Standard column & beam design"] },
  { c: "Steel", items: ["Fe 500 TMT bars", "As per structural design"] },
  { c: "Flooring", items: ["Vitrified tiles — living areas", "Anti-skid tiles — bathrooms"] },
  { c: "Electrical", items: ["Concealed copper wiring", "Modular switches"] },
  { c: "Plumbing", items: ["CPVC/UPVC piping", "Standard fittings"] },
  { c: "Kitchen", items: ["Granite platform", "Steel sink"] },
  { c: "Bathroom", items: ["Standard sanitaryware", "CP fittings"] },
  { c: "Painting", items: ["Interior emulsion", "Exterior weatherproof paint"] },
  { c: "Safety", items: ["Fire-safety compliant wiring", "Standard railing height"] },
  { c: "Warranty", items: ["1-year structural warranty"] },
  { c: "Services", items: ["Site supervision included"] },
];

function ConstructionPlanDetailsScreen({ onNavigate }) {
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Gold Plan" onBack={() => onNavigate("Construction Services")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}>
            Request Quotation
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ background: `linear-gradient(120deg, ${T.primary}, ${T.secondary})`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>GOLD PLAN</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 4 }}>₹1,800 / sq.ft</div>
        </div>
        {planSpecCategories.map((s) => (
          <div key={s.c} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 6 }}>{s.c}</div>
            {s.items.map((it) => (
              <div key={it} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Check size={12} color={T.success} />
                <span style={{ fontSize: 11, color: "#374151" }}>{it}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

function ConstructionComparisonScreen({ onNavigate }) {
  const [selected, setSelected] = useState(["Silver", "Gold"]);
  const toggle = (n) => {
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : s.length < 3 ? [...s, n] : s));
  };
  const rows = [
    { c: "Price / sq.ft", Basic: "₹1,500", Silver: "₹1,600", Gold: "₹1,800", Platinum: "₹2,000" },
    { c: "Steel", Basic: "Fe 415", Silver: "Fe 500", Gold: "Fe 500", Platinum: "Fe 550" },
    { c: "Flooring", Basic: "Ceramic", Silver: "Vitrified", Gold: "Vitrified", Platinum: "Italian marble" },
    { c: "Paint", Basic: "1 coat", Silver: "2 coat", Gold: "2 coat premium", Platinum: "3 coat luxury" },
    { c: "Electrical", Basic: "Standard", Silver: "Modular", Gold: "Modular branded", Platinum: "Smart home ready" },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={
        <div style={{ flexShrink: 0 }}>
          <BackHeader title="Compare Plans" onBack={() => onNavigate("Construction Services")} />
          <div style={{ display: "flex", gap: 8, padding: "0 18px 12px", overflowX: "auto" }}>
            {constructionPlans.map((p) => (
              <Chip key={p.n} label={p.n} active={selected.includes(p.n)} onClick={() => toggle(p.n)} />
            ))}
          </div>
        </div>
      }
    >
      <div style={{ padding: "0 18px 20px", overflowX: "auto" }}>
        <div style={{ minWidth: selected.length * 110 + 100 }}>
          {rows.map((r) => (
            <div key={r.c} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{r.c}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected.map((s) => (
                  <div key={s} style={{ flex: 1, minWidth: 100, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.secondary, marginBottom: 3 }}>{s}</div>
                    <div style={{ fontSize: 11, color: "#111827", fontWeight: 600 }}>{r[s]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

const materialSuppliers = [
  { n: "BuildRight Cement Traders", cat: "Cement", loc: "Sector 18, Gurugram", exp: "12 yrs" },
  { n: "Sharma Steel & Iron", cat: "Steel/Iron", loc: "Udyog Vihar, Gurugram", exp: "9 yrs" },
  { n: "Modern Tiles Gallery", cat: "Tiles", loc: "Sohna Road, Gurugram", exp: "7 yrs" },
];

function MaterialDirectoryScreen({ onNavigate }) {
  const cats = ["All", "Cement", "Steel/Iron", "Sand", "Bricks", "Paint", "Tiles", "Electrical", "Plumbing"];
  const [cat, setCat] = useState("All");
  return (
    <ScreenFrame
      header={
        <div style={{ flexShrink: 0 }}>
          <BackHeader title="Material Suppliers" onBack={() => onNavigate("Construction Services")} />
          <div style={{ display: "flex", gap: 8, padding: "0 18px 12px", overflowX: "auto" }}>
            {cats.map((c) => (
              <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
            ))}
          </div>
        </div>
      }
    >
      <div style={{ padding: "0 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {materialSuppliers.map((s) => (
          <div key={s.n} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{s.cat} · {s.exp} experience</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: T.textMuted, fontSize: 11 }}>
              <MapPin size={11} /> <span>{s.loc}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${T.secondary}`, background: "#fff", color: T.secondary, fontWeight: 700, fontSize: 11 }}>
                Contact
              </button>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 11 }}>
                Request Quote
              </button>
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

const serviceProviders = [
  { n: "Rajesh Contractors", cat: "Contractor", loc: "Sector 45, Gurugram", exp: "15 yrs", rating: "4.7" },
  { n: "AR Design Studio", cat: "Architect", loc: "DLF Phase 2, Gurugram", exp: "8 yrs", rating: "4.9" },
  { n: "Verma Electrical Works", cat: "Electrician", loc: "Sushant Lok, Gurugram", exp: "10 yrs", rating: "4.5" },
];

function ProviderDirectoryScreen({ onNavigate }) {
  const cats = ["All", "Contractor", "Architect", "Mason", "Electrician", "Plumber", "Painter", "Interior Designer"];
  const [cat, setCat] = useState("All");
  return (
    <ScreenFrame
      header={
        <div style={{ flexShrink: 0 }}>
          <BackHeader title="Service Providers" onBack={() => onNavigate("Construction Services")} />
          <div style={{ display: "flex", gap: 8, padding: "0 18px 12px", overflowX: "auto" }}>
            {cats.map((c) => (
              <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
            ))}
          </div>
        </div>
      }
    >
      <div style={{ padding: "0 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {serviceProviders.map((s) => (
          <div key={s.n} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.n}</div>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "#92400E" }}>
                <Star size={12} color={T.accent} /> {s.rating}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{s.cat} · {s.exp} experience</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: T.textMuted, fontSize: 11 }}>
              <MapPin size={11} /> <span>{s.loc}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${T.secondary}`, background: "#fff", color: T.secondary, fontWeight: 700, fontSize: 11 }}>
                Contact
              </button>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 11 }}>
                Request Quote
              </button>
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

function CostCalculatorScreen({ onNavigate }) {
  const fields = [
    { l: "Plot Size", ph: "e.g. 200 sq.yd", dd: false },
    { l: "Built-up Area", ph: "e.g. 1800 sqft", dd: false },
    { l: "Number of Floors", ph: "e.g. 2", dd: false },
    { l: "Construction Quality", ph: "Basic / Standard / Premium / Luxury", dd: true },
    { l: "Plan / Package", ph: "Optional — select a plan", dd: true },
    { l: "Material Package", ph: "Optional", dd: true },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Construction Cost Calculator" onBack={() => onNavigate("Construction Services")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button
            onClick={() => onNavigate("Quotation Result")}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}
          >
            Calculate Estimate
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        {fields.map((f) => (
          <FieldBox key={f.l} label={f.l} value={f.ph} placeholder dropdown={f.dd} required={!f.l.includes("Optional") && !f.l.includes("Package")} />
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Labour</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip label="Included" active />
            <Chip label="Excluded" />
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function QuotationResultScreen({ onNavigate }) {
  const rows = [
    { l: "Estimated Material Cost", v: "₹22,40,000" },
    { l: "Estimated Labour Cost", v: "₹9,80,000" },
    { l: "Estimated Cost / sq.ft", v: "₹1,800" },
    { l: "Estimated Timeline", v: "8–10 months" },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Quotation Result" onBack={() => onNavigate("Cost Calculator")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}>
            Request Final Quotation
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ background: `linear-gradient(120deg, ${T.primary}, ${T.secondary})`, borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>ESTIMATED TOTAL COST</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginTop: 6 }}>₹32,20,000</div>
        </div>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 4px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: "#374151" }}>{r.l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{r.v}</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 14, lineHeight: 1.6 }}>
          This is an estimate only. The final commercial quotation will be prepared and approved by the responsible construction service provider.
        </div>
      </div>
    </ScreenFrame>
  );
}

// ---- Loan module ----

function LoanCalculatorScreen({ onNavigate }) {
  const fields = [
    { l: "Loan Amount (₹)", ph: "e.g. 65,00,000" },
    { l: "Interest Rate (%)", ph: "e.g. 8.5" },
    { l: "Loan Tenure (Years)", ph: "e.g. 20" },
    { l: "Down Payment (₹)", ph: "Optional" },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Loan Calculator" onBack={() => onNavigate("Services")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button
            onClick={() => onNavigate("EMI Result")}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}
          >
            Calculate EMI
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        {fields.map((f) => (
          <FieldBox key={f.l} label={f.l} value={f.ph} placeholder required={!f.l.includes("Optional")} />
        ))}
      </div>
    </ScreenFrame>
  );
}

function EMIResultScreen({ onNavigate }) {
  const rows = [
    { l: "Total Interest Payable", v: "₹58,42,000" },
    { l: "Total Payable Amount", v: "₹1,23,42,000" },
    { l: "Loan Amount", v: "₹65,00,000" },
    { l: "Tenure", v: "20 years" },
  ];
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="EMI Result" onBack={() => onNavigate("Loan Calculator")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px", display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1.5px solid ${T.secondary}`, background: "#fff", color: T.secondary, fontWeight: 700, fontSize: 13 }}>
            Request Callback
          </button>
          <button style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 13 }}>
            Apply for Loan
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ background: `linear-gradient(120deg, ${T.primary}, ${T.secondary})`, borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>MONTHLY EMI</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginTop: 6 }}>₹56,398</div>
        </div>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 4px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: "#374151" }}>{r.l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{r.v}</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 14, lineHeight: 1.6 }}>
          EMI calculation is an estimate and does not constitute loan approval or eligibility confirmation.
        </div>
      </div>
    </ScreenFrame>
  );
}

// ---- Legal module ----

const legalServiceTypes = [
  "Property Document Verification",
  "Ownership Verification",
  "Title Search",
  "Encumbrance Check",
  "Legal Opinion",
  "Document Review",
];

function LegalServicesScreen({ onNavigate }) {
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Legal Services" onBack={() => onNavigate("Services")} />}
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
          Our legal team facilitates document submission and status tracking. Legal conclusions are made by the authorized legal team.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {legalServiceTypes.map((s) => (
            <div
              key={s}
              onClick={() => onNavigate("Legal Request")}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, cursor: "pointer" }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{s}</span>
              <ChevronRight size={16} color="#9CA3AF" />
            </div>
          ))}
        </div>
        <div
          onClick={() => onNavigate("Registration Request")}
          style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F3F0FF", borderRadius: 14, padding: 14, cursor: "pointer" }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>Property Registration</div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Sale deed, transfer, mutation & registry assistance</div>
          </div>
          <ChevronRight size={16} color={T.secondary} />
        </div>
      </div>
    </ScreenFrame>
  );
}

function LegalRequestScreen({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <ScreenFrame bg="#fff">
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Check size={30} color="#15803D" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.primary }}>Request submitted</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8, lineHeight: 1.6 }}>
            Status: <b style={{ color: "#111827" }}>Submitted</b>. Track progress under Legal Requests in your Profile.
          </div>
          <button
            onClick={() => onNavigate("Legal Requests")}
            style={{ marginTop: 22, padding: "13px 26px", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 13 }}
          >
            View Legal Requests
          </button>
        </div>
      </ScreenFrame>
    );
  }
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Verification Request" onBack={() => onNavigate("Legal Services")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button
            onClick={() => setSubmitted(true)}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}
          >
            Submit Request
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <FieldBox label="Property" value="Select from your properties or enter reference" placeholder dropdown required />
        <FieldBox label="State / City / Area" value="Select location" placeholder dropdown required />
        <FieldBox label="Service Type" value="Property Document Verification" required />
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          Document Uploads <span style={{ color: T.error }}>*</span>
        </div>
        <div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <FileText size={18} color={T.secondary} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.secondary }}>Add Sale Deed / Khasra / Tax receipt</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Additional Notes</div>
        <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", minHeight: 60 }}>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>Any specific concerns...</span>
        </div>
      </div>
    </ScreenFrame>
  );
}

function RegistrationRequestScreen({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <ScreenFrame bg="#fff">
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Check size={30} color="#15803D" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.primary }}>Registration request submitted</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8, lineHeight: 1.6 }}>
            Actual registration is subject to applicable laws and the responsible registration authority.
          </div>
          <button
            onClick={() => onNavigate("Legal Requests")}
            style={{ marginTop: 22, padding: "13px 26px", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 13 }}
          >
            View Requests
          </button>
        </div>
      </ScreenFrame>
    );
  }
  return (
    <ScreenFrame
      bg="#fff"
      header={<BackHeader title="Registration Request" onBack={() => onNavigate("Legal Services")} />}
      bottom={
        <div style={{ flexShrink: 0, background: "#fff", borderTop: `1px solid ${T.border}`, padding: "12px 18px 22px" }}>
          <button
            onClick={() => setSubmitted(true)}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: T.secondary, color: "#fff", fontWeight: 700, fontSize: 14 }}
          >
            Submit Request
          </button>
        </div>
      }
    >
      <div style={{ padding: "4px 18px 20px" }}>
        <FieldBox label="Property" value="Select from your properties or enter reference" placeholder dropdown required />
        <FieldBox label="Registration Service" value="Sale Deed Registration Assistance" dropdown required />
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          Document Uploads <span style={{ color: T.error }}>*</span>
        </div>
        <div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <FileText size={18} color={T.secondary} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.secondary }}>Add required documents</span>
        </div>
        <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.6 }}>
          Actual registration is subject to applicable laws, government processes, document validity and the responsible legal/registration authority.
        </div>
      </div>
    </ScreenFrame>
  );
}

// ---- Notifications ----

const notifications = [
  { t: "Your property listing has been approved.", e: "Property Approval", time: "2h ago", i: Check, unread: true },
  { t: "You received a new enquiry on Green Valley 3BHK Flat.", e: "New Lead", time: "5h ago", i: MessageSquare, unread: true },
  { t: "Your legal verification status has changed to Under Review.", e: "Legal Update", time: "1d ago", i: FileText, unread: false },
  { t: "Your quotation request has been updated.", e: "Construction Quote", time: "2d ago", i: Building2, unread: false },
  { t: "Your loan enquiry has been updated to In Process.", e: "Loan Update", time: "3d ago", i: Wallet, unread: false },
  { t: "New properties matching your saved search in Sector 57.", e: "Promotional", time: "4d ago", i: Sparkles, unread: false },
];

function NotificationsScreen({ onNavigate }) {
  return (
    <ScreenFrame bg="#fff" header={<BackHeader title="Notifications" onBack={() => onNavigate("Home")} />}>
      <div style={{ padding: "4px 18px 20px" }}>
        {notifications.map((n, i) => {
          const Icon = n.i;
          return (
            <div key={i} style={{ display: "flex", gap: 12, padding: "13px 4px", borderBottom: `1px solid ${T.border}`, background: n.unread ? "#F8F7FF" : "transparent" }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} color={T.secondary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#111827", fontWeight: n.unread ? 700 : 500, lineHeight: 1.5 }}>{n.t}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{n.e} · {n.time}</div>
              </div>
              {n.unread && <div style={{ width: 7, height: 7, borderRadius: 4, background: T.secondary, marginTop: 4, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </ScreenFrame>
  );
}


const RENDER = {
  Splash: SplashScreen,
  Login: LoginScreen,
  OTP: OtpScreen,
  "Role Select": RoleScreen,
  "Complete Profile": CompleteProfileScreen,
  Home: HomeScreen,
  "Search & Filters": SearchScreen,
  "Property Listing": ListingScreen,
  "Property Details": DetailsScreen,
  "Property Gallery": PropertyGalleryScreen,
  "Add Property 1": AddPropertyScreen,
  "Add Property 2": AddPropertyLocationScreen,
  "Add Property 3": AddPropertyDetailsScreen,
  "Add Property 4": AddPropertyMediaScreen,
  "Add Property 5": AddPropertyPreviewScreen,
  "My Properties": MyPropertiesScreen,
  "Lead Details": LeadDetailsScreen,
  Portfolio: PortfolioScreen,
  Services: ServicesScreen,
  "Construction Services": ConstructionServicesScreen,
  "Construction Plan Details": ConstructionPlanDetailsScreen,
  "Construction Comparison": ConstructionComparisonScreen,
  "Material Directory": MaterialDirectoryScreen,
  "Provider Directory": ProviderDirectoryScreen,
  "Cost Calculator": CostCalculatorScreen,
  "Quotation Result": QuotationResultScreen,
  "Loan Calculator": LoanCalculatorScreen,
  "EMI Result": EMIResultScreen,
  "Legal Services": LegalServicesScreen,
  "Legal Request": LegalRequestScreen,
  "Registration Request": RegistrationRequestScreen,
  Notifications: NotificationsScreen,
  Profile: ProfileScreen,
  "Saved Properties": SavedPropertiesScreen,
  "My Enquiries": MyEnquiriesScreen,
  "Loan & Construction": LoanConstructionScreen,
  "Legal Requests": LegalRequestsScreen,
  Settings: SettingsScreen,
  "Help & Support": HelpSupportScreen,
};

export default function UrbanKartMockup() {
  const [active, setActive] = useState("Home");
  const Active = RENDER[active];

  return (
    <div
      style={{
        minHeight: 900,
        background: "#EEF0F4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 12px 40px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.primary }}>
          UrbanKart — Mobile UI Mockup
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          High-fidelity reference screens (design tokens from FRS Section 36.3)
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 22,
          maxWidth: 680,
        }}
      >
        {SCREENS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: `1.5px solid ${active === s ? T.secondary : "#D1D5DB"}`,
              background: active === s ? T.secondary : "#fff",
              color: active === s ? "#fff" : "#374151",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <PhoneShell>
        <Active onNavigate={setActive} />
      </PhoneShell>

      <div style={{ marginTop: 20, fontSize: 11, color: "#9CA3AF", textAlign: "center", maxWidth: 380 }}>
        Reference mockup only — recreate in Figma using these layouts, spacing
        and the token values from FRS Section 36.3 for pixel-accurate design
        files.
      </div>
    </div>
  );
}
