#!/usr/bin/env python3
"""
Synthesize an original UI sound kit (no AI APIs).

Uses only the Python standard library + ffmpeg for AAC export.
Sounds are original DSP: sines, noise, envelopes, and pitch sweeps.
"""
from __future__ import annotations

import math
import random
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT  # writes full-volume-5db/ and low-volume-20db/ at repo root
SR = 44100  # sample rate

# Peak levels for the two volume tiers
FULL_PEAK = 10 ** (-5 / 20)   # ~0.562 (−5 dBFS peak target scale)
LOW_PEAK = 10 ** (-20 / 20)   # ~0.100 (−20 dBFS)


def clamp(x: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return lo if x < lo else hi if x > hi else x


def env_exp(t: float, attack: float, decay: float) -> float:
    """Simple attack + exponential decay envelope (t in seconds)."""
    if t < 0:
        return 0.0
    if t < attack:
        return t / attack if attack > 0 else 1.0
    return math.exp(-(t - attack) / max(decay, 1e-6))


def env_adsr(t: float, a: float, d: float, s: float, r: float, total: float) -> float:
    if t < 0 or t > total:
        return 0.0
    if t < a:
        return t / a if a > 0 else 1.0
    if t < a + d:
        return 1.0 - (1.0 - s) * ((t - a) / d if d > 0 else 1.0)
    sustain_end = total - r
    if t < sustain_end:
        return s
    if r <= 0:
        return 0.0
    return s * max(0.0, 1.0 - (t - sustain_end) / r)


def sine(t: float, freq: float, phase: float = 0.0) -> float:
    return math.sin(2 * math.pi * freq * t + phase)


def triangle(t: float, freq: float) -> float:
    # cheap triangle via asin of sine
    return (2 / math.pi) * math.asin(max(-1.0, min(1.0, sine(t, freq))))


def noise(rng: random.Random) -> float:
    return rng.uniform(-1.0, 1.0)


def mix_normalize(samples: list[float], peak: float) -> list[float]:
    m = max((abs(s) for s in samples), default=1.0)
    if m < 1e-9:
        return samples
    scale = peak / m
    return [clamp(s * scale) for s in samples]


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = b"".join(struct.pack("<h", int(clamp(s) * 32767)) for s in samples)
        w.writeframes(frames)


def wav_to_m4a(wav: Path, m4a: Path) -> None:
    m4a.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(wav),
            "-c:a", "aac", "-b:a", "128k",
            str(m4a),
        ],
        check=True,
    )


def render(duration: float, fn) -> list[float]:
    n = int(SR * duration)
    out = []
    for i in range(n):
        t = i / SR
        out.append(fn(t))
    # tiny fade in/out to avoid clicks
    fade = int(0.003 * SR)
    for i in range(min(fade, n)):
        out[i] *= i / fade
        out[n - 1 - i] *= i / fade
    return out


# --- sound designers -------------------------------------------------------

def make_button(variant: int) -> list[float]:
    rng = random.Random(100 + variant)
    # different character per variant
    base = 900 + variant * 110
    click_f = base + rng.randint(-40, 40)
    noise_amt = 0.15 + (variant % 3) * 0.05
    tone_amt = 0.75
    decay = 0.035 + (variant % 4) * 0.008
    duration = 0.09 + (variant % 3) * 0.01

    def fn(t: float) -> float:
        e = env_exp(t, 0.001, decay)
        tone = sine(t, click_f) * 0.7 + sine(t, click_f * 2.1) * 0.25
        n = noise(rng) * math.exp(-t / 0.012)
        return e * (tone_amt * tone + noise_amt * n)

    return render(duration, fn)


def make_tab(variant: int) -> list[float]:
    rng = random.Random(200 + variant)
    f1 = 600 + variant * 80
    f2 = f1 * 1.5
    duration = 0.1

    def fn(t: float) -> float:
        e = env_exp(t, 0.002, 0.05)
        return e * (0.55 * sine(t, f1) + 0.35 * sine(t, f2) + 0.1 * noise(rng) * math.exp(-t / 0.02))

    return render(duration, fn)


def make_expand() -> list[float]:
    duration = 0.18
    f0, f1 = 320, 720

    def fn(t: float) -> float:
        p = t / duration
        f = f0 + (f1 - f0) * p
        e = env_adsr(t, 0.008, 0.04, 0.55, 0.05, duration)
        return e * (0.7 * sine(t, f) + 0.3 * sine(t, f * 2))

    return render(duration, fn)


def make_collapse() -> list[float]:
    duration = 0.16
    f0, f1 = 680, 280

    def fn(t: float) -> float:
        p = t / duration
        f = f0 + (f1 - f0) * p
        e = env_adsr(t, 0.005, 0.03, 0.5, 0.05, duration)
        return e * (0.75 * sine(t, f) + 0.25 * triangle(t, f * 0.5))

    return render(duration, fn)


def make_complete(variant: int) -> list[float]:
    # short ascending arpeggio
    roots = [
        [523.25, 659.25, 783.99],   # C5 E5 G5
        [587.33, 739.99, 880.00],   # D5 F#5 A5
        [493.88, 622.25, 739.99],   # B4 D#5 F#5
    ]
    notes = roots[(variant - 1) % len(roots)]
    note_len = 0.09
    gap = 0.02
    duration = note_len * len(notes) + gap * (len(notes) - 1) + 0.08

    def fn(t: float) -> float:
        acc = 0.0
        for i, f in enumerate(notes):
            start = i * (note_len + gap)
            local = t - start
            if 0 <= local <= note_len + 0.05:
                e = env_exp(local, 0.004, 0.07)
                acc += e * (0.65 * sine(t, f) + 0.25 * sine(t, f * 2) + 0.1 * sine(t, f * 3))
        return acc

    return render(duration, fn)


def make_success(variant: int) -> list[float]:
    pairs = [
        (659.25, 880.00),    # E5 A5
        (698.46, 1046.50),   # F5 C6
        (783.99, 1174.66),   # G5 D6
    ]
    f1, f2 = pairs[(variant - 1) % len(pairs)]
    duration = 0.32

    def fn(t: float) -> float:
        # first note then second
        if t < 0.12:
            e = env_exp(t, 0.005, 0.09)
            return e * (0.7 * sine(t, f1) + 0.3 * sine(t, f1 * 2))
        local = t - 0.1
        e = env_exp(local, 0.005, 0.14)
        return e * (0.65 * sine(t, f2) + 0.25 * sine(t, f2 * 2) + 0.1 * sine(t, f2 * 3))

    return render(duration, fn)


def make_error(variant: int) -> list[float]:
    rng = random.Random(300 + variant)
    bases = [220, 196, 185, 247, 165]
    f = bases[(variant - 1) % len(bases)]
    duration = 0.22 + (variant % 3) * 0.03
    dissonance = 1.07 + (variant % 5) * 0.01

    def fn(t: float) -> float:
        e = env_exp(t, 0.003, 0.12 + variant * 0.01)
        buzz = sine(t, f) * 0.5 + sine(t, f * dissonance) * 0.4
        grit = noise(rng) * 0.15 * math.exp(-t / 0.04)
        # slight downward drop
        drop = sine(t, f * (1.0 - 0.15 * min(t / duration, 1.0)))
        return e * (0.55 * buzz + 0.35 * drop + grit)

    return render(duration, fn)


def make_cancel(variant: int) -> list[float]:
    f0 = 520 - variant * 40
    f1 = 320 - variant * 20
    duration = 0.14

    def fn(t: float) -> float:
        p = t / duration
        f = f0 + (f1 - f0) * p
        e = env_exp(t, 0.002, 0.07)
        return e * (0.8 * sine(t, f) + 0.2 * sine(t, f * 1.5))

    return render(duration, fn)


def make_alert(variant: int) -> list[float]:
    # two-beep attention pattern
    freqs = [880, 988, 1047, 784, 1175]
    f = freqs[(variant - 1) % len(freqs)]
    duration = 0.45

    def tone_at(t: float, start: float, length: float, freq: float) -> float:
        local = t - start
        if local < 0 or local > length:
            return 0.0
        e = env_adsr(local, 0.005, 0.02, 0.7, 0.04, length)
        return e * (0.7 * sine(t, freq) + 0.3 * sine(t, freq * 2))

    def fn(t: float) -> float:
        return tone_at(t, 0.0, 0.12, f) + tone_at(t, 0.16, 0.14, f * 1.25)

    return render(duration, fn)


def make_notification(variant: int) -> list[float]:
    # soft melodic pings — varied intervals
    scales = [
        [659.25, 830.61],
        [698.46, 880.00],
        [783.99, 987.77],
        [523.25, 783.99],
        [587.33, 880.00],
        [659.25, 987.77],
        [440.00, 659.25],
        [493.88, 739.99],
        [554.37, 830.61],
    ]
    a, b = scales[(variant - 1) % len(scales)]
    duration = 0.38 + (variant % 3) * 0.04

    def fn(t: float) -> float:
        if t < 0.14:
            e = env_exp(t, 0.006, 0.1)
            return e * (0.6 * sine(t, a) + 0.25 * sine(t, a * 2) + 0.15 * sine(t, a * 3))
        local = t - 0.12
        e = env_exp(local, 0.006, 0.16)
        return e * (0.55 * sine(t, b) + 0.3 * sine(t, b * 2) + 0.15 * sine(t, b * 1.5))

    return render(duration, fn)


def catalog() -> list[tuple[str, str, list[float]]]:
    """Return list of (category, filename_stem, samples at unit peak)."""
    items: list[tuple[str, str, list[float]]] = []
    cat = "buttons-and-navigation"
    for i in range(1, 8):
        items.append((cat, f"button-{i}", make_button(i)))
    for i in range(1, 4):
        items.append((cat, f"tab-{i}", make_tab(i)))
    items.append((cat, "expand", make_expand()))
    items.append((cat, "collapse", make_collapse()))

    cat = "complete-and-success"
    for i in range(1, 4):
        items.append((cat, f"complete-{i}", make_complete(i)))
    for i in range(1, 4):
        items.append((cat, f"success-{i}", make_success(i)))

    cat = "errors-and-cancel"
    for i in range(1, 6):
        items.append((cat, f"error-{i}", make_error(i)))
    for i in range(1, 3):
        items.append((cat, f"cancel-{i}", make_cancel(i)))

    cat = "notifications-and-alerts"
    for i in range(1, 6):
        items.append((cat, f"alert-{i}", make_alert(i)))
    for i in range(1, 10):
        items.append((cat, f"notification-{i}", make_notification(i)))

    return items


def main() -> None:
    items = catalog()
    assert len(items) == 39, len(items)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for volume, peak in (("full-volume-5db", FULL_PEAK), ("low-volume-20db", LOW_PEAK)):
            for category, stem, samples in items:
                leveled = mix_normalize(samples, peak)
                wav = tmp_path / f"{volume}_{category}_{stem}.wav"
                m4a = OUT / volume / category / f"{stem}.m4a"
                write_wav(wav, leveled)
                wav_to_m4a(wav, m4a)
                print(f"wrote {m4a.relative_to(ROOT)}")

    print(f"\nDone: {len(items) * 2} files (39 sounds × 2 volume tiers)")


if __name__ == "__main__":
    main()
