// Local QA harness only. Measure the real post-compressor signal; never shipped
// by Next or injected into production. No microphone or production writes.
(() => {
  const NativeContext = window.AudioContext;
  const probes = new WeakMap(), connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (destination, ...args) {
    const probe = probes.get(this.context);
    if (probe && destination === this.context.destination && this !== probe.analyser) {
      connect.call(this, probe.analyser);
      return destination;
    }
    return connect.call(this, destination, ...args);
  };
  window.AudioContext = class extends NativeContext {
    constructor(...args) {
      super(...args);
      const analyser = this.createAnalyser(); analyser.fftSize = 2048;
      connect.call(analyser, this.destination);
      const probe = { analyser, phases: {}, decoded: 0 };
      probes.set(this, probe);
      const decode = this.decodeAudioData.bind(this);
      this.decodeAudioData = async (...data) => { const buffer = await decode(...data); probe.decoded++; return buffer; };
      const samples = new Float32Array(analyser.fftSize);
      const timer = setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        const phase = document.querySelector('.mine-world')?.dataset.phase || 'ready';
        const peak = Math.max(...samples.map(Math.abs));
        const rms = Math.sqrt(samples.reduce((sum, n) => sum + n * n, 0) / samples.length);
        const report = probe.phases[phase] ||= { samples: 0, peak: 0, rms: 0 };
        if (this.state === 'running') { report.samples++; report.peak = Math.max(report.peak, peak); report.rms = Math.max(report.rms, rms); }
        document.documentElement.dataset.audioReport = JSON.stringify({ state: this.state, decoded: probe.decoded, rms, peak, phases: probe.phases });
        if (this.state === 'closed') clearInterval(timer);
      }, 50);
    }
  };
})();
