const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');

const CashAcceptor_reset = Buffer.from([0x02, 0x03, 0x06, 0x30, 0x41, 0xB3]),  // commands for CashCode
	  CashAcceptor_ack = Buffer.from([0x02, 0x03, 0x06, 0x00, 0xC2, 0x82]),
	  CashAcceptor_poll = Buffer.from([0x02, 0x03, 0x06, 0x33, 0xDA, 0x81]),
	  CashAcceptor_enable = Buffer.from([0x02, 0x03, 0x0C, 0x34, 0x00, 0x00, 0x7C, 0x00, 0x00, 0x00, 0x66, 0xC1]);

const port = new SerialPort({ path: '', baudRate: 9600 }),
	  parser = port.pipe(new ByteLengthParser({ length: 7 }));

const reset = () => port.write(CashAcceptor_reset),
	  enable = () => port.write(CashAcceptor_enable),
      poll = () => port.write(CashAcceptor_poll),
	  ack = () => port.write(CashAcceptor_ack);

const pollInterval = () => setInterval(poll, 500);  // bill acceptance interval

port.on('open', () => {   // CashCode launch
	setTimeout(reset, 0);
	setTimeout(enable, 5000);
	setTimeout(pollInterval, 8000);
});

port.on('data', (data, err) => {
	if (err) {
		console.log(err.message);
	}
	const len = data.length;
	switch (data[len - 1]) {      // enumeration of known codes
		case 9:
			console.log('recived 20 UAH');
			break;
		case 24:
			console.log('recived 50 UAH');
			break;
	}
	if (data[len - 1] !== 212) {  // catching unknown codes
		console.log(data[len - 1]);
	}
	setTimeout(ack, 100);         // return response to CashCode
});
