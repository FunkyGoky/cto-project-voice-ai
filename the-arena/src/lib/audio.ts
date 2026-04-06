// ============================================================
// Audio Utilities — Browser mic capture + playback
// Handles: getUserMedia, PCM16 encoding, AudioWorklet for
// capture, AudioContext for playback, waveform analysis.
// ============================================================

/**
 * Captures microphone audio and delivers PCM16 Int16Array chunks.
 * Uses ScriptProcessorNode (widely supported) for simplicity.
 * Target: 24kHz mono PCM16 for OpenAI, 16kHz for Gemini.
 */
export class MicCapture {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  /** Start capturing mic audio at the given sample rate */
  async start(
    targetSampleRate: number,
    onAudio: (pcm16: Int16Array) => void
  ): Promise<AnalyserNode> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: targetSampleRate,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.audioCtx = new AudioContext({ sampleRate: targetSampleRate });
    this.source = this.audioCtx.createMediaStreamSource(this.stream);

    // Analyser for waveform visualization
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.source.connect(this.analyser);

    // Processor: captures raw float32 audio, converts to PCM16
    const bufferSize = 4096;
    this.processor = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const float32 = e.inputBuffer.getChannelData(0);
      const pcm16 = float32ToPcm16(float32);
      onAudio(pcm16);
    };

    this.source.connect(this.processor);
    // ScriptProcessorNode must be connected to an output to fire onaudioprocess.
    // Use a zero-gain node instead of destination to avoid echoing mic audio to speakers.
    const silencer = this.audioCtx.createGain();
    silencer.gain.value = 0;
    this.processor.connect(silencer);
    silencer.connect(this.audioCtx.destination);

    return this.analyser;
  }

  /** Stop capturing and release mic */
  stop() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audioCtx?.close();
    this.processor = null;
    this.source = null;
    this.analyser = null;
    this.stream = null;
    this.audioCtx = null;
  }
}

/**
 * Plays back PCM16 audio chunks through the speakers.
 * Queues buffers and plays them sequentially to avoid gaps.
 */
export class AudioPlayer {
  private audioCtx: AudioContext;
  private nextPlayTime = 0;
  private sampleRate: number;

  constructor(sampleRate: number) {
    this.sampleRate = sampleRate;
    this.audioCtx = new AudioContext({ sampleRate });
  }

  /** Queue a PCM16 chunk for playback */
  play(pcm16: Int16Array) {
    const float32 = pcm16ToFloat32(pcm16);
    const buffer = this.audioCtx.createBuffer(1, float32.length, this.sampleRate);
    buffer.getChannelData(0).set(float32);

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;
    const startTime = Math.max(now, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;
  }

  /** Stop all playback and reset queue */
  flush() {
    this.nextPlayTime = 0;
  }

  /** Clean up audio context */
  close() {
    this.audioCtx.close();
  }
}

// ------------------------------------------------------------
// PCM Conversion Utilities
// ------------------------------------------------------------

/** Convert Float32 audio samples to PCM16 Int16Array */
function float32ToPcm16(float32: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm16;
}

/** Convert PCM16 Int16Array back to Float32 for playback */
function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}
