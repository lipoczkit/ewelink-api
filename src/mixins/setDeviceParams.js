const { _get, timestamp, nonce } = require('../helpers/utilities');
const errors = require('../data/errors');

const ChangeStateZeroconf = require('../classes/ChangeStateZeroconf');

module.exports = {
  /**
   * Change params for a specific device
   *
   * @param deviceId
   * @param params
   *
   * @returns {Promise<{state: *, status: string}|{msg: string, error: *}>}
   */
  async setDeviceParams(deviceId, params) {
    const device = await this.getDevice(deviceId);
    const error = _get(device, 'error', false);
    // const uiid = _get(device, 'extra.extra.uiid', false);

    let status = _get(device, 'params.switch', false);
    const switches = _get(device, 'params.switches', false);

    if (error || (!status && !switches)) {
      return { error, msg: errors[error] };
    }

    if (this.devicesCache) {
      return ChangeStateZeroconf.set({
        url: this.getZeroconfUrl(device),
        device,
        params,
        switches
      });
    }

    const { APP_ID } = this;

    const response = await this.makeRequest({
      method: 'post',
      uri: '/user/device/status',
      body: {
        deviceid: deviceId,
        params,
        appid: APP_ID,
        nonce,
        ts: timestamp,
        version: 8,
      },
    });

    const responseError = _get(response, 'error', false);

    if (responseError) {
      return { error: responseError, msg: errors[responseError] };
    }

    return { status: 'ok', state: status, channel: 1 };
  },
};
