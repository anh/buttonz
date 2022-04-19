// source
// https://git.learnjsthehardway.com/learn-javascript-the-hard-way/buttons-computer/src/commit/2902842fcc062552cf6ca50896b8c62a587df7ea/src/buttons.js

export class ButtonMachine {

  constructor(code) {
    this.stack = [];
    this.ram = new Array(64).fill(0);
    this.ip = 0;
    this.code = code;
    this.max_clicks = 256;
    this.tick = 0;
    this.registers = {'IX': 0};
    this.error = '';
    this.error_line = 0;
    this.halted = false;
  }

  assert(test, message) {
    // I should use exceptions but not sure if I want to do that too early in the course
    if(!test) {
      let display_op = this.cur_op ? this.cur_op.join(' ') : 'NONE';
      this.error_line = this.ip;
      console.log(`HALT[FIRE]: ${message} at line #${this.ip}: ${display_op}`);
      this.error = message;
      this.halted = true;
    }

    return test;
  }

  /* Need to use a function because @babel/plugin-proposal-class-properties */
  static register_names() {
    return ['AX', 'BX', 'CX', 'DX', 'IX'];
  }

  static operations() {
    return Object.getOwnPropertyNames(ButtonMachine.prototype)
      .filter(x => x.startsWith('op_'))
      .map(x => x.slice(3));
  }

  get stack_top() {
    return this.stack[this.stack.length - 1];
  }

  get cur_op() {
    return this.code[this.ip];
  }

  get register_entries() {
   return Object.entries(this.registers);
  }

  infix(op_name, cb) {
    let b = this.stack.pop();
    this.assert(b !== undefined, `${op_name} right operand POP empty stack`);

    let a = this.stack.pop();
    this.assert(b !== undefined, `${op_name} left operand POP empty stack`);

    let res = cb(a, b);
    this.assert(res != NaN,  `${op_name} results in NaN value`);
    this.assert(res !== undefined, `${op_name} results in undefined value`);

    this.stack.push(res);
    this.next();
  }

  op_ADD() {
    this.infix('ADD', (a,b) => a + b);
  }

  op_SUB() {
    this.infix('SUB', (a,b) => a - b);
  }

  op_DIV() {
    this.infix('DIV', (a,b) => a / b);
  }

  op_IDIV() {
    this.infix('IDIV', (a,b) => Math.floor(a / b));
  }

  op_MUL() {
    this.infix('MUL', (a,b) => a * b);
  }

  op_MOD() {
    this.infix('MOD', (a,b) => a % b);
  }

  op_POP() {
    let val = this.stack.pop();
    this.next();
    return val;
  }

  op_PUSH(value) {
    this.stack.push(value);
    this.next();
  }

  op_HALT(message) {
    this.halted = true;
    this.error = message;
  }

  op_JUMP(line) {
    if(!this.assert(line !== undefined, `Invalid jump! You need to give a line number.`)) return;
    if(!this.assert(line <= this.code.length, `Invalid jump to line ${line} last line is ${this.code.length}`)) return;

    this.ip = line;
  }

  op_JZ(line) {
    if(!this.assert(line !== undefined, `Invalid jump! You need to give a line number.`)) return;
    if(!this.assert(line <= this.code.length, `Invalid jump to line ${line} last line is ${this.code.length}`)) return;

    if(this.stack_top == 0) {
      this.op_JUMP(line);
    } else {
      this.next();
    }
  }

  op_JNZ(line) {
    if(!this.assert(line !== undefined, `Invalid jump! You need to give a line number.`)) return;
    if(!this.assert(line <= this.code.length, `Invalid jump to line ${line} last line is ${this.code.length}`)) return;

    if(this.stack_top != 0) {
      this.op_JUMP(line);
    } else {
      this.next();
    }
  }

  op_CLR() {
    Object.keys(this.registers).forEach(key => delete this.registers[key]); // clears register
    this.stack.splice(0, this.stack.length); // clears the stack contents

    this.ip = 0;
    this.tick = 0;
    this.error = '';
    this.error_line = 0;
    this.halted = false;
  }

  op_STOR(reg) {
    const reg_names = ButtonMachine.register_names();
    if(!this.assert(reg_names.includes(reg), `Register "${reg}" is not valid. Use ${reg_names}`)) return;

    this.registers[reg] = this.stack_top;
    this.next();
  }

  op_RSTOR(reg) {
    const reg_names = ButtonMachine.register_names();
    if(!this.assert(reg_names.includes(reg), `Register "${reg}" is not valid. Use ${reg_names}`)) return;

    let val = this.registers[reg];
    this.assert(val !== undefined, `Invalid register ${reg} or register empty.`);

    this.stack.push(val);
    this.next();
  }

  op_PEEK(inc) {
    let index = Math.abs(this.registers.IX) % this.ram.length;
    this.stack.push(this.ram[index]);
    if(inc) this.registers.IX = index + inc;
    this.next();
  }

  op_POKE(inc) {
    let index = Math.abs(this.registers.IX) % this.ram.length;
    this.ram[index] = this.stack_top;
    if(inc) this.registers.IX = index + inc;
    this.next();
  }

  op_SWAP() {
    if(!this.assert(this.stack.length >= 2, "Not enough elements on the stack to swap.")) return;

    let [top, n] = [this.stack.pop(), this.stack.pop()];
    this.stack.push(top);
    this.stack.push(n);
    this.next();
  }

  get running() {
    return this.halted === false && this.tick < this.max_clicks && this.ip < this.code.length && this.cur_op !== undefined;
  }

  next() {
    this.ip++;
  }

  dump(leader) {
    console.log(leader, "TICK", this.tick, "CUR", this.cur_op, "IP", this.ip, "STACK", this.stack);
  }

  step() {
    if(this.running) {
      let [op, data] = this.cur_op;
      let op_func = this[`op_${op}`];
      this.assert(op_func !== undefined, `Invalid operation ${op}`);
      op_func.call(this, data);
      this.tick++;
    }
  }

  run(debug=false) {
    while(this.running === true) {
      if(debug) this.dump(">>>");
      this.step();
      if(debug) this.dump("<<<");
      // this.tick is managed by this.step
    }
  }
}

export default { ButtonMachine };
