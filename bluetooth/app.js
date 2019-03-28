var bltprinter = new OB.BluetoothPrinter();
bltprinter.registerImage('ticket-image.png');

document.getElementById('usbrequest').addEventListener('click', event => {
    var device;
    navigator.usb.requestDevice({ filters: [
        { vendorId: 0x04B8, productId: 0x0202 } // Epson TM-T88V
    ] })
    .then(selectedDevice => {
        device = selectedDevice;
        console.log(device.productName);      // EPSON
        console.log(device.manufacturerName); // TMT88V
        console.dir(device);
        return device.open();
    })
    .then(() => device.selectConfiguration(1)) // Select configuration #1 for the device.
    .then(() => device.claimInterface(0)) // Request exclusive control over interface #1.
    .then(() => device.transferOut(0, 'ewrqwrqwrqwrwq\nfasdfsf\n')) // Waiting for 64 bytes of data from endpoint #5.
    .catch(error => { console.log(error); });



});

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

document.getElementById('imagemanipulation').addEventListener('click', event => {

/*     var img = new Image();

    img.src = 'ticket-image.png';
    img.onload = _ => {
      var canvas =  document.createElement('canvas');
      var ctx = canvas.getContext('2d');        
      ctx.drawImage(img, 0, 0);
      img.style.display = 'none';
      var imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.dir(imgdata);

      
    }; */

    Promise.resolve({image: 'ticket-image.png'})
    .then(getImageData)
    .then(function (result) {
        console.dir(result.imagedata);
    })
    .catch(function(ex) {
        console.dir(ex);
    });
});

function getImageData(data) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.src = data.image;
        img.onload = function () {
            var canvas =  document.createElement('canvas');
            var ctx = canvas.getContext('2d');        
            ctx.drawImage(img, 0, 0);
            img.style.display = 'none';
            data.imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(data);
        };
        img.onerror = function (ev) {
            reject(ev);
        }
    });
}
