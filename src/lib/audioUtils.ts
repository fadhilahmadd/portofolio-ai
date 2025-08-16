/**
 * Converts a WebM Blob to a WAV Blob and resamples it to 16000 Hz.
 * @param webmBlob - The audio Blob in WebM format.
 * @returns A Promise that resolves with the audio Blob in WAV format at 16000 Hz.
 */
export const convertWebmToWav = (webmBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Resample the audio to 16000 Hz
        const targetSampleRate = 16000;
        const offlineContext = new OfflineAudioContext(
          originalAudioBuffer.numberOfChannels,
          (originalAudioBuffer.length * targetSampleRate) / originalAudioBuffer.sampleRate,
          targetSampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = originalAudioBuffer;
        source.connect(offlineContext.destination);
        source.start(0);

        const resampledAudioBuffer = await offlineContext.startRendering();
        const wavBlob = encodeWAV(resampledAudioBuffer);
        resolve(wavBlob);
      } catch (error) {
        console.error("Error processing audio:", error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(webmBlob);
  });
};

/**
 * Encodes an AudioBuffer into a WAV file Blob.
 * @param audioBuffer - The AudioBuffer to encode.
 * @returns A Blob representing the WAV file.
 */
const encodeWAV = (audioBuffer: AudioBuffer): Blob => {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];
  let i, sample;
  let offset = 0;
  let pos = 0;

  // Write WAV container
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // Write "fmt " chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // chunk size
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // Write "data" chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  // Write interleaved PCM samples
  for (i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([view], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};