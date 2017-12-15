// some variables
var sampleBufferArray = {}
var BPM = 150;
var step_per_bar = 16;
var sec_per_step = 60 / (step_per_bar * BPM / 4.0)
var interval_list = []

//for multiple browser support
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

// functions regarding file and buffer directly
function loadSample(url, bufferid) { // the url can be full path or relative
  console.log("try getting " + url);
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      sampleBufferArray[bufferid] = buffer;
    });
  }
  request.send();
}

function playSound(buffername) {
  // creates a sound source from buffer just loaded
  var source = context.createBufferSource();
  source.buffer = sampleBufferArray[buffername];                   
  source.connect(context.destination);     
  source.start(0);             
}

function play_sequence(seq, barlength){
  var i = 0;
  var interval = new Nexus.Interval(sec_per_step * 1000, function(){
    // according to seq i, play or not
    if(seq[i] != '') playSound(seq[i]);
    // update i
    i = (i + 1) % (step_per_bar*barlength);
  })
  return interval
}

function start_sequence(){
  document.getElementById("sequence_stop").disabled = false; 
  document.getElementById("sequence_start").disabled = true;
  for(var i = 0; i < interval_list.length; i++){
    interval_list[i].start();
  }
}

function stop_sequence(){
  document.getElementById("sequence_stop").disabled = true; 
  document.getElementById("sequence_start").disabled = false;
  for(var i = 0; i < interval_list.length; i++){
    interval_list[i].stop();
  }
}

function clear_sequence(){
  document.getElementById("sequence_stop").disabled = true; 
  document.getElementById("sequence_start").disabled = false;
  interval_list = [];
}

window.onload = function(){
  // load the samples
  load_list = ["kick", "snare", "hat"];
  load_piano = "C3 D3 Ds3 E3 F3 Fs3 G3 A3 As3 B3 C4 D4 Ds4 E4 F4 Fs4 G4 A4 As4 B4 C5 D5 Ds5 E5 F5 Fs5 G5 A5 As5 B5 C6".split(" ");
  for(var i = 0; i < load_list.length; i++){
    loadSample("samples/" + load_list[i] + ".wav", load_list[i]);
  }
  for(var i = 0; i < load_piano.length; i++){
    loadSample("samples/piano/" + load_piano[i] + ".wav", load_piano[i]);
  }
  // something to do with sequencer
  // testing kick seq
  /*
  var kick_seq = ['kick','','','','kick','','','','kick','','kick','','kick','','','',];
  interval_list[0] = play_sequence(kick_seq, 1);
  var snare_seq = ['','','','','snare','','','','','','','','snare','','',''];
  interval_list[1] = play_sequence(snare_seq, 1);
  var hat_seq = ['hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat',''];
  interval_list[2] = play_sequence(hat_seq, 1)
  */
}

