import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from 'recharts';
import { ChartData } from '../../types';

interface Props {
  data: ChartData[];
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RoundtripOnewayChart: React.FC<Props> = ({ data, className }) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2>{t('roundtrip_oneway_chart_title')}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={(props: PieLabelRenderProps) => { const { payload, percent } = props; return `${(payload as ChartData).name} ${((percent as number) * 100).toFixed(0)}%`; }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RoundtripOnewayChart;