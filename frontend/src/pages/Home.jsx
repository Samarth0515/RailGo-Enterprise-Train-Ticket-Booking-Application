import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchWidget } from '../components/search/SearchWidget';
import { Train, ShieldCheck, Zap, Ticket, Clock, ArrowRight, Award, Users } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  const popularRoutes = [
    {
      fromCode: 'CSMT',
      toCode: 'PUNE',
      fromName: 'Mumbai CSMT',
      toName: 'Pune Junction',
      price: '350',
      duration: '3h 15m',
      trainsCount: '18 trains',
    },
    {
      fromCode: 'BCT',
      toCode: 'NDLS',
      fromName: 'Mumbai Central',
      toName: 'New Delhi',
      price: '1,850',
      duration: '15h 32m',
      trainsCount: '8 trains (Rajdhani)',
    },
    {
      fromCode: 'SBC',
      toCode: 'MAS',
      fromName: 'Bengaluru City',
      toName: 'Chennai Central',
      price: '480',
      duration: '4h 25m',
      trainsCount: '12 trains (Vande Bharat)',
    },
    {
      fromCode: 'PUNE',
      toCode: 'CSMT',
      fromName: 'Pune Junction',
      toName: 'Mumbai CSMT',
      price: '350',
      duration: '3h 10m',
      trainsCount: '18 trains (Deccan Queen)',
    },
  ];

  const handleRouteClick = (fromCode, toCode) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    navigate(`/search?from=${fromCode}&to=${toCode}&date=${dateStr}&passengers=1`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-blue-900 via-blue-800 to-slate-900 text-white overflow-hidden rounded-b-[40px] shadow-lg">
        {/* Background abstract overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-5xl mx-auto text-center space-y-4 mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-700/60 border border-blue-500/40 text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Pessimistic Concurrency • Zero Double-Booking Guarantee</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Travel farther. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 via-white to-blue-300">
              Book smarter.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100/80 max-w-2xl mx-auto font-normal">
            Real-time Indian Railways seat inventory, interactive coach berth selection, instant PNR issuance, and verified automated refunds.
          </p>
        </div>

        {/* Floating Search Widget */}
        <div className="max-w-5xl mx-auto relative z-20">
          <SearchWidget />
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Journeys
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top booked passenger express and high-speed corridors
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 hidden sm:block">
            Click any route for instant 1-click search
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularRoutes.map((route, idx) => (
            <div
              key={idx}
              onClick={() => handleRouteClick(route.fromCode, route.toCode)}
              className="group bg-white border border-slate-200/90 hover:border-blue-500 rounded-3xl p-6 shadow-subtle hover:shadow-card cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
                <span>{route.trainsCount}</span>
                <span className="text-blue-600 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View →
                </span>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {route.fromName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>Direct Route ({route.duration})</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {route.toName}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Starting from</span>
                <span className="text-base font-black text-slate-900">₹{route.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose RailGo Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[36px] p-8 sm:p-14 text-white">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Railway Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed from the ground up for high concurrency, reliable database transactions, and smooth booking experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Pessimistic Concurrency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Database-level locks (`@Lock(PESSIMISTIC_WRITE)`) prevent race conditions and guarantee zero double-booking even under peak flash reservation loads.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                <Train className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Coach Berth Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual coach layouts for 1A, 2A, 3A, Sleeper, and Chair Car. Pick your exact berth (Lower, Middle, Upper, Window) in real time.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Official E-Ticket Slips</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant PDF boarding pass generation using OpenPDF with authentic PNR barcode, passenger roster, and fare tax audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-subtle text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-blue-600">100%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Concurrency Safe</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">5 Mins</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Temporary Seat Lock</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">6 Classes</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">1A, 2A, 3A, SL, CC, 2S</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-emerald-600">Instant</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Refund Calculation</p>
          </div>
        </div>
      </section>
    </div>
  );
};
