#!/usr/bin/env python3
"""
Generates the demo audio loops shipped in /public/audio for the Berty player.

These are synthesised here on purpose: the tracks are *not* real releases and
are not downloaded from anywhere, so there is nothing to license and nothing
fabricated. They exist purely so playback, seeking, queueing and volume have
something real to act on.

Usage:  python3 scripts/generate-demo-audio.py
Output: public/audio/morning-static.wav
        public/audio/low-light.wav
        public/audio/slow-traffic.wav

Pure standard library -- no numpy, no ffmpeg.
"""

import math
import os
import random
import struct
import wave

SAMPLE_RATE = 22050
BIT_DEPTH = 16
CHANNELS = 1
DURATION = 20.0  # seconds; loops seamlessly (last chord tails wrap to the start)
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio")

NOTE = {
    "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
    "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11,
}


def freq(name):
    """'A3' -> 220.0 Hz, equal temperament, A4 = 440."""
    pitch, octave = name[:-1], int(name[-1])
    semitones = NOTE[pitch] + (octave - 4) * 12 - 9
    return 440.0 * (2 ** (semitones / 12.0))


class Voice:
    """A slowly swelling pad note: harmonic stack + gentle detune chorus."""

    def __init__(self, name, gain, attack=1.4, release=1.8, detune=0.0016):
        self.f0 = freq(name)
        self.gain = gain
        self.attack = attack
        self.release = release
        self.detune = detune
        self.partials = [(h, 1.0 / (h ** 1.65)) for h in range(1, 9)]

    def sample(self, t, local_t, span):
        if local_t < 0 or local_t > span:
            return 0.0
        # envelope: smooth attack, smooth release
        if local_t < self.attack:
            env = local_t / self.attack
            env = env * env * (3 - 2 * env)  # smoothstep
        else:
            remaining = span - local_t
            if remaining < self.release:
                env = max(0.0, remaining / self.release)
                env = env * env * (3 - 2 * env)
            else:
                env = 1.0

        # slow chorus movement
        drift = self.detune * math.sin(2 * math.pi * 0.07 * t + self.f0)
        value = 0.0
        for harmonic, amp in self.partials:
            f = self.f0 * harmonic * (1.0 + drift * harmonic * 0.35)
            value += amp * math.sin(2 * math.pi * f * t)
        return value * env * self.gain


class Pluck:
    """Short bell-ish arpeggio voice with exponential decay."""

    def __init__(self, name, gain, decay=1.5):
        self.f1 = freq(name)
        self.gain = gain
        self.decay = decay

    def sample(self, local_t):
        if local_t < 0:
            return 0.0
        env = math.exp(-local_t / self.decay)
        if local_t < 0.006:
            env *= local_t / 0.006
        value = (
            math.sin(2 * math.pi * self.f1 * local_t)
            + 0.34 * math.sin(2 * math.pi * self.f1 * 2 * local_t)
            + 0.12 * math.sin(2 * math.pi * self.f1 * 3 * local_t)
        )
        return value * env * self.gain


def one_pole_lowpass(samples, cutoff_hz):
    alpha = 1.0 - math.exp(-2.0 * math.pi * cutoff_hz / SAMPLE_RATE)
    out = []
    prev = 0.0
    for s in samples:
        prev += alpha * (s - prev)
        out.append(prev)
    return out


def render(chords, arp_notes=None, arp_step=0.625, pad_gain=0.22, air=0.006, cutoff=3400, seed=7):
    """Render one seamless loop. `chords` = list of [notes...], one per 5s slot."""
    rng = random.Random(seed)
    total = int(DURATION * SAMPLE_RATE)
    buffer = [0.0] * total
    slot = DURATION / len(chords)
    span = slot + slot * 0.3  # notes ring past their slot; tail wraps to the loop start

    for index, chord in enumerate(chords):
        start = index * slot
        for note_number, note in enumerate(chord):
            voice = Voice(note, pad_gain / (1 + note_number * 0.22))
            start_sample = int(start * SAMPLE_RATE)
            length = int(span * SAMPLE_RATE)
            for n in range(length):
                absolute = (start_sample + n) / SAMPLE_RATE
                if absolute >= DURATION:
                    absolute -= DURATION  # wrap: keeps the loop seam gapless
                buffer[int(absolute * SAMPLE_RATE) % total] += voice.sample(absolute, n / SAMPLE_RATE, span)

    if arp_notes:
        step_samples = int(arp_step * SAMPLE_RATE)
        position = 0
        counter = 0
        while position < total:
            note = arp_notes[counter % len(arp_notes)]
            voice = Pluck(note, 0.085 + rng.random() * 0.02)
            length = int(3.0 * SAMPLE_RATE)
            for n in range(length):
                idx = (position + n) % total
                buffer[idx] += voice.sample(n / SAMPLE_RATE)
            counter += 1
            position += step_samples

    if air > 0:
        lowpass_state = 0.0
        for i in range(total):
            lowpass_state += 0.02 * (rng.uniform(-1.0, 1.0) - lowpass_state)
            swell = 0.4 + 0.6 * (0.5 + 0.5 * math.sin(2 * math.pi * (i / SAMPLE_RATE) / 9.0))
            buffer[i] += lowpass_state * air * swell

    buffer = one_pole_lowpass(buffer, cutoff)
    return buffer


def write_wav(path, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    scale = 0.72 / peak
    frames = bytearray()
    for s in samples:
        value = int(max(-1.0, min(1.0, s * scale)) * 32767)
        frames += struct.pack("<h", value)
    with wave.open(path, "wb") as handle:
        handle.setnchannels(CHANNELS)
        handle.setsampwidth(BIT_DEPTH // 8)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(bytes(frames))
    return len(frames)


TRACKS = [
    (
        "morning-static.wav",
        dict(
            chords=[
                ["A2", "E4", "A4", "C5"],
                ["F2", "C4", "F4", "A4"],
                ["C3", "G4", "C5", "E5"],
                ["G2", "D4", "G4", "B4"],
            ],
            arp_notes=["A4", "C5", "E5", "C5"],
            arp_step=0.625,
            cutoff=3200,
            seed=11,
        ),
    ),
    (
        "low-light.wav",
        dict(
            chords=[
                ["D3", "A4", "D5", "F5"],
                ["B2", "F4", "B4", "D5"],
                ["G2", "D4", "G4", "B4"],
                ["A2", "E4", "A4", "C5"],
            ],
            arp_notes=["D5", "A4", "F5", "A4", "B4", "D5"],
            arp_step=0.5,
            cutoff=2400,
            pad_gain=0.24,
            air=0.009,
            seed=29,
        ),
    ),
    (
        "slow-traffic.wav",
        dict(
            chords=[
                ["E3", "B4", "E5", "G5"],
                ["C3", "G4", "C5", "E5"],
                ["A2", "E4", "A4", "C5"],
                ["B2", "F4", "B4", "D5"],
            ],
            arp_notes=["E5", "G5", "B4", "E5", "C5", "B4"],
            arp_step=0.75,
            cutoff=4000,
            pad_gain=0.2,
            air=0.004,
            seed=53,
        ),
    ),
]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for filename, options in TRACKS:
        path = os.path.normpath(os.path.join(OUT_DIR, filename))
        samples = render(**options)
        size = write_wav(path, samples)
        print(f"{path}  {size / 1024:.0f} KiB  ({DURATION:.0f}s @ {SAMPLE_RATE} Hz mono)")


if __name__ == "__main__":
    main()
