// Schedule.styles.ts
// This file contains the global CSS used by the Schedule component.
// It is intentionally a string exported as default so the component can
// inject it via styled-jsx's global scope: <style jsx global>{styles}</style>
//
// Comments inside the CSS explain which UI parts each selector affects.

const styles = `
/*
  Global CSS for Schedule component
*/

.fc-popover {
  background: transparent !important; /* underlying bg removed; body/list provide visuals */
  border: none !important;
  box-shadow: none !important;
  border-radius: 10px !important;
  overflow: hidden !important;
}
.fc-popover .fc-popover-body {
  padding: 0 !important; /* remove gap between header and list */
  background: transparent !important;
}
.fc-popover .fc-popover-header,
.fc-popover .fc-popover-title {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important; /* center the number */
  position: relative !important; /* allow shimmer pseudo-element */
  color: #e6e6e6 !important;
  font-weight: 700 !important;
  font-size: 1.2rem !important;
  padding: 10px 12px !important;
  margin: 0 !important; /* remove gap between number and tasks */
  text-align: center !important;
  background: linear-gradient(180deg, #252525, #1a1a1a) !important; /* header bg */
}
.fc-popover .fc-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important; /* larger gap between tasks */
  margin: 0 !important;
  padding: 10px !important; /* inner padding so items don't touch popover edges */
  background: linear-gradient(180deg, #252525, #1a1a1a) !important; /* make list share header bg */
}
.fc-popover .fc-list-item {
  /* full-bleed rectangle background matching header */
  background: transparent !important; /* list provides bg; items are transparent rectangles */
  border-radius: 0 !important; /* full rectangle */
  padding: 8px 12px !important;
  cursor: pointer !important; /* hand pointer */
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}
.fc-popover .fc-list-item + .fc-list-item {
  margin-top: 0 !important; /* gaps handled by .fc-list gap */
}

/* Shimmer overlay for popover header - attach animated gradient to header */
.fc-popover .fc-popover-header::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.06;
  
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: shineMove 4s linear infinite;
}

@keyframes shineMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.fc {
  background: transparent;
}

/* Visible red border around the whole calendar container */
.calendar-shell {
  position: relative;
  border-radius: 4px;
  border: 1px solid  rgba(255, 0, 51, 0.9); /* thinner red border */
  box-shadow: 0 2px 0px  rgba(255, 0, 51, 0.7), 0 0 12px  rgba(255, 0, 51, 0.5) inset;
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
  padding: 5px 14px;
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

/* Make calendar event tiles show pointer cursor and a subtle hover lift */
.fc-daygrid-event,
.fc-daygrid-event .fc-event-main-frame,
.fc-daygrid-event .fc-event-title,
.fc-event,
.fc-list-event {
  cursor: pointer !important;
  transition: transform 0.08s ease, box-shadow 0.12s ease !important;
}
.fc-daygrid-event:hover,
.fc-daygrid-event:focus,
.fc-event:hover {
  transform: translateY(-2px) !important;
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

/*
  Native FullCalendar "+N more" popover styling

  Center the numeric day header, remove the gap between header and tasks,
  increase gap between tasks, and make each task a full-bleed rectangle
  with the same background as the header so the popover reads as a single
  card. Rounded corners are applied to the outer popover and the last
  item to create a single-card appearance.
*/
.fc-popover {
  background: transparent !important;
  border: none !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;
  border-radius: 10px !important;
  overflow: hidden !important;
}
.fc-popover .fc-popover-body {
  padding: 0 !important; /* remove gap between header and list */
}
.fc-popover .fc-popover-header,
.fc-popover .fc-popover-title {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important; /* center the number */
  color: #e6e6e6 !important;
  font-weight: 700 !important;
  font-size: 1.2rem !important;
  padding: 10px 12px !important;
  margin: 0 !important; /* remove gap between number and tasks */
  text-align: center !important;
  background: linear-gradient(180deg, #252525, #1a1a1a) !important; /* header bg */
}

/* Position the popover close "X" at the top-right corner */
.fc-popover .fc-popover-close,
.fc-popover .fc-close,
.fc-popover .fc-close-btn,
.fc-popover .fc-button.fc-button-close,
.fc-popover .fc-popover .fc-close {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  left: auto !important;
  transform: none !important;
  margin: 0 !important;
  padding: 4px 6px !important;
  background: transparent !important;
  color: #cfcfcf !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  z-index: 60 !important;
}
.fc-popover .fc-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important; /* larger gap between tasks */
  margin: 0 !important;
  padding: 10px !important; /* inner padding so items don't touch popover edges */
  background: linear-gradient(180deg, #252525, #1a1a1a) !important; /* share header bg */
}
.fc-popover .fc-list-item {
  /* each task is a full rectangle matching the popover background */
  background: linear-gradient(180deg, #252525, #1a1a1a) !important;
  border-radius: 6px !important;
  padding: 8px 12px !important;
  cursor: pointer !important; /* hand pointer */
  transition: transform 0.12s ease, box-shadow 0.12s ease !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}
.fc-popover .fc-list-item:hover,
.fc-popover .fc-list-item:focus {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px rgba(0,0,0,0.6) !important;
}
.fc-popover .fc-list-item .fc-list-item-main {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
}
.fc-popover .fc-list-item .fc-list-item-title {
  flex: 1 1 auto !important;
  text-align: left !important;
  font-weight: 600 !important;
  color: #e6e6e6 !important;
  font-size: 0.92rem !important;
}
.fc-popover .fc-list-item .fc-list-item-time {
  flex: 0 0 auto !important;
  color: #cfcfcf !important;
  font-size: 0.85rem !important;
}

/* If FullCalendar adds a color indicator as an inline element, make sure
   the main tile background still looks good by making that indicator small */
.fc-popover .fc-list-item .fc-event-dot,
.fc-popover .fc-list-item .fc-list-event-dot {
  width: 8px !important;
  height: 8px !important;
  margin-right: 8px !important;
}

/* round bottom corners on the last item so the popover looks like a single card */
.fc-popover .fc-list-item:last-child {
  border-bottom-left-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
}

/*
  Adjust FullCalendar "more" link appearance across views:
  - hide the leading "+" character visually (keeps DOM text unchanged)
  - center the link in the day cell
  - use a muted gray text color
  - force block layout and remove floats from FC defaults
*/
.fc-daygrid-more-link,
.fc-timegrid-more-link,
.fc-more-link {
  display: block !important;
  float: none !important; /* override FC float:left / right */
  text-align: center !important;
  margin: 6px auto 0 !important;
  color: #9ca3af !important; /* muted gray */
  font-weight: 600 !important;
  background: transparent !important; /* remove any bg added by FC */
  padding: 0 !important;
}

/* hide the leading plus sign while leaving the number and text visible */
.fc-daygrid-more-link::first-letter,
.fc-timegrid-more-link::first-letter,
.fc-more-link::first-letter {
  color: transparent !important;
}

/* also ensure inner link content is centered */
.fc-daygrid-more-link-inner,
.fc-timegrid-more-link-inner {
  display: inline-block !important;
  text-align: center !important;
  width: 100% !important;
  color: inherit !important;
}
`

export default styles
