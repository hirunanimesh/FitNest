// Calendar.styles.ts
// Additional calendar styles for time labels and today's date highlighting

const calendarStyles = `
/* Style time labels on left side to match date colors */
.fc-timegrid-axis-cushion,
.fc-timegrid-slot-label-cushion,
.fc-timegrid-slot-label {
  color: #9ca3af !important; /* Same gray as date text */
}

.fc-timegrid-axis {
  color: #9ca3af !important;
}

/* Time text styling */
.fc-timegrid-slot-label .fc-timegrid-slot-label-cushion {
  color: #9ca3af !important;
  font-weight: 400 !important;
}

/* Ensure all time-related text uses consistent color */
.fc-timegrid-slot-minor .fc-timegrid-slot-label-cushion {
  color: #6b7280 !important; /* Slightly lighter for minor time slots */
}

/* Highlight today's date with red circle */
.fc-day-today .fc-daygrid-day-number {
  background-color: #ef4444 !important; /* Red background */
  color: white !important; /* White text for contrast */
  border-radius: 50% !important; /* Make it circular */
  width: 28px !important; /* Fixed width for circle */
  height: 28px !important; /* Fixed height for circle */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 600 !important; /* Make text bold */
  margin: 2px auto !important; /* Center horizontally with auto margins */
}

/* Center the today's date circle in the cell */
.fc-day-today .fc-daygrid-day-top {
  display: flex !important;
  justify-content: center !important; /* Center the date number */
  width: 100% !important;
}

/* Additional centering for the day frame */
.fc-day-today .fc-daygrid-day-frame {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

/* Style for week/day view today highlight */
.fc-day-today .fc-col-header-cell-cushion {
  background-color: #ef4444 !important;
  color: white !important;
  border-radius: 50% !important;
  width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 600 !important;
  margin: 2px auto !important;
}

/* Event rendering styles */
.calendar-event-container {
  border-radius: 6px;
  color: #fff;
  font-weight: 400;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.calendar-event-title {
  width: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  text-align: center;
  letter-spacing: -0.25px;
  font-weight: 400;
}

/* Small screen event styles */
.calendar-event-title--small {
  line-height: 0.9rem;
  -webkit-line-clamp: 1;
}

/* Regular screen event styles */
.calendar-event-title--regular {
  line-height: 0.95rem;
  -webkit-line-clamp: 2;
}
`;

export default calendarStyles;