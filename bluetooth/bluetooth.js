class BluetoothPrinter {

    constructor() {
        this.device = null;
        this.onDisconnected = this.onDisconnected.bind(this);
    }

    request() {
        let options = {
            // "filters": [{

            // }],
            "optionalServices": [0xe7810a71],
            acceptAllDevices: true,
        };
        return navigator.bluetooth.requestDevice(options)
            .then(device => {
                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
            });
    }

    connect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }
        return this.device.gatt.connect();
    }

    writePrinter(data) {
        alert('printing');
        return this.device.gatt.getPrimaryService('e7810a71-73ae-499d-8c15-faa9aef0c3f2')
            .then(service => {
                alert('got service');
                service.getCharacteristic('bef8d6c9-9c21-4c9e-b632-bd58c1009f9f');
            })
            .then(characteristic => {
                alert('got characteristic');
                let encoder = new TextEncoder('utf-8');
                let userDescription = encoder.encode(data);
                return characteristic.writeValue(userDescription);                
            });
    }

    disconnect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        }
        return this.device.gatt.disconnect();
    }

    onDisconnected() {
        alert('Device is disconnected.');
    }
}