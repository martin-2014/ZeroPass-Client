import { cryptoComparePrice } from './cryptoComparePrice';
import { coinGeckoPrice } from './coinGeckoPrice';

const ccPrice = cryptoComparePrice();
const geckoPrice = coinGeckoPrice();

export { ccPrice, geckoPrice };
