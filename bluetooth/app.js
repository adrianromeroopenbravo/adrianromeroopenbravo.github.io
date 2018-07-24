var bltprinter = new OB.BluetoothPrinter();

document.getElementById('request').addEventListener('click', event => {
    bltprinter.request()
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