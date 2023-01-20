"use strict";

// src/base/math.ts
function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}
function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

// src/midi.ts
var NON_LEGATO_TRANSITION_MS = 100;
var LEGATO_TRANSITION_FAST_MS = 100;
var LEGATO_TRANSITION_SLOW_MS = 1e3;
var notes = /* @__PURE__ */ new Map();
function isNoteOff(status, data2) {
  return (status & 240) == 128 || (status & 240) == 144 && data2 == 0;
}
function isNoteOn(status) {
  return (status & 240) == 144;
}
function isChannelPressure(status) {
  return (status & 240) == 208;
}
function getLatestNote() {
  if (notes.size === 0) {
    return void 0;
  }
  const sorted = Array.from(notes.values()).sort((a, b) => a.timestamp - b.timestamp);
  return sorted[sorted.length - 1];
}
function getMidiEvent(status, data1, data2) {
  const channel = status & 15;
  if (isNoteOn(status)) {
    const prev = getLatestNote();
    notes.set(channel, {
      velocity: data2,
      initialDynamics: prev ? prev.dynamics : data2,
      isLegato: prev ? true : false,
      dynamics: 0,
      timestamp: Date.now()
    });
    println(`NOTE ON! Note: ${data1}, Velocity: ${data2}`);
    return { status, data1, data2 };
  }
  if (isNoteOff(status, data2)) {
    notes.delete(channel);
    println(`NOTE OFF! Note: ${data1}, Velocity: ${data2}`);
    return { status, data1, data2 };
  }
  if (isChannelPressure(status)) {
    const note = notes.get(channel);
    if (!note || note !== getLatestNote()) {
      return;
    }
    const deltaTimeMs = Date.now() - note.timestamp;
    const transition = note.isLegato ? lerp(LEGATO_TRANSITION_SLOW_MS, LEGATO_TRANSITION_FAST_MS, note.velocity / 127) : NON_LEGATO_TRANSITION_MS;
    const a = note.initialDynamics;
    const b = data1;
    const t = clamp(deltaTimeMs / transition, 0, 1);
    note.dynamics = Math.trunc(lerp(a, b, t));
    println(`PRESSURE! Pressure: ${note.dynamics}, Channel: ${channel}, Transition: ${transition}ms`);
    return { status: 176, data1: 1, data2: note.dynamics };
  }
  return { status, data1, data2 };
}

// src/main.ts
loadAPI(17);
host.defineController("Roger Linn Design", "Linnstrument Smooth Pressure", "0.1", "8699ad07-78f6-4c8e-83c9-1c9f0dd62511", "tommyquant");
host.defineMidiPorts(1, 1);
function init() {
  const midiInPort = host.getMidiInPort(0);
  midiInPort.setMidiCallback((status, data1, data2) => {
    const e = getMidiEvent(status, data1, data2);
    if (e) {
      noteInput.sendRawMidiEvent(e.status, e.data1, e.data2);
    }
  });
  const noteInput = midiInPort.createNoteInput("Notes", "1?????");
  noteInput.setShouldConsumeEvents(false);
  println("Linnstrument Smooth Pressure initialized!");
}
function flush() {
}
function exit() {
  println("Exit!");
}
