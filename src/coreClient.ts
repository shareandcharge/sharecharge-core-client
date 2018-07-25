import SubscriptionService from "./services/subscriptionService";
import FileSystemService from "./services/fileSystemService";
import CoreService from "./services/coreService";
import ConfigProvider from "./providers/configProvider";
import BridgeProvider from "./providers/bridgeProvider";
import ShareChargeProvider from "./providers/shareChargeProvider";
import WalletProvider from "./providers/walletProvider";

export class CoreClient {

    constructor(private coreService: CoreService,
                private subscriptionService: SubscriptionService) {
    }

    public main() {
        this.coreService.getIds().then(async ids => {
            console.log(`Coinbase: ${this.coreService.wallet.coinbase}`);
            console.log(`Connected to bridge: ${this.coreService.bridge.name}`);
            // Check wallet owns locations on network
            if (ids.length) {
                console.log(`Listening for events on ${ids.length} locations (head: ${ids[0]})`);
            } else {
                console.log('No locations owned by this wallet!');
                process.exit();
            }
            // Check wallet has provided tariffs on network
            const tariffs = await this.coreService.sc.store.getAllTariffsByCPO(this.coreService.wallet.coinbase);
            if (Object.keys(tariffs).length) {
                this.coreService.bridge.loadTariffs(tariffs); 
            } else {
                console.log('No tariffs provided by this wallet!');
                process.exit();
            }
            this.subscriptionService.startSubscriptions();
        });
    }

    private static instance: CoreClient;

    static getInstance(): CoreClient {
        if (!CoreClient.instance) {
            const configProvider = new ConfigProvider();
            const bridgeProvider = new BridgeProvider(configProvider);
            const scProvider = new ShareChargeProvider();
            const walletProvider = new WalletProvider(configProvider);
            const coreService = new CoreService(configProvider, bridgeProvider, scProvider, walletProvider);
            const fsService = new FileSystemService();
            const subService = new SubscriptionService(coreService, fsService);
            CoreClient.instance = new CoreClient(coreService, subService);   
        }
        return CoreClient.instance;
    }

}