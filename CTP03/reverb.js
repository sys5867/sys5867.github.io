var Reverb = function(context, parameters) {
	this.context = context;
	this.input = context.createGain();

	this.convolver = context.createConvolver();
	this.wetGain = context.createGain();
	this.dryGain = context.createGain();

	// dry connect
	this.input.connect(this.dryGain);
	this.dryGain.connect(this.context.destination);

	// wet connect
	this.input.connect(this.wetGain);
	this.wetGain.connect(this.convolver);
	this.convolver.connect(this.context.destination);

	// load convolver file
	var myBuffer;
	var that = this;

	ajaxRequest = new XMLHttpRequest();
	ajaxRequest.open('GET', 'IR.wav', true);
	ajaxRequest.responseType = 'arraybuffer';

	ajaxRequest.onload = function() {
  		var audioData = ajaxRequest.response;
  		context.decodeAudioData(audioData, function(buffer) {
  			var numOfChannels = buffer.numberOfChannels;
  			var length = buffer.length
  			var sampleRate = buffer.sampleRate;
  			myBuffer = context.createBuffer(numOfChannels, length, sampleRate);
  			console.log("1" + myBuffer)
  			for(var i = 0; i < numOfChannels; i++){
  				var nowMyBuffer = myBuffer.getChannelData(i);
  				var nowBuffer = buffer.getChannelData(i);
  				for(var j = 0; j < length; j++){
  					nowMyBuffer[j] = nowBuffer[j];
  				}
  			}
  			that.convolver.buffer = myBuffer;
    	}, function(e){"Error with decoding audio data" + e.err});
	}

	ajaxRequest.send();

	// gain value of wet and dry
	this.wetGain.gain.value = parameters.reverbWet;
	this.dryGain.gain.value = (1-parameters.reverbWet);

	this.parameters = parameters;
}


Reverb.prototype.updateParams = function (params, value) {

	switch (params) {
		case 'reverb_wet': 
			this.wetGain.gain.value = value;
			break;		

	}
}