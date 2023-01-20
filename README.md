# Linnstrument Smooth Pressure

The Linnstrument allows each note to have its own pressure value which is particularly useful for controlling note dynamics. However, the issue is that pressure does not work well for instruments that require smooth dynamics such as wind and bowed instruments. This is because each note's pressure value always starts from 0 before ramping up, which causes the dynamics to jump around and makes it impossible to achieve legato notes. This would be similar to a wind player tonguing every note.

Linnstrument Smooth Pressure is a Bitwig Controller Script for the Linnstrument that aims to smooth out pressure values between notes.

## How it works

### Non-legato notes

For non-legato notes, velocity will be used as the initial pressure value. The script will then interpolate to the actual pressure value over 100ms.

### Legato notes

For legato notes, the previous note's pressure will be used as the initial pressure value. The script will then interpolate to the actual pressure value over 100-1000ms. Velocity determines the speed of the interpolation. The higher the velocity, the faster the interpolation.

## Installation

See https://www.bitwig.com/support/technical_support/how-do-i-add-a-controller-extension-or-script-17/.

Note that you'll need to put the Linnstrument into MPE mode. To do this quickly, you can go into **Per-Split Settings > MIDI Mode** and hold **ChPerNote** for a second.

## Known issues

- When playing two notes sequentially and then releasing the second note, pressure does not interpolate smoothly. This issue makes it difficult to play trills.