import React from 'react';
import { Train, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Rail<span className="text-blue-500">Go</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modern Indian Railways ticketing platform. Fast seat reservations, multi-class availability, instant PNR status, and verified refunds.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Official IRCTC API Compliant Partner</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Bookings</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Search Trains</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">PNR Status Enquiry</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">Cancel Ticket & Refund</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Seat Availability Calendar</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Routes */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Popular Routes</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400">Mumbai CSMT → Pune Jn</span></li>
              <li><span className="text-slate-400">Mumbai Central → New Delhi</span></li>
              <li><span className="text-slate-400">Bengaluru City → Chennai Central</span></li>
              <li><span className="text-slate-400">Pune Jn → Mumbai CSMT</span></li>
            </ul>
          </div>

          {/* Col 4: Trust & Guarantee */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform Features</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Sub-second seat reservation engine with concurrency locks.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero double-booking guarantee backed by pessimistic locking.</span>
              </div>
              <div className="flex items-start gap-2">
                <Headphones className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Instant digital ticket generation with printable boarding passes.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 RailGo Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Refund Rules</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
