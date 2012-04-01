function Memory () {
	this.buffer = new Uint8Array(65536);
	this.videoBase = 63614;
	this.size = 65536;
}

Memory.prototype.setCode = function (code) {
	for (var i = 0; i < code.length; i++) {
		this.buffer[i] = code[i];
	}
}

Memory.prototype.getValue = function (off, len) {
	if (len == 1) {
		return this.buffer[off];
	} else if (len == 2) {
		var num = this.buffer[off];
		num |= this.buffer[(off == 65535 ? 0 : off + 1)] << 8;
		return num;
	} else {
		throw 'Invalid length given';
	}
}

Memory.prototype.setValue = function (off, val, length) {
	if (length == 1) {
		this.buffer[off] = val;
	} else if (length == 2) {
		this.buffer[off] = val & 255;
		this.buffer[(off == 65535 ? 0 : off + 1)] = (val >> 8) & 255;
	} else {
		throw 'Invalid length given';
	}
}

Memory.prototype.getCursorPosition = function () {
	var off = this.getValue(this.videoBase, 2);
	var y = Math.floor(off / 80);
	var x = off - y * 80;
	return {'x': x, 'y': y};
}

Memory.prototype.setCursorPosition = function (x, y) {
	return this.setValue(this.videoBase, x + (y * 80), 2);
}

Memory.prototype.getVideo = function (x, y) {
	var offset = this.videoBase + 2 + x + (y * 80);
	return this.getValue(offset, 1);
}

Memory.prototype.setVideo = function (x, y, value) {
	var offset = this.videoBase + 2 + x + (y * 80);
	this.setValue(offset, value, 1);
}
