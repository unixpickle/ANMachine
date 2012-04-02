function Video (canvas, mem) {
	this.mem = mem;
	this.canvas = canvas;
	
	var lineHeight = (canvas.height - 10) / 24;
	var colWidth = (canvas.width - 10) / 80;
	this.metrics = {'w': colWidth, 'h': lineHeight};
	
	this.keyBuffer = [];
	this.keyCallback = null;
	this.shift = false;
	this.event1 = this.keyDown.bind(this);
	this.event2 = this.keyUp.bind(this);
	window.addEventListener('keydown', this.event1, true);
	window.addEventListener('keyup', this.event2, true);
}

Video.prototype.dispose = function () {
	window.removeEventListener('keydown', this.event1, true);
	window.removeEventListener('keyup', this.event2, true);
}

Video.prototype.print = function (letter) {
	var cursor = this.mem.getCursorPosition();
	if (letter == 8) {
		// backspace
		if (cursor.x == 0 && cursor.y == 0) return;
		cursor.x -= 1;
		if (cursor.x < 0) {
			cursor.y -= 1;
			cursor.x = 79;
			if (cursor.y < 0) {
				cursor.y = 0;
			}
		}
		this.mem.setVideo(cursor.x, cursor.y, 0);
	} else if (letter == 13) {
		cursor.x = 80;
	} else {
		this.mem.setVideo(cursor.x, cursor.y, letter);
		cursor.x += 1;
	}
	
	if (cursor.x == 80) {
		cursor.y += 1;
		cursor.x = 0;
		if (cursor.y == 24) {
			cursor.y = 23;
			this.scrollDown();
		}
	}
	this.mem.setCursorPosition(cursor.x, cursor.y);
}

Video.prototype.scrollDown = function () {
	// go to video base + 82, copy 1840 bytes up 2, zero last 80 bytes
	for (var y = 1; y < 24; y++) {
		for (var x = 0; x < 80; x++) {
			this.mem.setVideo(x, y - 1, this.mem.getVideo(x, y));
		}
	}
	for (var x = 0; x < 80; x++) {
		this.mem.setVideo(x, 23, 0);
	}
}

Video.prototype.draw = function () {
	var context = this.canvas.getContext('2d');
	context.fillStyle = '#000';
	context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	context.fillStyle = '#FFF';
	context.strokeStyle = '#FFF';
	context.font = this.metrics.h + 'px monospace';
	
	var cursor = this.mem.getCursorPosition();
	var cx = cursor.x * this.metrics.w + 5;
	var cy = cursor.y * this.metrics.h + this.metrics.h - 2;
	context.fillRect(cx, cy, this.metrics.w, 2);
	
	for (var y = 0; y < 24; y++) {
		for (var x = 0; x < 80; x++) {
			var theChar = this.mem.getVideo(x, y);
			if (theChar == 0) continue;
			var gx = x * this.metrics.w + 5;
			var gy = y * this.metrics.h + this.metrics.h / 2 + 5;
			var str = String.fromCharCode(theChar);
			context.fillText(str, gx, gy);
		}
	}
}

Video.prototype.keyDown = function (event) {
	if (!cactive) return;
	if (event.keyCode == 16) {
		this.shift = true;
		return;
	}
	if (event.keyCode == 8) {
		event.preventDefault();
	}
	var num = this.asciiForKeyCode(event.keyCode);
	
	if (this.keyCallback) {
		this.keyCallback(num);
		this.keyCallback = null;
	} else {
		this.keyBuffer.push(num);
	}
}

Video.prototype.keyUp = function (event) {
	if (!cactive) return;
	var num = event.keyCode;
	if (num == 16) {
		this.shift = false;
		return;
	}
}

Video.prototype.asciiForKeyCode = function (keyCode) {
	if (keyCode == 8 || keyCode == 13 || keyCode == 32) return keyCode;
	if (keyCode > 0x40 && keyCode < 0x5B) {
		if (this.shift) return keyCode;
		return keyCode + 0x20;
	}
	
	var regDict = {
		222: "'",
		188: ',',
		190: '.',
		49: '1',
		50: '2',
		51: '3',
		52: '4',
		53: '5',
		54: '6',
		55: '7',
		56: '8',
		57: '9',
		48: '0',
		192: '`',
		219: '[',
		221: ']',
		189: '-',
		191: '/',
		187: '=',
		220: '\\',
		186: ';'
	};
	
	var shiftDict = {
		222: '"',
		188: '<',
		190: '>',
		49: '!',
		50: '@',
		51: '#',
		52: '$',
		53: '%',
		54: '^',
		55: '&',
		56: '*',
		57: '(',
		48: ')',
		192: '~',
		219: '{',
		221: '}',
		189: '_',
		191: '?',
		187: '+',
		220: '|',
		186: ':'
	};
	
	var keyDict = this.shift ? shiftDict : regDict;
	if (keyDict[keyCode] != undefined) {
		return keyDict[keyCode].charCodeAt(0);
	}
	return 0;
}
