var bluetoothPrinter = new BluetoothPrinter();

document.getElementById('request').addEventListener('click', event => {
  bluetoothPrinter.request()
  .catch(error => {
      alert(error);
    });
});

document.getElementById('print').addEventListener('click', event => {
    
    bluetoothPrinter.writePrinter(document.getElementById('datainput').value)
    .catch(error => { 
        alert(error);
    });
});