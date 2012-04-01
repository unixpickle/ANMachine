# ANMachine

This is a small virtual machine that executes a custom-made machine language using Javascript. The web application includes an HTML5 console, which can be used to interact with programs. The web application also includes a text field into which custom programs can be entered, and then executed. Code must be entered as a series of hex bytes separated by spaces and new lines.

# Registers

Registers are slots in which 2 bytes of data can be stored.  These slots are identified by a 1-byte index number.  The first 4 multi-purpose registers are numbered from 1-4, and can hold two bytes of data.  The next 8 slots, numbered 5-12, are the lower and higher portions of the 2-byte registers.  For example, register 6 is the higher portion of register 1, and register 7 is the lower portion of register 2.  Register 0 is the flags register. Registers may sometimes be referred to with the notation `reg(n)`, where n is the register number.

### The Flags Register

The flags register is a 2-byte integer register that holds CPU related information.  All flags are a single bit.  These flags are as follows, ordered from least to most significant bit:

* CF - set when an add operation overflows
* DF - set by comparators, 1 is greater than, 0 is less than or equal
* EF - set by comparator if the operands are equal => DF=0

# Memory

65536 bytes of memory are provided for the programs execution.  However, the highest 1922 bytes of this memory are reserved for graphics memory.  The program itself is loaded at the address 0x0, yielding a maximum program size of 63614 bytes.

# Instructions

In the following list, arguments are separated by commas. Here are the kinds of arguments that you will see:

@arg - a two-byte memory address
&lt;arg&gt; - a two-byte raw value
{arg} - a single-byte register index

<table>
	<tr><td>Instruction</td><td>Arguments</td><td>Number</td><td>Description</td></tr>
	<tr><td>no-op</td><td>()</td><td>0x0</td><td>does nothing</td></tr>
	<tr><td>set</td><td>({a}, &lt;b&gt;)</td><td>0x1</td><td>moves `b` into `a`</td></tr>
	<tr><td>regcopy</td><td>({a}, {b})</td><td>0x2</td><td>sets `a` to `b`</td></tr>
	<tr><td>read</td><td>({a}, @b)</td><td>0x3</td><td>reads one or two bytes from `b` into `a`</td></tr>
	<tr><td>write</td><td>(@a, {b})</td><td>0x4</td><td>writes the contents of `b` into `a`</td></tr>
	<tr><td>xor</td><td>({a}, {b})</td><td>0x5</td><td>sets `a` to `a` ^ `b`</td></tr>
	<tr><td>and</td><td>({a}, {b})</td><td>0x6</td><td>sets `a` to `a` & `b`</td></tr>
	<tr><td>or</td><td>({a}, {b})</td><td>0x7</td><td>sets `a` to `a` | `b`</td></tr>
	<tr><td>add</td><td>({a}, {b})</td><td>0x8</td><td>adds the number stored in `b` to the value of `a`</td></tr>
	<tr><td>sub</td><td>({a}, {b})</td><td>0x9</td><td>sets `a` to `a` - `b`</td></tr>
	<tr><td>div</td><td>({a}, {b})</td><td>0xA</td><td>sets `a` to `a` / `b`; sets `reg(4)` to the modulus</td></tr>
	<tr><td>mul</td><td>({a}, {b})</td><td>0xB</td><td>0xB, sets `a` to `a` * `b`</td></tr>
	<tr><td>compare</td><td>({a}, {b})</td><td>0xC</td><td>compares `a` to `b`, DF is 1 if `a` > `b`</td></tr>
	<tr><td>ljump</td><td>({a})</td><td>0xD</td><td>jumps to the address stored in `a`</td></tr>
	<tr><td>ajump</td><td>(@a)</td><td>0xE</td><td>jumps to the pre-defined address `a`</td></tr>
	<tr><td>jge</td><td>(@a)</td><td>0xF</td><td>jumps to `a` if DF is 1 and EF is 0</td></tr>
	<tr><td>jle</td><td>(@a)</td><td>0x10</td><td>jumps to `a` if DF is 0 and EF is 0</td></tr>
	<tr><td>je</td><td>(@a)</td><td>0x11</td><td>jumps to `a` if EF is 1</td></tr>
	<tr><td>bell</td><td>()</td><td>0x12</td><td>rings a bell</td></tr>
	<tr><td>print</td><td>({a})</td><td>0x13</td><td>prints an ASCII character to the video memory</td></tr>
	<tr><td>readch</td><td>({a})</td><td>0x14</td><td>reads an ASCII character from the keyboard</td></tr>
	<tr><td>hlt</td><td>()</td><td>0x15</td><td>shuts down the system</td></tr>
</table>