let bluetoothPrinter = new BluetoothPrinter();

document.getElementById('request').addEventListener('click', event => {
  bluetoothPrinter.request()
  .catch(error => {
      alert(error);
    });
});

document.getElementById('print').addEventListener('click', event => {
    
    bluetoothPrinter.printText(document.getElementById('datainput').value)
    .then(_ => {
        bluetoothPrinter.printArray(ESCPOS.NEW_LINE)
    })
    .catch(error => { 
        alert(error);
    });
});
