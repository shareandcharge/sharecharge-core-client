import { ShareCharge, Wallet } from "@motionwerk/sharecharge-lib";
import { IConfig, IBridge, IResult, ISession, IStopParameters, ICDR } from "@motionwerk/sharecharge-common";
import "reflect-metadata";
import { Container, injectable, inject } from "inversify";
import { Symbols } from "./symbols"
import ConfigProvider from "./services/configProvider";
import ShareChargeProvider from "./services/shareChargeProvider";
import BridgeProvider from "./services/bridgeProvider";
import WalletProvider from "./services/walletProvider";

@injectable()
export class CoreClient {

    private static container: Container;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider,
                @inject(Symbols.BridgeProvider) private bridgeProvider: BridgeProvider,
                @inject(Symbols.ShareChargeProvider) private shareChargeProvider: ShareChargeProvider,
                @inject(Symbols.WalletProvider) private walletProvider: WalletProvider) {
    }

    get sc(): ShareCharge {
        return this.shareChargeProvider.obtain(this.configProvider);
    }

    get bridge(): IBridge {
        return this.bridgeProvider.obtain();
    }
    
    get wallet(): Wallet {
        return this.walletProvider.obtain();
    }

    get config(): IConfig {
        return this.configProvider;
    }

    async getIds(): Promise<string[]> {
        return this.sc.store.getIdsByCPO(this.wallet.coinbase);
    }

    private startListening() {

        /*
            LISTEN TO REMOTE START REQUESTS FROM BLOCKCHAIN AND TELL BRIDGE
        */
        this.sc.on("StartRequested", async (startRequestedEvent) => {

            console.log(`Start requested on ${startRequestedEvent.evseId}`);

            const scIds = await this.getIds();

            if (scIds.includes(startRequestedEvent.scId)) {
                try {
                    console.log('Attempting to start');

                    // start the bridge side
                    const startResult: IResult = await this.bridge.start(<ISession>{
                        scId: startRequestedEvent.scId,
                        evseId: startRequestedEvent.evseId,
                        tariffId: startRequestedEvent.tariffId,
                        tariffValue: startRequestedEvent.tariffValue
                    });

                    // started in cpos backend
                    if (startResult.success) {
                        // register start in ev-network
                        await this.sc.charging.useWallet(this.wallet)
                            .confirmStart(startRequestedEvent.scId, startRequestedEvent.evseId, startResult.data.sessionId);

                        console.log(`Confirmed ${startRequestedEvent.evseId} start`);
                    }

                } catch (err) {
                    console.error(`Error starting ${startRequestedEvent.evseId}: ${err.message}`);

                    // invoke error
                    await this.sc.charging.useWallet(this.wallet)
                        .error(startRequestedEvent.scId, startRequestedEvent.evseId, 0);
                }
            }

        });


        /*
            LISTEN TO REMOTE STOP REQUESTS FROM BLOCKCHAIN AND TELL BRIDGE
        */
        this.sc.on("StopRequested", async (stopRequestedEvent) => {

            console.log(`Stop requested for evse with uid: ${stopRequestedEvent.scId}`);

            const scIds = await this.getIds();

            if (scIds.includes(stopRequestedEvent.scId)) {
                try {
                    // stop the bride side
                    const stopResult: IResult = await this.bridge.stop(<IStopParameters>{
                        scId: stopRequestedEvent.scId,
                        evseId: stopRequestedEvent.evseId,
                        sessionId: stopRequestedEvent.sessionId
                    });

                    // stopped in the cpos backend
                    if (stopResult.success) {
                        // confirm stop in ev-network
                        await this.sc.charging.useWallet(this.wallet)
                            .confirmStop(stopRequestedEvent.scId, stopRequestedEvent.evseId);

                        console.log(`Confirmed ${stopRequestedEvent.evseId} stop`);

                        // settle in ev network if bridge has already created CDR
                        if (stopResult.data.cdr.price) {
                            const cdr = stopResult.data.cdr;

                            await this.sc.charging.useWallet(this.wallet)
                                .chargeDetailRecord(stopRequestedEvent.scId, stopRequestedEvent.evseId, cdr.chargedUnits, cdr.price);
        
                            console.log(`Wrote ${stopRequestedEvent.evseId}'s CDR to the network`);
                        } else {
                            console.log(`Awaiting charge detail record for ${stopRequestedEvent.evseId}...`);
                        }
                    }

                } catch (err) {
                    console.error(`Error stopping ${stopRequestedEvent.evseId}: ${err.message}`);
                    await this.sc.charging.useWallet(this.wallet).error(stopRequestedEvent.scId, stopRequestedEvent.evseId, 1);
                }
            }
        });

        /*
            LISTEN TO AUTOSTOP EVENTS FROM BRIDGE AND TELL BLOCKCHAIN
        */
        this.bridge.autoStop$.subscribe(async (autoStopEvent: IResult) => {
            const session = autoStopEvent.data.session;
            try {
                await this.sc.charging.useWallet(this.wallet)
                    .confirmStop(session.scId, session.evseId);
                console.log(`Confirmed ${session.evseId} autostop`);

                if (autoStopEvent.data.cdr.price) {
                    const cdr = autoStopEvent.data.cdr;
                    await this.sc.charging.useWallet(this.wallet)
                        .chargeDetailRecord(session.scId, session.evseId, cdr.chargedUnits, cdr.price);
                    console.log(`Wrote ${session.evseId}'s CDR to the network`);
                } else {
                    console.log(`Awaiting charge detail record for ${session.evseId}...`);
                }

            } catch (err) {
                console.error(`Error confirming ${session.evseId} autostop: ${err.message}`);
                await this.sc.charging.useWallet(this.wallet).error(session.scId, session.evseId, 2);
            }
        });

        /*
            LISTEN TO OPTIONAL, ASYNCHRONOUS CHARGE DETAIL RECORD EVENTS FROM BRIDGE AND TELL BLOCKCHAIN
        */
        this.bridge.cdr$ && this.bridge.cdr$.subscribe(async (cdr: ICDR) => {
            try {
                console.log(`Received charge detail record for ${cdr.evseId}`);
                await this.sc.charging.useWallet(this.wallet).chargeDetailRecord(cdr.scId, cdr.evseId, cdr.chargedUnits, cdr.price);
                console.log(`Wrote ${cdr.evseId}'s CDR to the network`);
            } catch (err) {
                console.error(`Error confirming ${cdr.evseId} CDR: ${err.message}`);                
            }
        });

        /*
            ACTUALLY TELL THE LIBRARY TO START LISTENING FOR EVENTS
        */
        this.sc.startListening();
    }

    public main() {
        
        this.getIds().then(async ids => {
            this.startListening();
            console.log(`Coinbase: ${this.wallet.coinbase}`);
            console.log(`Connected to bridge: ${this.bridge.name}`);
            
            if (ids.length) {
                console.log(`Listening for events on ${ids.length} locations (head: ${ids[0]})`);
            } else {
                console.log('No locations owned by this wallet!');
                process.exit();
            }

            const tariffs = await this.sc.store.getAllTariffsByCPO(this.wallet.coinbase);
            if (Object.keys(tariffs).length) {
                this.bridge.loadTariffs(tariffs);
            } else {
                console.log('No tariffs provided by this wallet!');
                process.exit();
            }
            
        });

    }

    static getInstance(): CoreClient {

        if (!CoreClient.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<ShareChargeProvider>(Symbols.ShareChargeProvider).to(ShareChargeProvider).inSingletonScope();
            container.bind<BridgeProvider>(Symbols.BridgeProvider).to(BridgeProvider).inSingletonScope();
            container.bind<WalletProvider>(Symbols.WalletProvider).to(WalletProvider).inSingletonScope();
            CoreClient.container = container;
        }

        return CoreClient.container.resolve(CoreClient);
    }

    static rebind(symb, obj) {

        if (!CoreClient.container) {
            CoreClient.getInstance();
        }

        CoreClient.container.rebind(symb).to(obj).inSingletonScope();
    }
}