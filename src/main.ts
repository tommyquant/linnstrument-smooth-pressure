import { getMidiEvent } from "./midi";

loadAPI(17);
host.defineController("Roger Linn Design", "Linnstrument Smooth Pressure", "0.1", "8699ad07-78f6-4c8e-83c9-1c9f0dd62511", "tommyquant");
host.defineMidiPorts(1, 1);

function init() {
   const midiInPort = host.getMidiInPort(0);
   midiInPort.setMidiCallback((status: number, data1: number, data2: number) => {
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

