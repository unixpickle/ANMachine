function Registers () {
	this.flags = 0;
	this.regs = [0, 0, 0, 0];
}

Registers.prototype.setRegister = function (index, val) {
	if (index == 0) {
		this.flags = val & 65535;
	} else if (index > 0 && index < 5) {
		this.regs[index - 1] = val & 65535;
	} else if (index > 4 && index < 13) {
		var num = (index - 5) / 2;
		var idx = Math.floor(num);
		if (num != idx) {
			// higher byte
			this.regs[idx] &= 255;
			this.regs[idx] |= (val & 255) << 8;
		} else {
			// lower byte
			this.regs[idx] &= 65535 ^ 255;
			this.regs[idx] |= (val & 255);
		}
	}
}

Registers.prototype.getRegister = function (index) {
	if (index == 0) {
		return this.flags;
	} else if (index > 0 && index < 5) {
		return this.regs[index - 1];
	} else if (index > 4 && index < 13) {
		var num = (index - 5) / 2;
		var idx = Math.floor(num);
		if (num != idx) {
			// higher byte
			return (this.regs[idx] >> 8) & 255;
		} else {
			// lower byte
			return this.regs[idx] & 255;
		}
	}
}
