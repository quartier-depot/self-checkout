import EventEmitter from '../event-emitter.ts';
// @ts-ignore
import { Aim, Detector, GS1 } from '@point-of-sale/barcode-parser';

class KeyboardBarcodeScanner {

  #options;
  #internal;

  /*
      Time between keystrokes for common barcode scanners:

      Netum NSL-5:                6ms
      Netum NSC750:               19ms
      Honeywell HF680:            10ms
      Honeywell Voyager 1400g:    10ms
      Datalogic BC2090:           1ms

  */

  #timeBetweenKeystrokes = 40;

  /*
      Our timeout needs to be set quite conservatively,
      because the browser may not be able to keep up with
      the barcode scanner and may pause events for a couple
      of tens of ms.
  */

  #timeoutAfterLastKeystroke = 200;


  constructor(options?: any) {
    this.#options = Object.assign({
      debug: false,
      timing: 'auto',
      guessSymbology: true,
      allowedSymbologies: [],
    }, options || {});

    this.#internal = {
      state: 'unknown',
      command: [],
      keydown: this.#keydown.bind(this),
      interval: null,
      emitter: new EventEmitter(),
      buffer: [],
      keystrokes: 0,
      timestamp: {
        first: null,
        last: null,
      },
    };

    if (this.#options.timing !== 'auto' && typeof this.#options.timing === 'number') {
      this.#timeBetweenKeystrokes = this.#options.timing;
      this.#timeoutAfterLastKeystroke = this.#options.timing * 5;
    }
  }

  async connect() {
    this.#open();
  }

  async reconnect() {
    this.#open();
  }

  async disconnect() {
    this.#close();
  }

  addEventListener(n: any, f: any) {
    this.#internal.emitter.on(n, f);
  }

  async #open() {
    document.addEventListener('keydown', this.#internal.keydown);
    // @ts-ignore
    this.#internal.interval = setInterval(() => this.#check(), 50);

    this.#internal.emitter.emit('connected', {
      type: 'keyboard',
    });
  }

  async #close() {
    document.removeEventListener('keydown', this.#internal.keydown);
    // @ts-ignore
    clearInterval(this.#internal.interval);

    this.#internal.emitter.emit('disconnected');
  }

  #keydown(e: any) {
    let now = performance.now();

    /* Do not process if the event target is a form field */

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    /* Prevent this keydown from reaching the browser when we're in data or command mode */

    if (this.#internal.state !== 'unknown') {
      e.stopPropagation();
      e.preventDefault();
    }

    if (this.#options.debug) {
      console.log(e);
    }

    /* Set the starting timestamp for this - perhaps series of - keydown events */

    if (this.#internal.timestamp.first === null) {
      // @ts-ignore
      this.#internal.timestamp.first = now; // e.timeStamp;
    }

    /* Parse buffer on timeout */

    if (this.#internal.keystrokes > 1 && this.#internal.state === 'unknown') {
      // @ts-ignore
      if (now - this.#internal.timestamp.last > this.#timeBetweenKeystrokes) {
        if (this.#options.debug) {
          // @ts-ignore
          console.log(`forcing parse because ${this.#timeBetweenKeystrokes}ms since last keydown`, now, this.#internal.timestamp.last, now - this.#internal.timestamp.last);
        }

        this.#parse(this.#internal.buffer);
        this.#reset();
      }
    }

    /* If we've received more than 2 keystrokes in less than 30ms each, we're in data mode */

    if (this.#internal.keystrokes > 2 && this.#internal.state === 'unknown') {
      // @ts-ignore
      if (now - this.#internal.timestamp.first < this.#internal.keystrokes * 30) {
        this.#internal.state = 'data';
      }
    }

    /* Intercept commands */

    if (e.key === 'Clear' && e.code === 'NumLock') {

      if (this.#internal.state !== 'command') {
        this.#internal.state = 'command';
      } else if (this.#internal.state === 'command') {
        this.#command();
        this.#internal.state = 'data';
      }

      if (this.#internal.buffer.length > 0) {
        this.#internal.keystrokes++;
        // @ts-ignore
        this.#internal.timestamp.last = now;
      }

      return;
    }

    /* Append key to buffer */

    if (this.#internal.state === 'unknown' || this.#internal.state === 'data') {

      /* Just a regular keypress */

      if (e.key.length === 1) {
        // @ts-ignore
        this.#internal.buffer.push(e.key.charCodeAt(0));
      }

      /* Special keys */

      else {
        let keyMapping = {
          'Enter': 0x0d,
          'Tab': 0x09,
          'Escape:': 0x1b,
        };

        // @ts-ignore
        if (keyMapping[e.key]) {
          // @ts-ignore
          this.#internal.buffer.push(keyMapping[e.key]);
        }
      }
    } else {
      // @ts-ignore
      this.#internal.command.push({ key: e.key, code: e.code });
    }

    this.#internal.keystrokes++;
    // @ts-ignore
    this.#internal.timestamp.last = now;
  }

  #check() {
    let now = performance.now();

    if (this.#internal.buffer.length === 0) {
      return;
    }

    // @ts-ignore
    if (now - this.#internal.timestamp.last > this.#timeoutAfterLastKeystroke) {
      if (this.#options.debug) {
        // @ts-ignore
        console.log(`forcing parse because ${this.#timeoutAfterLastKeystroke}ms have passed`, now, this.#internal.timestamp.last, now - this.#internal.timestamp.last);
      }

      this.#parse(this.#internal.buffer);
      this.#reset();
    }
  }

  #command() {
    if (this.#internal.command.length === 0) {
      return;
    }

    let command = this.#internal.command.shift();

    // @ts-ignore
    if (command.code == 'AltLeft') {
      let payload = this.#internal.command.map((c: any) => c.key).join('');
      // @ts-ignore
      this.#internal.buffer.push(parseInt(payload, 10));
    }

    this.#internal.command = [];
  }

  #parse(buffer: any) {
    if (buffer.length > 4) {
      if (this.#options.debug) {
        console.log(
          // @ts-ignore
          `received ${this.#internal.keystrokes} keystrokes in ${parseInt(this.#internal.timestamp.last - this.#internal.timestamp.first, 10)}ms, ` +
          // @ts-ignore
          `that is an average of ${parseInt((this.#internal.timestamp.last - this.#internal.timestamp.first) / this.#internal.keystrokes, 10)}ms per keystroke`,
        );
      }

      let result: any = {
        value: String.fromCharCode.apply(null, buffer),
        bytes: [
          new Uint8Array(buffer),
        ],
      };

      /* If the last character of value is a carriage return, remove it */

      if (result.value.endsWith('\r')) {
        result.value = result.value.slice(0, -1);
      }

      /* Check if we have and AIM identifier */

      if (result.value.startsWith(']')) {
        let aim = Aim.decode(result.value.substr(0, 3), result.value.substr(3));

        if (aim) {
          result.aim = result.value.substr(0, 3);
          result.symbology = aim;
        }

        result.value = result.value.substr(3);
      }

      /* Otherwise try to guess the symbology */

      else if (this.#options.guessSymbology) {
        let detected = Detector.detect(result.value);

        if (detected) {
          result = Object.assign(result, detected);
        }
      }

      if (this.#options.debug) {
        console.log('Result', result);
      }

      /* Decode GS1 data */

      let parsed = GS1.parse(result);
      if (parsed) {
        result.data = parsed;
      }

      if (this.#options.debug) {
        console.log('GS1', result);
      }

      /* Emit the barcode event */

      if (this.#options.allowedSymbologies.length === 0 ||
        this.#options.allowedSymbologies.includes(result.symbology)) {
        this.#internal.emitter.emit('barcode', result);
      }
    }
  }

  #reset() {
    this.#internal.buffer = [];
    this.#internal.command = [];
    this.#internal.state = 'unknown';
    this.#internal.keystrokes = 0;
    this.#internal.timestamp = {
      first: null,
      last: null,
    };
  }
}

export default KeyboardBarcodeScanner;