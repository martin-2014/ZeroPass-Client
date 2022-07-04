import { walletStore } from './store';
import { TokenInfoEntity, CcPriceInfoEntity, CoinGeckoTokenInfoEntity } from './definition';

const walletCache = await walletStore();

export { walletCache, TokenInfoEntity, CcPriceInfoEntity, CoinGeckoTokenInfoEntity };
