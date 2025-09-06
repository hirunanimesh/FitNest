// Schedule.styles.ts
// This file contains the global CSS used by the Schedule component.
// It is intentionally a string exported as default so the component can
// inject it via styled-jsx's global scope: <style jsx global>{styles}</style>
//
// Comments inside the CSS explain which UI parts each selector affects.

const styles = `
/*
  Global CSS for Schedule component

  Affected areas:
  - .fc* selectors: FullCalendar visual styling (grid, headers, events)
  - .calendar-shell: wrapper around the calendar (background, border, shadow)
  - .color-picker: the color input used in Add Task dialog
  - Dialog card styles are inherited from existing UI components; this file
    only targets calendar and event visuals.
*/

/* Base color tweaks */
.fc-timegrid-slot-label,
.fc-list-event-time,
.fc-daygrid-event .fc-event-time,
.fc-timegrid-axis-cushion {
  color: #bdbdbd !important;
}

/* Full calendar background: pure black to reveal gutters between tiles */
.calendar-shell {
  background: black;
  padding: 2rem 1.25rem;
  border-radius: 14px;
  position: relative;
  z-index: 1;
  box-shadow:
    0 8px 30px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 0 15px rgba(0, 180, 255, 0.4),   /* outer glow */
    0 0 30px rgba(0, 180, 255, 0.3);   /* extended glow */
}

/* add a shiny animated gradient border */
.calendar-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 2px; /* thickness of shine */
  background: linear-gradient(135deg,
    rgba(255, 0, 51, 0.9),
    rgba(255,0,180,0.9),
    rgba(255, 0, 51, 0.9));
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: shineMove 4s linear infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes shineMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.fc {
  background: transparent;
}


/* Remove default table borders so gutters show as black */
.fc .fc-scrollgrid, .fc .fc-scrollgrid-section, .fc .fc-daygrid-body, .fc .fc-daygrid-body td, .fc-daygrid-day {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}
.fc .fc-scrollgrid td, .fc .fc-scrollgrid th { border-color: transparent !important; }

/* Header day pills (tighter) */
.fc .fc-col-header-cell-cushion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #666161ff;
  color: #cfcfcf !important;
  padding: 6px 12px;
  border-radius: 999px;
  margin: 4px 6px;
  font-weight: 600;
  font-size: 0.92rem;
}

/* Each day cell shows a rounded tile; remove internal gutter so tiles touch */
.fc-daygrid-day-frame { position: relative; padding: 0; }
.fc-daygrid-day-frame::before {
  content: '';
  position: absolute;
  /* expand slightly to cover tiny seams between adjacent cells */
  left: 0px;
  right: 0px;
  top: -1px;
  bottom: -1px;
  background: linear-gradient(180deg,  #696b6bff 0%, #696b6bff 100%); /* tile color gradient */
  border-radius: 12px;
  border: 1px solid rgba(206, 201, 201, 0.03); /* subtle gray shine border */
  box-shadow: 0 6px 16px rgba(0,0,0,0.55) inset, 0 4px 12px rgba(0,0,0,0.5);
  z-index: 0;
}

/* subtle top-left sheen to give glossy rounded look */
.fc-daygrid-day-frame::after {
  content: '';
  position: absolute;
  left: 14px;
  right: auto;
  top: 14px;
  height: 76%;
  width: calc(100% - 10px);
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.00));
  border-top-left-radius: 10px;
  border-bottom-right-radius: 18px;
  pointer-events: none;
  z-index: 1;
}

/* Contents above tile */
.fc-daygrid-day-number,
.fc-daygrid-day-events,
.fc-daygrid-day-top { position: relative; z-index: 2; }

/* Center day number inside small area at vertical center of tile */
.fc-daygrid-day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 6px auto 4px auto;
  font-size: 0.78rem;
  color: #cfcfcf !important;
}

/* Events remain as colored pills; tighten margins, padding and letter-spacing */
.fc-daygrid-event {
  margin: 0 !important; /* remove default small gaps */
  border-radius: 6px;
  padding: 1px 1px !important;
  font-size: 0.74rem;
  letter-spacing: -0.5px;
  line-height: 1rem;
  box-shadow: none !important;
}

/* ensure event title text is tighter */
.fc-daygrid-event .fc-event-title,
.fc-daygrid-dot-event .fc-event-title {
  letter-spacing: -0.5px;
  padding: 0;
  margin: 0;
}

/* small per-event indicator removed */

/* Remove cell borders entirely */
.fc-daygrid-body td { border: none !important; }

/* make toolbar title lighter */
.fc-toolbar-title { color: #e6e6e6 !important; }

/* Color picker styles (inlined) */
.color-picker { -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; width: 32px; height: 32px; border-radius: 50%; padding: 0; cursor: pointer; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: transform 0.15s, box-shadow 0.15s; }
.color-picker:hover { transform: scale(1.1); box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
.color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.color-picker::-webkit-color-swatch { border: none; border-radius: 50%; }
.color-picker::-moz-color-swatch { border: none; border-radius: 50%; }

/* Make event pills match the inner tile width and respect gutters */
.fc-daygrid-day .fc-daygrid-day-events {
  /* inset the event area from tile edges so pills line up with visual gutter */
  padding: 1px 1px 1px 1px; /* remove bottom padding so stacked items touch */
  display: block;
}
.fc-daygrid-day .fc-daygrid-day-events > * {
  display: block !important;
  /* limit width so pills don't overflow the rounded tile inset (0px left+right) */
  width: calc(100% - 2px) !important;
  max-width: calc(100% - 10px) !important;
  margin: 0 !important; /* remove vertical gap between stacked items */
  box-sizing: border-box !important;
  padding: 1px !important;
}
.fc-daygrid-day .fc-daygrid-event {
  /* tighten pill padding so it visually matches the tile and keep pill within width */
  padding: 1px 1px !important;
  border-radius: 8px;
  width: calc(100% - 8px) !important;
  max-width: calc(100% - 8px) !important;
  margin: 0 !important; /* ensure no gap */
}
.fc-daygrid-event .fc-event-main-frame,
.fc-daygrid-event .fc-event-title {
  width: 60% !important;
  box-sizing: border-box !important;
  display: block !important;
  text-align: center;
}

/* nudge day-number spacing slightly so events have more room */
.fc-daygrid-day-number { margin: 4px auto 6px auto; }
`

export default styles
