import * as mqtt from 'mqtt/dist/mqtt.min.js';
var MQTT = /** @class */ (function () {
    function MQTT(url, options, topics, cb) {
        this.url = url;
        this.options = options;
        this.topics = topics;
        this.cb = cb;
        this.fns = {};
        this.init();
    }
    MQTT.prototype.init = function () {
        this.client = mqtt.connect(this.url, this.options);
        this.client.on('message', this.cb);
        if (this.topics) {
            this.client.subscribe(this.topics.split(','));
        }
    };
    MQTT.prototype.publish = function (topic, message) {
        this.client.publish(topic, message);
    };
    MQTT.prototype.close = function () {
        this.client.end();
    };
    return MQTT;
}());
export { MQTT };
//# sourceMappingURL=mqtt.js.map