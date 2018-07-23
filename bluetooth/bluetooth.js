class BluetoothPrinter {

    constructor() {
        this.size = 20;
        this.device = null;
        this.onDisconnected = this.onDisconnected.bind(this);
    }

    request() {
    
        if (!navigator.bluetooth) {
            return Promise.reject('Bluetooth not supported.');
        }

        return navigator.bluetooth.requestDevice({
            // "filters": [{
            // }],
            optionalServices: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'],
            acceptAllDevices: true,
        })
            .then(device => {
                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
            });
    }

    print(data) {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }

        if (this.characteristic) {
            return this.printArray(data);
        }

        return this.device.gatt.connect()
        .then(server => {
            this.server = server;
            return server.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2');
        })
        .then(service => {
            return service.getCharacteristic('bef8d6c9-9c21-4c9e-b632-bd58c1009f9f');
        })
        .then(characteristic => {    
            this.characteristic = characteristic;
            this.printArray(data);

        });
    }

    printArray(data) {
        var i, result;

        result = Promise.resolve();
        console.log(data);
        for (i = 0; i < data.length; i += this.size) {
            result = result.then(this.printChunk(data.slice(i, i + this.size)));
        }
        return result;
    }

    printChunk(chunk) {
        return function () {
            return this.characteristic.writeValue(chunk)
        }.bind(this);
    }

    onDisconnected() {
        this.device = null;
        this.characteristic = null;
        this.server = null;
        console.log('Device is disconnected.');
    }
}