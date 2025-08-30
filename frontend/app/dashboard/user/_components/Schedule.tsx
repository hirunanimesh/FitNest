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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <form onSubmit={handleSaveTask} className="bg-gray-900 p-8 rounded-xl shadow-2xl min-w-[320px] flex flex-col gap-4 relative">
            <h3 className="text-white text-center text-lg font-semibold mb-2">Add Task</h3>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <label htmlFor="task_title" className="text-gray-200 text-sm font-medium">Title</label>
                <input
                  id="task_title"
                  type="text"
                  placeholder="Task Title"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required
                  className="bg-gray-800 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task_date" className="text-gray-200 text-sm font-medium">Date</label>
                <input
                
                  id="task_date"
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  required
                  className="bg-gray-800 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task_time" className="text-gray-200 text-sm font-medium">Time</label>
                <input
                  id="task_time"
                  type="time"
                  value={taskTime}
                  onChange={e => setTaskTime(e.target.value)}
                  required
                  className="bg-gray-800 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 w-[120px]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task_color" className="text-gray-200 text-sm font-medium">Color</label>
                <input
                  id="task_color"
                  type="color"
                  value={taskColor}
                  onChange={e => setTaskColor(e.target.value)}
                  className="color-picker w-8 h-8 p-0 border-none rounded-full"
                  title="Choose event color"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className={`px-4 py-2 rounded-md font-semibold transition-colors duration-150 shadow ${hovered === 'cancel' ? 'bg-gray-800' : 'bg-red-500'} text-white hover:bg-gray-800`}
              >
                Save
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md font-semibold transition-colors duration-150 shadow ${hovered === 'cancel' ? 'bg-red-500' : 'bg-gray-800'} text-white hover:bg-red-500`}
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