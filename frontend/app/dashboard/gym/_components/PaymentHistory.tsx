
import React from 'react';
import { Button } from '@/components/ui/button';

// Interface for payment data
interface Payment {
  id: number;
  date: string;
  member: string;
  amount: number;
  method: string;
  status: string;
}

// Dummy data for payment history
const payments: Payment[] = [
  {
    id: 1,
    date: '2025-08-10',
    member: 'John Doe',
    amount: 50.0,
    method: 'Credit Card',
    status: 'Paid',
  },
  {
    id: 2,
    date: '2025-08-09',
    member: 'Jane Smith',
    amount: 75.0,
    method: 'PayPal',
    status: 'Paid',
  },
  {
    id: 3,
    date: '2025-08-08',
    member: 'Alice Johnson',
    amount: 100.0,
    method: 'Bank Transfer',
    status: 'Pending',
  },
  {
    id: 4,
    date: '2025-08-07',
    member: 'Bob Brown',
    amount: 60.0,
    method: 'Credit Card',
    status: 'Failed',
  },
  {
    id: 5,
    date: '2025-08-06',
    member: 'Charlie Davis',
    amount: 45.0,
    method: 'Cash',
    status: 'Paid',
  },
];

const PaymentHistory: React.FC = () => {
  return (
    <div className="w-full p-4 bg-gray-800 bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-lg">
      <h2 className="text-2xl text-white font-semibold text-white mb-4">
        Payment History
      </h2>
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
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {payment.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {payment.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {payment.member}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {payment.method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button size="sm">Invoice</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
