var bluetoothPrinter = new BluetoothPrinter();

document.getElementById('request').addEventListener('click', event => {
  bluetoothPrinter.request()
  .catch(error => { alert(error) });
});

document.getElementById('print').addEventListener('click', event => {
    bluetoothPrinter.writePrinter('Esto es una prueba\n')
    .catch(error => { alert(error) });
});

ocument.getElementById('printencoded').addEventListener('click', event => {
    bluetoothPrinter.writePrinterEncoded('Esto es una prueba Encoded\n')
    .catch(error => { alert(error) });
});