# Practice LJSTHW: parse Zedashaw's ButtonMachine code 

## Write button code 

See sample button file at `buttons/sqrt2.btn`.  It has simple format:

OPERATION DATA ;INLINE COMMENT

Whole line comments also start with `;`

## Load a button file and get Button Machine run it

```bash
$ node src/index.js 'your-button-file'
```

## Run sample button file buttons/sqrt2.btn

```bash
$ npm run sqrt2
```

Verify its result in BX register 

## Test

Only one test, I'm still learning `ava`.

```bash 
$ npm install
$ npm test
```

## License 

`buttons.js` is copyrighted by Zedshaw

https://git.learnjsthehardway.com/learn-javascript-the-hard-way/buttons-computer/

