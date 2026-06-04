import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export default function Analytics() {
  const { expenses, categories } = useStore();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const pieData = categories.map(cat => {
    const value = monthlyExpenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.name, value };
  }).filter(d => d.value > 0);

  const COLORS = ['#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa', '#fb7185', '#9ca3af'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const barData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const spent = monthlyExpenses.filter(e => new Date(e.date).getDate() === day).reduce((sum, e) => sum + e.amount, 0);
    return { day: day.toString(), amount: spent };
  });

  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    toast.loading('Generating PDF...', { id: 'pdf' });
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Expense_Report_${new Date().toLocaleString('default', { month: 'long' })}_${currentYear}.pdf`);
      toast.success('Report downloaded successfully!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report', { id: 'pdf' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your spending habits.</p>
        </div>
        <button
          onClick={exportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-medium hover:bg-primary/20 transition-all active:scale-95 shadow-sm disabled:opacity-50"
        >
          <Download size={20} /> {isExporting ? 'Generating...' : 'Export Report'}
        </button>
      </header>

      <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-background p-2 rounded-2xl">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex justify-center items-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data for this month</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Daily Spending (This Month)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => `₹${value}`} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
