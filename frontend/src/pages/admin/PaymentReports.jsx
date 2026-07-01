import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { DollarSign, ShieldAlert, FileText } from 'lucide-react';

const PaymentReports = () => {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/admin/payments');
        setPayments(data);
      } catch (err) {
        addToast('Failed to load transaction reports', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Financial Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Audit log of payments, tickets receipts, and refunds</p>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 h-64 rounded-3xl"></div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-8">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-750 dark:text-gray-355">No transactions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Payment transaction logs will show up here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-medium text-gray-700 dark:text-gray-300">
                {payments.map((p) => {
                  const formattedDate = new Date(p.createdAt).toLocaleString();
                  const isRefunded = p.status === 'refunded';
                  const isFailed = p.status === 'failed';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-4.5 pl-2">
                        <span className="font-mono text-xs text-gray-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800 select-all">
                          {p.transactionId}
                        </span>
                      </td>
                      <td className="py-4.5">
                        <p className="font-bold text-gray-850 dark:text-gray-200">{p.user?.name || 'Deleted User'}</p>
                        <p className="text-xs text-gray-400 font-medium">{p.user?.email}</p>
                      </td>
                      <td className="py-4.5">
                        <p className="font-semibold line-clamp-1 max-w-[200px]">{p.event?.title || 'Deleted Event'}</p>
                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4.5 font-bold">
                        ${p.amount}
                      </td>
                      <td className="py-4.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isRefunded
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            : isFailed
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                            : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4.5 text-xs text-gray-450 dark:text-gray-400">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReports;
