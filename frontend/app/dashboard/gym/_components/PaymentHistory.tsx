import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CreateAccount, GetDashboardLink, GetPaymentHistory } from '@/api/gym/route';
import { toast } from 'sonner';
import { useGym } from '../context/GymContext';

// Interface for payment data
interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  created: string;
  receipt_url: string;
}

const PaymentHistory: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading,setLoading] = useState(false)
  const { userId } = useGym();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const response = await GetPaymentHistory(userId);
        if (response.data?.payments) {
          setPaymentHistory(response.data.payments);
          console.log(response.data.payments);
        } else {
          throw new Error('No payments data received');
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
        toast.error('Error fetching payment history');
      }finally{
        setLoading(false)
      }
    };
    if (userId) {
      fetchPayments();
    }
  }, [userId]);

  const getSession = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      toast.error('Error fetching session');
      return null;
    }
    return data.session?.user.id ?? null;
  };

  const goToDashboard = async () => {
    const id = await getSession();
    if (!id) return;

    try {
      const response = await GetDashboardLink(id);
      if (response?.data?.founded) {
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
      } else {
        const confirmed = window.confirm(
          "You don't have a Stripe account! Do you want to create one? Please complete the process, as you can't do it later."
        );
        if (confirmed) {
          const createResponse = await CreateAccount(id);
          if (createResponse?.data?.url) {
            window.open(createResponse.data.url, '_blank', 'noopener,noreferrer');
          } else {
            toast.error('Error creating Stripe account');
          }
        }
      }
    } catch (error) {
      console.error('Error accessing Stripe dashboard:', error);
      toast.error('Error accessing Stripe dashboard');
    }
  };

  return (
    <div className="w-full p-4 bg-gray-800 bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-lg">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl text-white font-semibold mb-4">Payment History</h2>
        <Button variant="outline" onClick={goToDashboard}>
          Stripe Dashboard
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[hsl(var(--border))] bg-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(payment.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      size="sm"
                      onClick={() => window.open(payment.receipt_url, '_blank', 'noopener,noreferrer')}
                    >
                      View Receipt
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-300">
                  No payment history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;