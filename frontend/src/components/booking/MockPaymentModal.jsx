import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Smartphone, CreditCard, Building2, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MockPaymentModal = ({
  isOpen,
  onClose,
  amount = 0,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('UPI');
  const [upiId, setUpiId] = useState('passenger@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [cardHolder, setCardHolder] = useState('RAHUL PATIL');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);

    // Simulate mock payment processing delay
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess({
        paymentMethod: activeTab,
        paymentReference: activeTab === 'UPI' ? upiId : activeTab === 'CARD' ? 'CARD-ENDING-8812' : selectedBank,
        amount,
      });
    }, 1200);
  };

  const tabs = [
    { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
    { id: 'CARD', label: 'Credit / Debit', icon: CreditCard },
    { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
    { id: 'WALLET', label: 'Wallets', icon: Wallet },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !processing && onClose()}
      title="Secure Mock Payment"
      subtitle="Simulate ticket transaction without real money"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Amount Header */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Payable Amount</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{Math.round(amount)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'UPI' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter UPI Virtual Address</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
            <div className="flex gap-2">
              {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((suffix) => (
                <button
                  key={suffix}
                  type="button"
                  onClick={() => setUpiId(`passenger${suffix}`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  {suffix}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CARD' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Card Number (Mock Demo)</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  defaultValue="08/29"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">CVV</label>
                <input
                  type="password"
                  defaultValue="882"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 uppercase font-medium"
              />
            </div>
          </div>
        )}

        {activeTab === 'NET_BANKING' && (
          <div className="space-y-3 text-xs">
            <label className="block font-bold text-slate-700">Select Retail Bank</label>
            <div className="grid grid-cols-2 gap-2">
              {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                    selectedBank === b
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'WALLET' && (
          <div className="space-y-3 text-xs">
            <label className="block font-bold text-slate-700">Select Digital Wallet</label>
            <div className="grid grid-cols-3 gap-2">
              {['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik', 'Freecharge'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWallet(w)}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                    selectedWallet === w
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={handlePay}
            loading={processing}
            variant="primary"
            size="lg"
            fullWidth
            className="rounded-2xl shadow-md text-base"
          >
            Pay ₹{Math.round(amount)} (Simulate Success)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
