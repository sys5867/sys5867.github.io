function getRandomInt(min, max) {
    return (Math.floor(Math.random() * (max - min) + min));
}

var melodyFreqValue = 3
var bassFreqValue = 1
var chordFreqValue = 1;

function bpm_onclick(){
  str = document.getElementById("bpmform").value
  var newbpm = 150;
  if(str == ""){

  }
  else{
  	if(!isNaN(str))
  		newbpm = parseInt(str)
  	else newbpm = 150;
  }
  BPM = newbpm;
	step_per_bar = 16;
	sec_per_step = 60 / (step_per_bar * BPM / 4.0)
}

function melody_onclick(i){
	melodyFreqValue = i;
}

function bass_onclick(i){
	bassFreqValue = i;
}

function chord_onclick(i){
	chordFreqValue = i;
}

function button_onclick(){
	stop_sequence();
	clear_sequence();
	var content = document.getElementById("input_text").value;
	content = content.replace(/[^a-zA-Z \n]/g, '')
	// split content into list of word list
	var lines = text_to_line_list(content);
	for(var i = 0; i < lines.length; i++){
		lines[i] = line_to_word_list(lines[i]);
	}

	// remove empty line from lines


	// info_lines[i][j] contains info about ith line jth word
	// info : cons0, vow, cons1, is_upper, num_cons, num_vow
	var info_lines = new Array();
	for(var i = 0; i < lines.length; i++){
		var info_words = new Array();
		for(var j = 0; j < lines[i].length; j++){
			info_words[j] = parse_word(lines[i][j]);
		}
		info_lines[i] = info_words;
	}

	// make kick seq from first line
	var kick_seq = make_kick_seq(info_lines[Math.min(0, info_lines.length-1)]);
	interval_list.push(play_sequence(kick_seq, 2));
	// make snare seq
	var snare_seq = make_snare_seq();
	interval_list.push(play_sequence(snare_seq, 2));
	// make hat seq from second line
	var hat_seq = make_hat_seq(info_lines[Math.min(1, info_lines.length-1)]);
	interval_list.push(play_sequence(hat_seq, 2));
	// make piano bass seq from third line
	var bass_seq = make_bass_seq(info_lines[Math.min(2, info_lines.length-1)]);
	interval_list.push(play_sequence(bass_seq, 4));
	// make piano melody seq from fourth line
	var melody_seq = make_melody_seq(info_lines[Math.min(3, info_lines.length-1)]);
	interval_list.push(play_sequence(melody_seq, Math.floor(melody_seq.length/16)));
}

// makes 2-bar kick sequence
function make_kick_seq(info_words){
	var num_words = info_words.length;
	if(num_words < 8){
		return ['kick','','','','kick','','','','kick','','','','kick','','','','kick','','','','kick','','','','kick','','','','kick','','',''];
	}
	var kick_seq = []
	var pn = Math.floor(num_words/8);
	for(var i = 0; i < pn * 8; i += pn){
		if(info_words[i]["cons0"] == "") kick_seq.push("");
		else kick_seq.push("kick");
		for(var j = 1; j < 4; j++) kick_seq.push("");
	}
	
	return kick_seq
}

// makes 2-bar hat sequence
function make_hat_seq(info_words){
	var num_words = info_words.length;
	if(num_words < 8){
		return ['hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat','','hat',''];
	}
	var hat_seq = []
	var pn = Math.floor(num_words/8);
	for(var i = 0; i < pn * 8; i += pn){
		if(info_words[i]["cons1"].length >= 3) hat_seq.push("hat");
		else hat_seq.push("");
		for(var j = 1; j < 4; j++) hat_seq.push("");
	}
	
	return hat_seq
}

// make 2-bar snare sequence, which seems very obvious
function make_snare_seq(){
	return ['','','','','','','','','snare','','','','','','','','','','','','','','','','snare','','','','','','',''];
}

// will 2-bar bass sequence of piano
// try fix chord, Dm7 - G7 - CM7 - FM7
function make_bass_seq(info_words){
	var Dchord = ['D3', 'F3', 'A3'];
	var Gchord = ['G3', 'B3', 'D3'];
	var Cchord = ['C3', 'E3', 'G3'];
	var Fchord = ['F3', 'A3', 'C3'];
	var chords = [Dchord, Gchord, Cchord, Fchord];

	var total_seq = []

	for(var k = 0; k < 4; k++){
		if (bassFreqValue == 1){
			total_seq.push(chords[k][0]);
			for(var j = 1; j < 16; j ++) total_seq.push("");
		}
		if (bassFreqValue == 2){
			total_seq.push(chords[k][0]);
			for(var j = 1; j < 8; j ++) total_seq.push("");
			total_seq.push(chords[k][1]);
			for(var j = 1; j < 8; j ++) total_seq.push("");
		}
		if (bassFreqValue == 4){
			total_seq.push(chords[k][0]);
			for(var j = 1; j < 4; j ++) total_seq.push("");
			total_seq.push(chords[k][1]);
			for(var j = 1; j < 4; j ++) total_seq.push("");
			total_seq.push(chords[k][2]);
			for(var j = 1; j < 4; j ++) total_seq.push("");
			total_seq.push(chords[k][1]);
			for(var j = 1; j < 4; j ++) total_seq.push("");
		}
	}

	return total_seq;
}


function make_melody_seq(info_words){
	var num_words = info_words.length;
	var pn = Math.floor(num_words/8);
	var melody_seq = []
	var pianoset = "C4 D4 Ds4 E4 F4 Fs4 G4 A4 As4 B4 C5 D5 Ds5 E5 F5 Fs5 G5 A5 As5 B5 C6".split(" ");
	var pianopos = 10;

	var Dm7_set = "D4 F4 A4 C5 D5 F5 A5".split(" ");
	var G7_set = "D4 G4 B4 D5 F5 G5 B6".split(" ");
	var CM7_set = "C4 E4 G4 B4 C5 E5 G5".split(" ");
	var FM7_set = "C4 F4 A4 C5 F5 A5 C6".split(" ");
	var chord_set = [Dm7_set, G7_set, CM7_set, FM7_set];

	for(var k = 0; k < 4; k++){
	for(var i = 0; i < pn*8; i += pn){
		var vow = info_words[i]['vow0'];
		var cons0 = info_words[i]['cons0'];
		var cons1 = info_words[i]['cons1'];
		var is_upper = info_words[i]['is_upper'];
		var num_cons = info_words[i]['num_cons'];
		var num_vow = info_words[i]['num_vow'];

		// by vow, shift piano position
		var fvow = vow[0].toLowerCase()
		if(fvow == 'a'){
			// for dynamic in melody, when a get, shift to random 
			pianopos += getRandomInt(-5, 5);
		}
		else if (cons0.length < 2){
			// when cons is short enough, go up
			pianopos += getRandomInt(-2, 4);
		}
		else{
			// else, go down
			pianopos += getRandomInt(-4, 2);
		}
		// if i is 4k, which is for strong beat, try to match to chord tone
		if(i % chordFreqValue == 0){
			while(chord_set[k].indexOf(pianoset[pianopos]) == -1){
				pianopos = (pianopos + 1) % 21;
			}
		}

		if (pianopos < 0 || pianopos >= 21) pianopos = getRandomInt(7, 17);
		if(cons1.length > 5-melodyFreqValue) melody_seq.push(pianoset[pianopos]);
		else melody_seq.push("");
		melody_seq.push("");
	}
	}

	return melody_seq
}

// parsing text to information
function text_to_line_list(text){
	var lines = text.split("\n");
	return lines;
}

function line_to_word_list(line){
	var words = line.split(" ");
	//remove anything other than alphabets from words
	for(var i = 0; i < words.length; i++){
		words[i] = words[i].replace(/[^a-zA-Z]/g, '');
	}
	// remove any empty word
	var newwords=[];
	for(var i = 0; i < words.length; i++){
		if (words[i] == ""){
		}
		else{
			newwords.push(words[i])
		}
	}
	return newwords;
}

function parse_word(word){
	var vowel = "AEIOUaeiou";
	var flag = false, found = false;
	var num_cons = 0, num_vow = 0;
	var front = 0, mid, back = word.length;
	// divide word into 3 parts,
	// where mid is first occurence of consecutive vowels
	for(var i = 0; i < word.length; i++){
		if (!found && !flag && vowel.includes(word[i])){
			flag = true;
			found = true;
			mid = i;
		}
		if(flag && !vowel.includes(word[i])){
			flag = false;
			back = i;
		}
		if(vowel.includes(word[i])) num_vow += 1;
		else num_cons += 1;
	}
	// do something with front, mid, back
	var cons0 = word.substring(front, mid);
	var vow = word.substring(mid, back);
	var cons1 = word.substring(back, word.length);

	var is_upper = (word[0] == word[0].toUpperCase())

	return {cons0:cons0, vow0:vow, cons1:cons1, is_upper:is_upper, 
		num_cons:num_cons, num_vow:num_vow};
}
