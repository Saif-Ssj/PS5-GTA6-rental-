// ---------- 1. Read the data Django put into the page ----------
const dayStatus = JSON.parse(document.getElementById("day-status").textContent);
const pendingDays = new Set(dayStatus.pending);
const approvedDays = new Set(dayStatus.approved);
const MAX_DAYS = dayStatus.max_days;

const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const today = new Date();
today.setHours(0, 0, 0, 0);

// Which month is on screen right now (JavaScript months: 0 = January)
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();

// The user's selection                                              // NEW
let startKey = null;                                                 // NEW
let endKey = null;                                                   // NEW

// ---------- 2. Small helpers ----------

// Date → "2026-11-18"
function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "2026-11-18" → Date                                               // NEW
function fromKey(key) {                                              // NEW
  const [y, m, d] = key.split("-").map(Number);                      // NEW
  return new Date(y, m - 1, d);                                      // NEW
}                                                                    // NEW

// Number of days from a to b, both included                        // NEW
function daysBetween(aKey, bKey) {                                   // NEW
  return Math.round((fromKey(bKey) - fromKey(aKey)) / 86400000) + 1; // NEW
}                                                                    // NEW

// Does any day from aKey to bKey appear in daySet?                  // NEW
function rangeContains(aKey, bKey, daySet) {                         // NEW
  const day = fromKey(aKey);                                         // NEW
  const end = fromKey(bKey);                                         // NEW
  while (day <= end) {                                               // NEW
    if (daySet.has(toKey(day))) return true;                         // NEW
    day.setDate(day.getDate() + 1);                                  // NEW
  }                                                                  // NEW
  return false;                                                      // NEW
}                                                                    // NEW

function getStatus(date) {
  if (date < today) return "past";
  const key = toKey(date);
  if (approvedDays.has(key)) return "booked";
  if (pendingDays.has(key)) return "pending";
  return "free";
}

const STATUS_STYLES = {
  past:    "text-neutral-600",
  free:    "ring-2 ring-emerald-400 text-white hover:bg-emerald-400/20 cursor-pointer",
  pending: "ring-2 ring-amber-400 text-white hover:bg-amber-400/20 cursor-pointer",
  booked:  "ring-2 ring-red-500 text-neutral-500 cursor-not-allowed",
};

function monthOptions() {
  return MONTHS.map((name, i) =>
    `<option value="${i}" ${i === viewMonth ? "selected" : ""}>${name}</option>`
  ).join("");
}

function yearOptions() {
  let options = "";
  for (let y = today.getFullYear(); y <= today.getFullYear() + 2; y++) {
    options += `<option value="${y}" ${y === viewYear ? "selected" : ""}>${y}</option>`;
  }
  return options;
}

// ---------- 3. Draw the calendar ----------
function renderCalendar() {
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const emptyCells = (firstDay.getDay() + 6) % 7;   // Monday-first grid

  let html = `
    <div class="flex items-center justify-between gap-2 mb-4">
      <button id="prev-month" class="w-9 h-9 rounded-lg bg-[#2d273c] text-[#00eefc] text-xl">‹</button>
      <div class="flex gap-2">
        <select id="month-select" class="bg-[#221c31] text-white font-mono text-xs rounded-lg px-2 py-1.5 border border-purple-500/30">${monthOptions()}</select>
        <select id="year-select" class="bg-[#221c31] text-white font-mono text-xs rounded-lg px-2 py-1.5 border border-purple-500/30">${yearOptions()}</select>
      </div>
      <button id="next-month" class="w-9 h-9 rounded-lg bg-[#2d273c] text-[#00eefc] text-xl">›</button>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center font-mono text-[10px] text-neutral-400 mb-2">
      ${WEEKDAYS.map(d => `<div>${d}</div>`).join("")}
    </div>

    <div class="grid grid-cols-7 gap-2 text-center font-mono text-sm">
  `;

  for (let i = 0; i < emptyCells; i++) {
    html += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day);
    const key = toKey(date);
    const status = getStatus(date);

    // Highlight the selected range                                  // NEW
    let selected = "";                                               // NEW
    if (key === startKey || key === endKey) {                        // NEW
      selected = "!bg-purple-600 !text-white";                       // NEW
    } else if (startKey && endKey && key > startKey && key < endKey) { // NEW
      selected = "bg-purple-600/30";                                 // NEW
    }                                                                // NEW

    html += `<div data-date="${key}" class="aspect-square flex items-center justify-center rounded-full ${STATUS_STYLES[status]} ${selected}">${day}</div>`;
  }

  html += `</div>`;
  document.getElementById("calendar").innerHTML = html;

  // Make the buttons and dropdowns work
  document.getElementById("prev-month").onclick = () => changeMonth(-1);
  document.getElementById("next-month").onclick = () => changeMonth(1);
  document.getElementById("month-select").onchange = (e) => { viewMonth = Number(e.target.value); renderCalendar(); };
  document.getElementById("year-select").onchange = (e) => { viewYear = Number(e.target.value); renderCalendar(); };

  // Make each day clickable                                         // NEW
  document.querySelectorAll("#calendar [data-date]").forEach(cell => { // NEW
    cell.onclick = () => handleDayClick(cell.dataset.date);          // NEW
  });                                                                // NEW
}

// ---------- 4. Move between months ----------
function changeMonth(step) {
  let m = viewMonth + step;
  let y = viewYear;
  if (m < 0)  { m = 11; y--; }
  if (m > 11) { m = 0;  y++; }

  const beforeThisMonth = y < today.getFullYear() || (y === today.getFullYear() && m < today.getMonth());
  const tooFarAhead = y > today.getFullYear() + 2;
  if (beforeThisMonth || tooFarAhead) return;

  viewMonth = m;
  viewYear = y;
  renderCalendar();
}

// ---------- 5. Clicking days ----------                             // NEW
function showMessage(text, type) {
  const el = document.getElementById("selection-message");
  el.textContent = text;
  el.className = type === "error" ? "text-red-400" : "text-amber-300";
}

function handleDayClick(key) {
  const status = getStatus(fromKey(key));
  if (status === "past" || status === "booked") return;

  showMessage("");

  if (!startKey || endKey || key < startKey) {
    // Start a new selection
    startKey = key;
    endKey = null;
  } else if (daysBetween(startKey, key) > MAX_DAYS) {
    showMessage(`You can rent for ${MAX_DAYS} days maximum.`, "error");
  } else if (rangeContains(startKey, key, approvedDays)) {
    showMessage("This range includes booked days. Pick another end date.", "error");
  } else {
    endKey = key;
    if (rangeContains(startKey, endKey, pendingDays)) {
      showMessage("Some of these days are already requested by someone else. The owner will decide.", "warning");
    }
  }

  renderCalendar();
  updateSummary();
}

// ---------- 6. Summary and live price ----------                   // NEW
async function updateSummary() {
  const datesEl = document.getElementById("selected-dates");
  const daysEl = document.getElementById("selected-days");
  const priceEl = document.getElementById("price");

  if (!startKey || !endKey) {
    datesEl.textContent = startKey ? `${startKey} → pick an end date` : "Pick a start date";
    daysEl.textContent = "–";
    priceEl.textContent = "–";
    return;
  }

  const days = daysBetween(startKey, endKey);
  datesEl.textContent = `${startKey} → ${endKey}`;
  daysEl.textContent = days;

  const controller = document.getElementById("extra-controller").checked ? 1 : 0;
  const screen = document.getElementById("extra-screen").checked ? 1 : 0;

  priceEl.textContent = "…";
  const response = await fetch(`/api/price/?days=${days}&controller=${controller}&screen=${screen}`);
  const data = await response.json();
  priceEl.textContent = response.ok ? `${data.price} €` : "Error";
}

document.getElementById("extra-controller").onchange = updateSummary;
document.getElementById("extra-screen").onchange = updateSummary;

// ---------- 7. Start ----------
renderCalendar();
updateSummary();