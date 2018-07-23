
(function () {

window.OB = window.OB || {};

OB.BluetoothPrinter = function() {
    this.columns = 42;
    this.bluetoothprinter = new BluetoothPrinter();
};

OB.BluetoothPrinter.prototype.print = function(doc) {

    var parser = new DOMParser();
    var dom = parser.parseFromString(doc, "application/xml");

    if (dom.documentElement.nodeName === "parsererror") {
        return Promise.reject("Error while parsing XML template.");
    }

    try {
        return this.processDOM(dom);
    } catch (ex) {
        return Promise.reject(ex);
    } 
};


OB.BluetoothPrinter.prototype.processDOM = function(dom) {
    var output;

    Array.from(dom.children).forEach(function(el) {
        if (el.nodeName === 'output') {
            output = this.processOutput(el);
        }
    }.bind(this));

    if (output) {
        console.log(output);
        if (this.bluetoothprinter.device) {
            return this.bluetoothprinter.printText(output);
        } else {
            return this.bluetoothprinter.request()
            .then(function() {
                this.bluetoothprinter.printText(output)
            }.bind(this));
        }   
    } else {
        return Promise.resolve(); // Nothing printed
    }
};

OB.BluetoothPrinter.prototype.processOutput = function(dom) {
    var printerdocs = '';
    Array.from(dom.children).forEach(function(el) {
        if (el.nodeName === 'ticket') {
            printerdocs += this.processTicket(el);
        }
    }.bind(this));
    return printerdocs;
};


OB.BluetoothPrinter.prototype.processTicket = function(dom) {
    var printerdoc = '';
    Array.from(dom.children).forEach(function(el) {
        if (el.nodeName === 'line') {
            printerdoc += this.processLine(el) + '\n';
        }
    }.bind(this));

    console.log(printerdoc);
    return printerdoc;
};

OB.BluetoothPrinter.prototype.processLine = function(dom) {
    var line = '';

    Array.from(dom.children).forEach(function(el) {
        if (el.nodeName === 'text') {
            var txt = el.textContent;
            var len = parseInt(el.getAttribute('length')) || txt.length;
            var align = el.getAttribute('align');
            var txt;
            if (align === 'right') {
                txt = padStart(txt, len);
            } else if (align === 'center') {
                txt = padCenter(txt, len);
            } else {
                txt = padEnd(txt, len);
            }
            line += txt;
        }
    }.bind(this));

    return padEnd(line, this.columns);    
};

function padStart(txt, length) {
    var result = txt.padStart(length);
    if (result.length > length) {
        return result.substring(result.length - length);
    } else {
        return result;
    }
}

function padEnd(txt, length) {
    var result = txt.padEnd(length);
    if (result.length > length) {
        return result.substring(0, length);
    } else {
        return result;
    }
}

function padCenter(txt, length) {
    var midlength = (length + txt.length) / 2; 
    return padEnd(padStart(txt, midlength), length);
}

}());