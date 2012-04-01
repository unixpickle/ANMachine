function Interpreter (machineCode) {
	this.ip = 0;
	this.regs = new Registers();
	this.mem = new Memory();
	this.mem.setCode(machineCode);
	this.video = new Video(document.getElementById('canvas'), this.mem);
	this.hlt = false;
}

Interpreter.prototype.execute = function () {
	if (this.hlt) return;
	var instTable = {
		0x1: this.inst_set,
		0x2: this.inst_regcopy,
		0x3: this.inst_read,
		0x4: this.inst_write,
		0x5: this.inst_xor,
		0x6: this.inst_and,
		0x7: this.inst_or,
		0x8: this.inst_add,
		0x9: this.inst_sub,
		0xA: this.inst_div,
		0xB: this.inst_mul,
		0xC: this.inst_cmp,
		0xD: this.inst_ljump,
		0xE: this.inst_ajump,
		0xF: this.inst_jge,
		0x10: this.inst_jle,
		0x11: this.inst_je,
		0x12: this.inst_bell,
		0x13: this.inst_print,
		0x14: this.inst_readch,
		0x15: this.inst_halt,
		0x16: this.inst_readreg,
		0x17: this.inst_writereg
	};
	
	var instruction = this.readOctet();
	if (instruction == 0x0) return this.fireNext();
	
	if (instTable[instruction]) {
		instTable[instruction].call(this);
	} else {
		throw 'Invalid instruction: ' + instruction;
	}
	
	if (!this.hlt) {
		this.fireNext();
	}
}

Interpreter.prototype.fireNext = function (time) {
	var to = (time ? time : 10);
	setTimeout(this.execute.bind(this), to);
}

Interpreter.prototype.readOctet = function () {
	if (this.ip + 2 > this.mem.size) throw 'Buffer underflow';
	var val = this.mem.getValue(this.ip, 1);
	this.ip += 1;
	return val;
}

Interpreter.prototype.readWord = function () {
	if (this.ip + 2 > this.mem.size) throw 'Buffer underflow';
	var val = this.mem.getValue(this.ip, 2);
	this.ip += 2;
	return val;
}

// instruction set

Interpreter.prototype.inst_set = function () {
	var reg = this.readOctet();
	var val = this.readWord();
	this.regs.setRegister(reg, val);
}

Interpreter.prototype.inst_regcopy = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	this.regs.setRegister(reg1, this.regs.getRegister(reg2));
}

Interpreter.prototype.inst_read = function () {
	var reg1 = this.readOctet();
	var addr = this.readWord();
	var val = 0;
	if (reg1 > 4) {
		val = this.mem.getValue(addr, 1);
	} else {
		val = this.mem.getValue(addr, 2);
	}
	this.regs.setRegister(reg1, val);
}

Interpreter.prototype.inst_write = function () {
	var addr = this.readWord();
	var reg1 = this.readOctet();
	var val = this.regs.getRegister(reg1);
	if (reg1 > 4) {
		this.mem.setValue(addr, val, 1);
	} else {
		this.mem.setValue(addr, val, 2);
	}
}

Interpreter.prototype.inst_xor = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	this.regs.setRegister(reg1, val1 ^ val2);
}

Interpreter.prototype.inst_and = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	this.regs.setRegister(reg1, val1 & val2);
}

Interpreter.prototype.inst_or = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	this.regs.setRegister(reg1, val1 | val2);
}

Interpreter.prototype.inst_add = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	var result = val1 + val2;
	
	var flags = this.regs.getRegister(0);
	flags = 65535 ^ 1;
	if (result > 65535) {
		flags |= 1;
		result -= 65536;
	}
	
	this.regs.setRegister(0, flags);
	this.regs.setRegister(reg1, result);
}

Interpreter.prototype.inst_sub = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	var result = val1 - val2;
	
	var flags = this.regs.getRegister(0);
	flags = 65535 ^ 1;
	if (result < 0) {
		flags |= 1;
		result = 65536 + result;
	}
	
	this.regs.setRegister(0, flags);
	this.regs.setRegister(reg1, result);
}

Interpreter.prototype.inst_div = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	var whole = Math.floor(val1 / val2);
	var remainder = val1 - whole * val2;
	this.regs.setRegister(reg1, whole);
	this.regs.setRegister(0, remainder);
}

Interpreter.prototype.inst_mul = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	this.regs.setRegister(reg1, val1 * val2);
}

Interpreter.prototype.inst_cmp = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val1 = this.regs.getRegister(reg1);
	var val2 = this.regs.getRegister(reg2);
	
	var flags = this.regs.getRegister(0);
	flags = 65535 ^ (2 | 4);
	if (val1 > val2) {
		flags |= 2; 
	} else if (val1 == val2) {
		flags |= 4;
	}
	this.regs.setRegister(0, flags);
}

Interpreter.prototype.inst_ljump = function () {
	var reg1 = this.readOctet();
	var loc = this.regs.getRegister(reg1);
	this.ip = loc;
}

Interpreter.prototype.inst_ajump = function () {
	var loc = this.readWord();
	this.ip = loc;
}

Interpreter.prototype.inst_jge = function () {
	var loc = this.readWord();
	var flags = this.regs.getRegister(0);
	if ((flags & 2) == 0) return;
	
	this.ip = loc;
}

Interpreter.prototype.inst_jle = function () {
	var loc = this.readWord();
	var flags = this.regs.getRegister(0);
	if ((flags & 2) != 0 || (flags & 4) != 0) return;
	
	this.ip = loc;
}

Interpreter.prototype.inst_je = function () {
	var loc = this.readWord();
	var flags = this.regs.getRegister(0);
	if ((flags & 4) == 0) return;
	
	this.ip = loc;
}

Interpreter.prototype.inst_bell = function () {
	alert('BEEP: ' + JSON.stringify(this.regs.regs));
}

Interpreter.prototype.inst_print = function () {
	var reg = this.readOctet();
	var val = this.regs.getRegister(reg);
	if (val == 0) return;
	this.video.print(val);
	this.video.draw();
}

Interpreter.prototype.inst_readch = function () {
	if (this.video.keyBuffer.length > 0) {
		var theChar = this.video.keyBuffer[0];
		this.video.keyBuffer.splice(0, 1);
		return this.handleKey(theChar);
	}
	this.hlt = true;
	this.video.keyCallback = this.handleKey.bind(this);
}

Interpreter.prototype.inst_readreg = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var addr = this.regs.getRegister(reg2);
	var val = 0;
	if (reg1 > 4) {
		val = this.mem.getValue(addr, 1);
	} else {
		val = this.mem.getValue(addr, 2);
	}
	this.regs.setRegister(reg1, val);
}

Interpreter.prototype.inst_writereg = function () {
	var reg1 = this.readOctet();
	var reg2 = this.readOctet();
	var val = this.regs.getRegister(reg2);
	var addr = this.regs.getRegister(reg1);
	if (reg2 > 4) {
		this.mem.setValue(addr, val, 1);
	} else {
		this.mem.setValue(addr, val, 2);
	}
}

Interpreter.prototype.inst_halt = function () {
	this.hlt = true;
}

Interpreter.prototype.handleKey = function (key) {
	var reg = this.readOctet();
	this.regs.setRegister(reg, key);
	this.hlt = false;
	this.fireNext(10);
}
