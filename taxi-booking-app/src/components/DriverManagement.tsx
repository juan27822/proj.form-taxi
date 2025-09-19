import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../api';
import { useTranslation } from 'react-i18next';

interface Driver {
  id: string;
  name: string;
  phone: string;
}

const DriverManagement: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [show, setShow] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');

  useEffect(() => {
    if (show) {
      fetchDrivers();
    }
  }, [show]);

  const fetchDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDriver({ name: newDriverName, phone: newDriverPhone });
      setNewDriverName('');
      setNewDriverPhone('');
      fetchDrivers();
    } catch (error) {
      console.error("Error creating driver:", error);
    }
  };

  const handleUpdate = async (driver: Driver) => {
    try {
      await updateDriver(driver.id, { name: driver.name, phone: driver.phone });
      setEditingDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('driver_delete_confirm'))) {
      try {
        await deleteDriver(id);
        fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
      }
    }
  };

  if (!show) {
    return <button onClick={() => setShow(true)}>{t('manage_drivers_btn')}</button>;
  }

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{t('driver_management_title')}</h2>
      <button onClick={() => setShow(false)} style={{ float: 'right' }}>{t('close_btn')}</button>
      
      <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
        <h3>{t('add_new_driver')}</h3>
        <input 
          type="text" 
          placeholder={t('driver_name_placeholder')} 
          value={newDriverName} 
          onChange={(e) => setNewDriverName(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder={t('driver_phone_placeholder')} 
          value={newDriverPhone} 
          onChange={(e) => setNewDriverPhone(e.target.value)} 
          required 
        />
        <button type="submit">{t('add_driver_btn')}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>{t('driver_name_label')}</th>
            <th>{t('driver_phone_label')}</th>
            <th>{t('actions_col')}</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr key={driver.id}>
              <td>
                {editingDriver?.id === driver.id ? (
                  <input 
                    type="text"
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                  />
                ) : (
                  driver.name
                )}
              </td>
              <td>
                {editingDriver?.id === driver.id ? (
                  <input 
                    type="text"
                    value={editingDriver.phone}
                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                  />
                ) : (
                  driver.phone
                )}
              </td>
              <td>
                {editingDriver?.id === driver.id ? (
                  <button onClick={() => handleUpdate(editingDriver)}>{t('save_changes_btn')}</button>
                ) : (
                  <button onClick={() => setEditingDriver(driver)}>{t('edit_btn')}</button>
                )}
                <button onClick={() => handleDelete(driver.id)}>{t('delete_btn')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverManagement;
