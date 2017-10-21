var bg
var WIDTH
var HEIGHT
var fft
var fft2
var amplitude
var title = "Click Button Below to Play"
var canvas
var gain

var numberOfSong = 4
var titles = ["KSHMR - Wildcard (feat. Sidnie Tipton)", "Avicii - Addicted to You", "The Chainsmokers - Roses (feat. ROZES)", "Skrillex - Bangarang (feat. Sirah)"]
var files = ["KSHMR Wildcard.mp3", "Avicii Addicted to you.mp3", "Chainsmokers Roses.mp3", "Skrillex Bangarang.mp3"]
var currentId = 0
var song = new Array(numberOfSong)
var buttons = new Array(numberOfSong)

function preload(){
	bg = loadImage("polygon bg.png")
	for(var i = 0; i < numberOfSong; i++){
		song[i] = loadSound(files[i])
	}
}

function playSong(index){
	if(index == numberOfSong){
		song[currentId].stop()
		title = "Click Button to Play"
	}
	else{
		song[currentId].stop()
		song[index].play()
		currentId = index
		title = titles[currentId]
	}
	
}


function setup(){
	WIDTH = windowWidth
	HEIGHT = windowHeight
	canvas = createCanvas(WIDTH, HEIGHT)
	canvas.parent('sketch-holder')
	colorMode(HSB)
	angleMode(DEGREES)
	fft = new p5.FFT(0.7, 128)
	fft2 = new p5.FFT(0.85, 32)
	amplitude = new p5.Amplitude(0.8)
	//button setting
	for(var i = 0; i <= numberOfSong; i++){
		buttons[i] = select('#button'+ String(i))
	}
	buttons[0].position(20, HEIGHT-70)
	for(var i = 1; i <= numberOfSong; i++){
		buttons[i].position(buttons[i-1].x + buttons[i-1].width + 5, HEIGHT-70)
	}
}

function draw(){
	//start_angle = (start_angle + 0.3) % 360
	// center : 0,0
	translate(WIDTH/2, HEIGHT/2)
	// fft analyze
	var spectrum = fft.analyze();
	var spectrum2 = fft2.analyze();
	var level = amplitude.getLevel()

	// background
	image(bg, -(WIDTH/2), -(HEIGHT/2), WIDTH, HEIGHT)

	// down EQ
	Start = 2;
	End = spectrum2.length - 3
	var w = (WIDTH/2) / (End - Start)

	noStroke();
	for (var i = Start; i < End; i++){
		var amp = spectrum2[i]**2
		var x = map(i, Start, End, (WIDTH/2), 0)
		var h = map(amp, 0, 256**2, 0, 300)
		var y = - h / 2
		fill(0,0,60)
		rect(x, y, w*0.9, h)
		rect(-x-w, y, w*0.9, h)
	}

	// center circle spectrums
	strokeWeight(5.5)
	Start = 20
	End = spectrum.length - 20
	// right half
	for (var i = Start; i < End; i++){
		// set r and angle
		// amp : **2 to make dynamic changes
		// map : lower freq -> smaller, high freq -> bigger changes
		var amp = (spectrum[i]**3) * map(i, Start, End, 0.6, 1.0)
		var angle = map(i, Start, End, -90, 90)
		var r = map(amp, 0, 256**3, 205, 550);
		// x, y from r, angle
		var x = r*cos(angle)
		var y = r*sin(angle)
		// draw line
		stroke(map(i, Start, End, 0, 255), 255, 255)
		line(0, 0, x, y)
	}
	for (var i = Start; i < End; i++){
		// set r and angle
		var amp = (spectrum[i]**3) * map(i, Start, End, 0.6, 1.0)
		var angle = map(i, Start, End, 270, 90)
		var r = map(amp, 0, 256**3, 205, 550);
		// x, y from r, angle
		var x = r*cos(angle)
		var y = r*sin(angle)
		// draw line
		stroke(map(i, Start, End, 0, 255), 255, 255)
		line(0, 0, x, y)
	}



	level_over_4 = Math.max(0.4, level)

	// center circle
	fill(0,0,0)
	noStroke()
	var c_size = map(level_over_4, 0.4, 1.0, 400, 450)
	ellipse(0, 0, c_size, c_size)

	// cener title
	fill(0,0,255)
	stroke(0,0,0)
	textAlign(CENTER)
	var t_size = map(level_over_4, 0.4, 1.0, 40, 50)
	textSize(t_size)
	text(title, 0, 0)
}