var bltprinter = new OB.BluetoothPrinter();

document.getElementById('request').addEventListener('click', event => {
  bluetoothPrinter.request()
  .catch(error => {
      alert(error);
    });
});

document.getElementById('print').addEventListener('click', event => {
    
    bltprinter.rawprint(document.getElementById('datainput').value)
    .catch(error => { 
        alert(error);
    });
});

document.getElementById('printreceipt').addEventListener('click', event => {
    bltprinter.print(document.getElementById('datareceipt').value)
    .then(_ => {
        console.log("success");
    })
    .catch(error => { 
        alert(error);
    });
});