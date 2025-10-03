import React from 'react';
import { useBookingStore } from '../stores/useBookingStore';

const FilterButtons: React.FC = () => {
  const { setFilter, filter: currentFilter } = useBookingStore();

  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Confirmadas', value: 'confirmed' },
    { label: 'Sin Asignar', value: 'unassigned' },
    { label: 'Completadas', value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' },
  ];

  return (
    <div className="filter-buttons" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {filters.map(({ label, value }) => (
        <button key={value} onClick={() => setFilter(value)} disabled={currentFilter === value} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;