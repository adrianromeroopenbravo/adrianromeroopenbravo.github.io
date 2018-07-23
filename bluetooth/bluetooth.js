class BluetoothPrinter {

    constructor() {
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
            console.log(data);
            return this.characteristic.writeValue(data);
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
            console.log(data);
            characteristic.writeValue(data);
        });
    }

    printText(text) {
        let encoder = new TextEncoder('utf-8');         
        return this.print(encoder.encode(text));        
    }

    printArray(list) {     
        return this.print(new Uint8Array(list));;        
    }

    onDisconnected() {
        this.device = null;
        this.characteristic = null;
        this.server = null;
        console.log('Device is disconnected.');
    }
}