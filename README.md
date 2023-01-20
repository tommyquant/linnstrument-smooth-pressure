# Linnstrument Smooth Pressure

The Linnstrument allows each note to have its own pressure value which is particularly useful for controlling note dynamics. However, the issue is that pressure does not work well for instruments that require smooth dynamics such as wind and bowed instruments. This is because each note's pressure value always starts from 0 before ramping up, which causes the dynamics to jump around and makes it impossible to achieve legato notes. This would be similar to a wind player tonguing every note.

Linnstrument Smooth Pressure is a Bitwig Controller Script for the Linnstrument that aims to smooth out pressure values between notes.

## How it works

### Non-legato notes

For non-legato notes, velocity will be used as the initial pressure value. The script will then interpolate to the actual pressure value over 100ms.

### Legato notes

For legato notes, the previous note's pressure will be used as the initial pressure value. The script will then interpolate to the actual pressure value over 100-1000ms. Velocity determines the speed of the interpolation. The higher the velocity, the faster the interpolation.

### Highest pressure

If multiple notes are played, the script will look at the pressure of each note and use the highest pressure value.

## Installation

See https://www.bitwig.com/support/technical_support/how-do-i-add-a-controller-extension-or-script-17/.

Note that you'll need to put the Linnstrument into MPE mode. To do this quickly, you can go into **Per-Split Settings > MIDI Mode** and hold **ChPerNote** for a second.

By default, the script maps pressure to CC1. You can change the CC number by finding the `PRESSURE_CC` variable and setting it to your desired CC number.