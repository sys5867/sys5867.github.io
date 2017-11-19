function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

var Voice = function(context, frequency, amplitude, parameters, effect_node) {
	this.context = context;

	// oscillator
	// ~~~_osc, ~~~Gain
	this.saw_osc = context.createOscillator();
	this.saw_osc.onended = function(){
		this.voiceState = 0;
	}
	this.sawGain = context.createGain();

	this.square_osc = context.createOscillator();
	this.square_osc.onended = function(){
		this.voiceState = 0;
	}
	this.squareGain = context.createGain();

	this.sin_osc = context.createOscillator();
	this.sin_osc.onended = function(){
		this.voiceState = 0;
	}
	this.sinGain = context.createGain();

	this.triangle_osc = context.createOscillator();
	this.triangle_osc.onended = function(){
		this.voiceState = 0;
	}
	this.triangleGain = context.createGain();

	this.allInput = context.createGain();

	this.lfo_osc = context.createOscillator();
	this.lfo_osc.onended = function(){
		this.voiceState = 0;
	}
	this.lfo_gain = context.createGain();

	// filter 
	this.filter = context.createBiquadFilter();

	// amp envelope
	this.ampEnv = context.createGain();

	// distortion
	this.distNode = context.createWaveShaper();

	// connect
	this.saw_osc.connect(this.sawGain);
	this.square_osc.connect(this.squareGain);
	this.sin_osc.connect(this.sinGain);
	this.triangle_osc.connect(this.triangleGain);

	this.sawGain.connect(this.allInput);
	this.squareGain.connect(this.allInput);
	this.sinGain.connect(this.allInput);
	this.triangleGain.connect(this.allInput);

	this.allInput.connect(this.filter);
	this.lfo_osc.connect(this.lfo_gain);
	this.lfo_gain.connect(this.saw_osc.detune);
	this.lfo_gain.connect(this.square_osc.detune);
	this.lfo_gain.connect(this.sin_osc.detune);
	this.lfo_gain.connect(this.triangle_osc.detune);
	this.filter.connect(this.distNode);
	this.distNode.connect(this.ampEnv);

	//this.ampEnv.connect(context.destination);
	//this.output = this.ampEnv;
	this.ampEnv.connect(effect_node);

	// preset parameters
	this.saw_osc.frequency.value = frequency;
	this.square_osc.frequency.value = frequency;
	this.sin_osc.frequency.value = frequency;
	this.triangle_osc.frequency.value = frequency;

	this.sawLevel = parameters.sawLevel;
	this.squareLevel = parameters.squareLevel;
	this.sinLevel = parameters.sinLevel;
	this.triangleLevel = parameters.triangleLevel;

	this.sawGain.gain.value = this.sawLevel;
	this.squareGain.gain.value = this.squareLevel;
	this.sinGain.gain.value = this.sinLevel;
	this.triangleGain.gain.value = this.triangleLevel;
	this.allInput.gain.value = 0.25; // 1/4 for 4 osc

	this.lfoRate = parameters.lfoRate;
	this.lfoDepth = parameters.lfoDepth;

	this.filterCutoffFreq = parameters.filterCutoffFreq;
	this.filterQ = parameters.filterQ;
	this.filterEnvAttackTime = parameters.filterEnvAttackTime;
	this.filterEnvDecayTime = parameters.filterEnvDecayTime;
	this.filterEnvSustainLevel = parameters.filterEnvSustainLevel;
	this.filterEnvReleaseTime = parameters.filterEnvReleaseTime;

	this.ampEnvLevel = amplitude;
	this.ampEnvAttackTime = parameters.ampEnvAttackTime;
	this.ampEnvDecayTime = parameters.ampEnvDecayTime;
	this.ampEnvSustainLevel = parameters.ampEnvSustainLevel;
	this.ampEnvReleaseTime = parameters.ampEnvReleaseTime;

	this.saw_osc.type = 'sawtooth';
	this.square_osc.type = 'square';
	this.sin_osc.type = 'sine';
	this.triangle_osc.type = 'triangle';
	this.filter.type = 'lowpass';
	this.filter.frequency.value = this.filterCutoffFreq;

	this.ampEnv.gain.value = 0.5;

	this.distortionLevel = parameters.distortionLevel;
	this.distNode.curve = makeDistortionCurve(this.distortionLevel);
	this.distNode.oversample = '4x'

	this.voiceState = 0;	
};

Voice.prototype.on = function() {
	this.lfo_osc.frequency.value = this.lfoRate;
	this.lfo_gain.gain.value = this.lfoDepth;
	this.lfo_osc.start();
	this.saw_osc.start();
	this.square_osc.start();
	this.sin_osc.start();
	this.triangle_osc.start();
	this.triggerAmpEnvelope();
	this.triggerFilterEnvelope();

	this.voiceState = 1;
};

Voice.prototype.triggerFilterEnvelope = function() {
	var param = this.filter.frequency;
	var now = this.context.currentTime;

	param.cancelScheduledValues(now);

	// attack
	param.setValueAtTime(0, now);
	param.linearRampToValueAtTime(this.filterCutoffFreq, now + this.filterEnvAttackTime);

	// decay
	param.linearRampToValueAtTime(this.filterCutoffFreq*this.filterEnvSustainLevel, now + this.filterEnvAttackTime + this.filterEnvDecayTime);
}

Voice.prototype.triggerAmpEnvelope = function() {
	var param = this.ampEnv.gain;
	var now = this.context.currentTime;

	param.cancelScheduledValues(now);

	// attack
	param.setValueAtTime(0, now);
	param.linearRampToValueAtTime(this.ampEnvLevel, now + this.ampEnvAttackTime);

	// decay
	param.linearRampToValueAtTime(this.ampEnvLevel * this.ampEnvSustainLevel, now + this.ampEnvAttackTime + this.ampEnvDecayTime);
};

Voice.prototype.off = function() {
	var param = this.ampEnv.gain;
	var filter_param = this.filter.frequency;
	var now = this.context.currentTime;

	// Amp release
	param.cancelScheduledValues(now);
	param.setValueAtTime(param.value, now);
	param.linearRampToValueAtTime(0.001, now + this.ampEnvReleaseTime);
	this.saw_osc.stop(now + this.ampEnvReleaseTime);
	this.square_osc.stop(now + this.ampEnvReleaseTime);
	this.sin_osc.stop(now + this.ampEnvReleaseTime);
	this.triangle_osc.stop(now + this.ampEnvReleaseTime);
	this.lfo_osc.stop(now + this.ampEnvReleaseTime);

	// filter release
	filter_param.cancelScheduledValues(now);
	filter_param.setValueAtTime(filter_param.value, now);
	filter_param.exponentialRampToValueAtTime(0.001, now + this.filterEnvReleaseTime);
};


var Synth = function(context, parameters) {
	this.context = context;
	this.voices = {};
	this.parameters = parameters;
};

Synth.prototype.noteOn = function(midi_note_number, midi_note_velocity) {
	var frequency = this.midiNoteNumberToFrequency(midi_note_number);
	var amplitude = this.midiNoteVelocityToAmp(midi_note_velocity);

	this.voices[midi_note_number] = new Voice(this.context, frequency, amplitude, this.parameters, this.fx_input);
	this.voices[midi_note_number].on();
};

Synth.prototype.midiNoteNumberToFrequency = function(midi_note_number) {
	var f_ref = 440;
	var n_ref = 57;
	var a = Math.pow(2, 1/12);
	var n = midi_note_number - n_ref;
	var f = f_ref * Math.pow(a, n);

	return f;
};

Synth.prototype.midiNoteVelocityToAmp = function(midi_note_velocity) {

	var min_dB = -30.0;

	// velocity to dB
	var note_dB = midi_note_velocity/128.0*(-min_dB) + min_dB;

	// dB to velocity
	var velocity = Math.pow(10.0, note_dB/20.0);

	return velocity;

};


Synth.prototype.noteOff = function(midi_note_number) {
	this.voices[midi_note_number].off();
};


Synth.prototype.updateParams = function(params, value) {

	switch (params) {
		case 'sin':
			this.parameters.sinLevel = value;
			break;
		case 'square':
			this.parameters.squareLevel = value;
			break;
		case 'saw':
			this.parameters.sawLevel = value;
			break;
		case 'triangle':
			this.parameters.triangleLevel = value;
			break;
		case 'filter_freq': 
			this.parameters.filterCutoffFreq = value;
			break;		
		case 'amp_attack_time': 
			this.parameters.ampEnvAttackTime = value;
			break;		
		case 'amp_decay_time':
			this.parameters.ampEnvDecayTime = value;
			break;		
		case 'amp_sustain_level':
			this.parameters.ampEnvSustainLevel = value;
			break;		
		case 'amp_release_time':
			this.parameters.ampEnvReleaseTime = value;
			break;
		case 'lfo_rate':
			this.parameters.lfoRate = value;
			break;
		case 'lfo_depth':
			this.parameters.lfoDepth = value;
			break;
		case 'filter_freq':
			this.parameters.filterCutoffFreq = value;
			break;
		case 'filter_env_attack':
			this.parameters.filterEnvAttackTime = value;
			break;
		case 'filter_env_decay':
			this.parameters.filterEnvDecayTime = value;
			break;
		case 'filter_env_sustain':
			this.parameters.filterEnvSustainLevel = value;
			break;
		case 'filter_env_relase':
			this.parameters.filterEnvReleaseTime = value;
			break;
		case 'distortion':
			this.parameters.distortionLevel =  value;
			break;
	}
}

Synth.prototype.connect = function(node) {
	this.fx_input = node.input;
}

