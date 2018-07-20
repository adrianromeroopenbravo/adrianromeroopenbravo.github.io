var bluetoothPrinter = new BluetoothPrinter();

document.getElementById('connect').addEventListener('click', event => {
  bluetoothPrinter.request()
  .then(_ => bluetoothPrinter.connect())
  .catch(error => { alert(error) });
});

document.getElementById('print').addEventListener('click', event => {

    bluetoothPrinter.writePrinter('Esto es una prueba\n')
    .catch(error => { alert(error) });
  });