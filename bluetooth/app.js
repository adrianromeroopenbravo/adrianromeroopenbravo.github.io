var bluetoothPrinter = new BluetoothPrinter();

document.getElementById('connect').addEventListener('click', event => {
  bluetoothPrinter.request()
  .then(_ => bluetoothPrinter.connect())
  .then(_ => { 
      bluetoothPrinter.writePrinter('Esto es una prueba\n');
  })
  .catch(error => { alert(error) });
});