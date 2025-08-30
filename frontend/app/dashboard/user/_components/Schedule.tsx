import React, { useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-overrides.css';
import './color-picker.css';

const localizer = momentLocalizer(moment);

interface Event {
  title: string;
  start: Date;
  end: Date;
  color: string;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskColor, setTaskColor] = useState('#ef4444');
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [hovered, setHovered] = useState<'save' | 'cancel' | null>(null);

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle && taskDate) {
      let dateObj = new Date(taskDate);
      if (taskTime) {
        const [hours, minutes] = taskTime.split(":");
        dateObj.setHours(Number(hours), Number(minutes));
      }
      setEvents([
        ...events,
        {
          title: taskTitle,
          start: dateObj,
          end: dateObj,
          color: taskColor,
        },
      ]);
      setTaskTitle('');
      setTaskDate('');
      setTaskTime('');
      setTaskColor('#ef4444');
      setShowForm(false);
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    setTaskDate(moment(slotInfo.start).format('YYYY-MM-DD'));
  };

  return (
    <div>
      <h2>User Schedule</h2>
      {!showForm && (
        <button
          type="button"
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: '3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '1rem',
          }}
          onClick={() => setShowForm(true)}
        >
          Add Task
        </button>
      )}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <form onSubmit={handleSaveTask} style={{
            background: '#222',
            padding: '2rem',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            minWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            alignItems: 'stretch',
            position: 'relative',
          }}>
            <h3 style={{ color: '#fff', margin: 0, textAlign: 'center' }}>Add Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              required
              style={{ padding: '8px', borderRadius: 6, border: '1px solid #444', background: '#111', color: '#fff' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  required
                  style={{
                    padding: '12px 40px 12px 12px',
                    borderRadius: 8,
                    border: '2px solid #ef4444',
                    background: '#fff',
                    color: '#222',
                    width: '100%',
                    fontSize: '1rem',
                    fontWeight: 500,
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    marginBottom: 0,
                    appearance: 'none',
                    MozAppearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="7" width="18" height="14" rx="2" fill="#ef4444"/>
                    <rect x="7" y="11" width="2" height="2" rx="1" fill="#fff"/>
                    <rect x="11" y="11" width="2" height="2" rx="1" fill="#fff"/>
                    <rect x="15" y="11" width="2" height="2" rx="1" fill="#fff"/>
                    <rect x="7" y="15" width="2" height="2" rx="1" fill="#fff"/>
                    <rect x="11" y="15" width="2" height="2" rx="1" fill="#fff"/>
                    <rect x="15" y="15" width="2" height="2" rx="1" fill="#fff"/>
                    <rect x="7" y="3" width="2" height="4" rx="1" fill="#ef4444"/>
                    <rect x="15" y="3" width="2" height="4" rx="1" fill="#ef4444"/>
                  </svg>
                </span>
              </div>
              <input
                type="time"
                value={taskTime}
                onChange={e => setTaskTime(e.target.value)}
                required
                style={{ padding: '8px', borderRadius: 6, border: '2px solid #ef4444', background: '#fff', color: '#222', width: 120, fontSize: '1rem', fontWeight: 500, outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontSize: 15 }}>Color:</span>
              <input
                type="color"
                value={taskColor}
                onChange={e => setTaskColor(e.target.value)}
                className="color-picker"
                title="Choose event color"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                style={{
                  background: hovered === 'cancel' ? '#222' : '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'background 0.15s',
                }}
              >
                Save
              </button>
              <button
                type="button"
                style={{
                  background: hovered === 'cancel' ? '#ef4444' : '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'background 0.15s',
                }}
                onClick={() => setShowForm(false)}
                onMouseEnter={() => setHovered('cancel')}
                onMouseLeave={() => setHovered(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* @ts-ignore: Suppress JSX type error for Calendar component */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
  style={{ height: 600, marginLeft: '2rem', marginRight: '2rem' }}
        defaultView="month"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={{ month: true, week: true, day: true, agenda: true }}
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={(event) => ({ style: { backgroundColor: event.color, color: '#6e3131ff', borderRadius: 4 } })}
      />
    </div>
  );
};

export default Schedule;