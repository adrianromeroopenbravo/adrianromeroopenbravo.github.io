var bltprinter = new OB.WEBPrinter(OB.Bluetooth);
// bltprinter.registerImage('ticket-image.png');

var usbprinter = new OB.WEBPrinter(OB.USB);


document.getElementById('usbtest').addEventListener('click', event => {
    var device;
    navigator.usb.requestDevice({ filters: [
        { vendorId: 0x04B8, productId: 0x0202 } // Epson TM-T88V
    ] })
    .then(selectedDevice => {
        device = selectedDevice;
        window.device = device;
        console.log(device.productName);      // EPSON
        console.log(device.manufacturerName); // TMT88V
        console.dir(device);
        return device.open();
    })
    .then(() => {
        console.log('Configuring');
        return device.selectConfiguration(1); // Select configuration #1 for the device.
    })
    .then(() => {
        console.log('claiming');
        return device.claimInterface(0); // Request exclusive control over interface #1.
    })
    .then(() => {
        console.log('transfering');
        var line = new Uint8Array([0x65, 0x65, 0x65, 0x65, 0x65, 0x65, 0x65, 0x0D, 0x0A,0x65, 0x65, 0x65, 0x65, 0x65, 0x65, 0x65, 0x0D, 0x0A]);
        return device.transferOut(1, line.buffer) // Waiting for 64 bytes of data from endpoint #5.
    })
    .catch(error => { 
        console.dir(error);
    });
});

document.getElementById('usbrequest').addEventListener('click', event => {
    usbprinter.request()
    .catch(error => {
        alert(error);
    });    
});

document.getElementById('usbprint').addEventListener('click', event => {
    usbprinter.print(document.getElementById('datareceipt').value)
    .then(_ => {
        console.log("success");
    })
    .catch(error => { 
        alert(error);
    });    
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
