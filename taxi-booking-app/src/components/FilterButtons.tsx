import React from 'react';
import { useBookingStore } from '../stores/useBookingStore';
import './FilterButtons.css';

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
    <div className="filter-buttons">
      {filters.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={currentFilter === value ? 'active' : ''}
          disabled={currentFilter === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;