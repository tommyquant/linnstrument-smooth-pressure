import { clamp, lerp } from './base/math';

type Note = {
   /** Velocity of this note */
   velocity: number,
   /**
    * When a note is played, this will be its initial pressure value. 
    * For non-legato notes, this is set to velocity. 
    * For legato notes, this is set to the previous note's pressure value.
    */
   initialPressure: number,
   /**
    * The current pressure value. This is calculated by interpolating between `initialPressure` and the current Channel Pressure value.
    * For non-legato notes, the interpolation duration is 100ms.
    * For legato notes, the interpolation duration is 100-1000ms. Note velocity determines the speed of the interpolation.
    */
   pressure: number,
   /** Whether this note is a legato note. A note is considered legato if another note is still active when this note is played. */
   isLegato: boolean,
   /** Timestamp of when this note was played */
   timestamp: number,
};

const PRESSURE_CC = 1; // The CC# that Pressure will be mapped to
const NON_LEGATO_TRANSITION_MS = 100;
const LEGATO_TRANSITION_FAST_MS = 100;
const LEGATO_TRANSITION_SLOW_MS = 1000;
const notes = new Map<number, Note>(); // Key is channel number

function isNoteOff(status: number, data2: number) { return ((status & 0xF0) == 0x80) || ((status & 0xF0) == 0x90 && data2 == 0); }
function isNoteOn(status: number) { return (status & 0xF0) == 0x90; }
function isChannelPressure(status: number) { return (status & 0xF0) == 0xD0; }

function getLatestNote(): Note | undefined {
   if (notes.size === 0) {
      return undefined;
   }

   const sorted = Array.from(notes.values()).sort((a, b) => a.timestamp - b.timestamp);
   return sorted[sorted.length - 1];
}

function getHighestPressure(): number {
   if (notes.size === 0) {
      return 0;
   }

   let highest = 0;
   for (const note of notes.values()) {
      highest = Math.max(highest, note.pressure);
   }
   return highest;
}

export function getMidiEvent(status: number, data1: number, data2: number): {
   status: number,
   data1: number,
   data2: number,
} | undefined {
   const channel = status & 0xF;
   
   // Note On
   if (isNoteOn(status)) {
      const prev = getLatestNote();
      notes.set(channel, {
         velocity: data2,
         initialPressure: prev ? prev.pressure : data2,
         isLegato: prev ? true: false,
         pressure: 0,
         timestamp: Date.now(),
      });
      println(`NOTE ON! Note: ${data1}, Velocity: ${data2}`);
      return { status, data1, data2 };
   }
   
   // Note Off
   if (isNoteOff(status, data2)) {
      notes.delete(channel);
      println(`NOTE OFF! Note: ${data1}, Velocity: ${data2}`);
      return { status, data1, data2 };
      
   }
   
   // Channel Pressure
   if (isChannelPressure(status)) {
      const note = notes.get(channel);
      if (!note) {
         return;
      }

      const deltaTimeMs = Date.now() - note.timestamp;
      const transition = note.isLegato
         ? lerp(LEGATO_TRANSITION_SLOW_MS, LEGATO_TRANSITION_FAST_MS, note.velocity / 127)
         : NON_LEGATO_TRANSITION_MS;
      const a = note.initialPressure;
      const b = data1;
      const t = clamp(deltaTimeMs / transition, 0, 1);
      note.pressure = Math.trunc(lerp(a, b, t));
      if (note === getLatestNote()) {
         const pressure = getHighestPressure();
         println(`PRESSURE! Pressure: ${pressure}, Channel: ${channel}, Transition: ${transition}ms`);
         return { status: 0xB0, data1: PRESSURE_CC, data2: pressure };
      }
      
      return;
   }

   return { status, data1, data2 };
}
