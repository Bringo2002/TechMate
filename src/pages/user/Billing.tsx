import { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Shield, 
  Zap, 
  Plus,
  FileText
} from 'lucide-react';

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      period: 'forever',
      features: ['Basic Project Access', 'Community Support', '1 Active Project', 'Standard Delivery'],
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$49',
      period: 'month',
      features: ['Priority Support', 'Unlimited Projects', 'Advanced Analytics', ' expedited Delivery', 'Team Collaboration'],
      color: 'violet',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      features: ['Dedicated Account Manager', 'Custom SLAs', 'On-premise Deployment', 'Audit Logs', 'SSO Integration'],
      color: 'emerald'
    }
  ];

  const invoices = [
    { id: 'INV-2024-001', date: 'Oct 1, 2024', amount: '$49.00', status: 'paid', description: 'Professional Plan - Oct 2024' },
    { id: 'INV-2024-002', date: 'Sep 1, 2024', amount: '$49.00', status: 'paid', description: 'Professional Plan - Sep 2024' },
    { id: 'INV-2024-003', date: 'Aug 1, 2024', amount: '$49.00', status: 'paid', description: 'Professional Plan - Aug 2024' },
  ];

  const paymentMethods = [
    { id: 1, type: 'visa', last4: '4242', expiry: '12/25', default: true },
    { id: 2, type: 'mastercard', last4: '8899', expiry: '09/24', default: false }
  ];

  return (
    <div className="space-y-8 p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Billing & Subscription
          </h1>
          <p className="text-gray-400 mt-1">Manage your plan, payment methods, and invoices</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-all flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Billing Support
          </button>
        </div>
      </div>

      {/* Current Plan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  Current Plan
                </span>
                <h2 className="text-2xl font-bold text-white">Professional Plan</h2>
                <p className="text-gray-400 mt-1">Next billing date: November 1, 2024</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">$49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                <div className="text-sm text-green-400 flex items-center justify-end gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </div>
              </div>
            </div>

            <div className="w-full bg-zinc-800/50 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-6">
              <span>21 days remaining in cycle</span>
              <span>65% usage</span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 bg-white text-black hover:bg-gray-100 rounded-xl font-semibold transition-all">
                Upgrade Plan
              </button>
              <button className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all border border-zinc-700">
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-400" />
                Payment Methods
              </h3>
              <button className="text-sm text-violet-400 hover:text-white transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-gray-400">
                      {method.type.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        •••• •••• •••• {method.last4}
                        {method.default && (
                          <span className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-[10px] uppercase font-bold rounded border border-zinc-700">Default</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Expires {method.expiry}</div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice History */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Invoice History
              </h3>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500 font-semibold border-b border-zinc-800">
                    <th className="pb-3 pl-2">Invoice ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-4 pl-2 font-medium text-white">{invoice.id}</td>
                      <td className="py-4 text-gray-400">{invoice.date}</td>
                      <td className="py-4 text-white font-medium">{invoice.amount}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button className="p-2 hover:bg-zinc-700 rounded-lg text-gray-400 hover:text-white transition-all" title="Download Invoice">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar - Available Plans */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Available Plans</h3>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPlan === plan.id 
                      ? 'bg-zinc-800 border-violet-500/50 ring-1 ring-violet-500/20' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{plan.name}</h4>
                    {plan.popular && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500">/{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                        <CheckCircle2 className={`w-3 h-3 text-${plan.color}-400`} />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-gray-500 pl-5">
                        + {plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                  <button className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedPlan === plan.id 
                      ? 'bg-violet-600 text-white hover:bg-violet-700' 
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'
                  }`}>
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Need a Custom Solution?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Contact our sales team for tailored enterprise plans and dedicated support.
            </p>
            <button className="w-full py-2.5 bg-white text-black hover:bg-indigo-50 rounded-xl font-bold text-sm transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
