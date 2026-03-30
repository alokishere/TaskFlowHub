import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, Users, Building2, FileText, LogOut, LayoutDashboard } from "lucide-react";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const services = [
    { icon: Globe, title: "Visa & Immigration", desc: "End-to-end visa processing and immigration support for individuals and corporates." },
    { icon: Users, title: "Manpower Supply", desc: "Skilled workforce solutions tailored to your business requirements across sectors." },
    { icon: Building2, title: "Real Estate", desc: "Trusted property advisory and transaction support for residential and commercial needs." },
    { icon: FileText, title: "Legal Advisory", desc: "Expert legal guidance for business registration, compliance, and documentation." },
  ];

  const getRoleBadgeStyle = (role) => {
    if (role === "admin") return { background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" };
    return { background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" };
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "white" }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 40%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(245,158,11,0.05) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <div className="text-center mb-20">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#1a1a1a" />
                <text x="10" y="33" fontFamily="Georgia, serif" fontSize="28" fontWeight="bold" fill="#7c3aed">S</text>
                <path d="M32 16 L40 16 L40 24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 24 L40 16" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <div className="text-left">
                <p className="text-white font-bold text-xl leading-none tracking-[0.25em]">SARATHI</p>
                <p className="text-white/30 text-[9px] tracking-[0.4em] uppercase mt-1">India</p>
              </div>
            </div>
          </div>

          {user ? (
            <>
              {/* User greeting */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-medium"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Logged in
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Welcome back,<br />
                <span style={{ color: "#7c3aed" }}>{user.name}</span>
              </h1>
              <p className="text-white/35 text-base mb-10">
                Continue managing your work from the dashboard.
              </p>

              {/* User info card */}
              <div
                className="inline-flex flex-col items-start gap-4 rounded-2xl px-8 py-6 mb-10 text-left"
                style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-white/35 text-xs">{user.email}</p>
                  </div>
                  <div
                    className="ml-auto text-xs font-semibold px-3 py-1 rounded-full capitalize"
                    style={getRoleBadgeStyle(user.role)}
                  >
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white group transition-all"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                  }}
                >
                  <LayoutDashboard size={15} />
                  Go to Dashboard
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <bu tton
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                >
                  <LogOut size={14} />
                  Logout
                </bu>
              </div>
            </>
          ) : (
            <>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-medium"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}
              >
                Sarathi India Private Limited
              </div>
              <h1 className="text-5xl font-bold mb-5 leading-tight">
                Navigate Global
                <br />
                <span style={{ color: "#7c3aed" }}>Opportunities</span>
              </h1>
              <p className="text-white/35 text-base mb-10 max-w-md mx-auto leading-relaxed">
                Comprehensive service solutions for visa, legal, training, and business support across Southeast Asia.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm text-white group transition-all"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 4px 28px rgba(124,58,237,0.4)",
                }}
              >
                Sign In to Your Account
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>


        {/* ── FOOTER ── */}
        <div
          className="mt-16 pt-8 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-white/20 text-xs">© 2026 Sarathi India Pvt. Ltd. All rights reserved.</p>
          <p className="text-white/15 text-xs">Lucknow, India</p>
        </div>
      </div>
    </div>
  );
};

export default Home;