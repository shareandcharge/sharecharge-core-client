import { IResult, ISession, IStopParameters, ICDR } from "@motionwerk/sharecharge-common";
import CoreService from "./coreService";
import FileSystemService from "./fileSystemService";

export default class SubscriptionService {

    constructor(private coreService: CoreService,
        private fsService: FileSystemService) {
        /*
            ACTUALLY TELL THE LIBRARY TO START LISTENING FOR EVENTS
        */
        this.coreService.sc.startListening();
    }

    /*
        ONLY HANDLE EVENTS CONCERNING THE WALLET'S LOCATIONS
    */
    private async isOwnedByMe(eventParameters: any): Promise<boolean> {
        const owner = await this.coreService.sc.store.getOwnerOfLocation(eventParameters.scId);
        return owner.toLowerCase() === this.coreService.wallet.coinbase;
    }

    /*
        ONLY HANDLE EVENTS CONCERNING WALLET
    */
    private isMyEvent(eventParameters: any): boolean {
        return eventParameters.cpo.toLowerCase() === this.coreService.wallet.coinbase;
    }

    /*
        COMPLETE FINAL SETTLEMENT ON NETWORK AND PERSIST DETAILS TO FILE SYSTEM
    */
    private async settle(sessionId: string, cdr: ICDR): Promise<void> {
        const scId = cdr.scId;
        const evseId = cdr.evseId;
        let settled: boolean;
        // Attempt to complete settlement on network
        try {
            await this.coreService.sc.charging.useWallet(this.coreService.wallet).chargeDetailRecord(scId, evseId, cdr.chargedUnits, cdr.price);
            console.log(`Confirmed ${evseId} CDR on network`);
            settled = true;
        } catch (err) {
            console.error(`Error confirming ${evseId} CDR on network: ${err.message}`);
            settled = false;
        }
        // Write complete or pending CDR to file system
        try {
            await this.fsService.writeChargeDetailRecord(sessionId, cdr, settled);
            console.log(`Wrote ${evseId} CDR to file system`);
        } catch (err) {
            console.error(`Error writing ${evseId} CDR to file system: ${err.message}`);
        }
    }

    /*
        LISTEN TO REMOTE START REQUESTS FROM BLOCKCHAIN AND TELL BRIDGE
    */
    private remoteStartHandler(): void {
        this.coreService.sc.on("StartRequested", async (startRequestedEvent) => {
            const owned = await this.isOwnedByMe(startRequestedEvent);
            if (!owned) {
                return;
            }
            const scId = startRequestedEvent.scId;
            const evseId = startRequestedEvent.evseId;
            try {
                console.log(`Calling bridge to start session on ${evseId}`);
                // Request bridge to start the remote session
                const startResult: IResult = await this.coreService.bridge.start(<ISession>{
                    scId,
                    evseId,
                    controller: startRequestedEvent.controller,
                    tariffId: startRequestedEvent.tariffId,
                    tariffValue: startRequestedEvent.tariffValue
                });
                // Handle remote start session success (confirm start or error on network)
                if (startResult.success) {
                    console.log(`Started ${evseId} session ${startResult.data.sessionId} via bridge`);
                    await this.coreService.sc.charging.useWallet(this.coreService.wallet).confirmStart(scId, evseId, startResult.data.sessionId);
                    console.log(`Confirmed ${evseId} start success on network`);
                } else {
                    throw Error(startResult.data.message);
                }
            } catch (err) {
                console.error(`Error starting ${evseId} via bridge: ${err.message}`);
                await this.coreService.sc.charging.useWallet(this.coreService.wallet).error(scId, evseId, 0);
                console.log(`Confirmed ${evseId} start error on network`);
            }
        });
    }

    /*
        LISTEN TO REMOTE STOP REQUESTS FROM BLOCKCHAIN AND TELL BRIDGE
    */
    private remoteStopHandler(): void {
        this.coreService.sc.on("StopRequested", async (stopRequestedEvent) => {
            const owned = await this.isOwnedByMe(stopRequestedEvent);
            if (!owned) {
                return;
            }
            const scId = stopRequestedEvent.scId;
            const evseId = stopRequestedEvent.evseId;
            const sessionId = stopRequestedEvent.sessionId;
            try {
                console.log(`Calling bridge to stop session on ${evseId}`);
                // Request bridge to stop the remote session
                const stopResult: IResult = await this.coreService.bridge.stop(<IStopParameters>{
                    scId,
                    evseId,
                    controller: stopRequestedEvent.controller,
                    sessionId
                });
                // Handle remote stop session success (confirm start or error on network)
                if (stopResult.success) {
                    console.log(`Stopped ${evseId} session ${sessionId} via bridge`);
                    await this.coreService.sc.charging.useWallet(this.coreService.wallet).confirmStop(scId, evseId);
                    console.log(`Confirmed ${evseId} stop on network`);
                    // Settle session on network if bridge has already created CDR
                    if (stopResult.data.cdr) {
                        const cdr = stopResult.data.cdr;
                        console.log(`Received ${evseId} CDR from bridge: ${JSON.stringify(cdr, null, 2)}`);
                        await this.settle(sessionId, cdr);
                    } else {
                        console.log(`Awaiting ${evseId} CDR from bridge...`);
                    }
                } else {
                    throw Error(stopResult.data.message);
                }
            } catch (err) {
                console.error(`Error stopping ${evseId}: ${err.message}`);
                await this.coreService.sc.charging.useWallet(this.coreService.wallet).error(scId, evseId, 1);
                console.log(`Confirmed ${evseId} stop error on network`);
            }
        });
    }

    /*
        LISTEN TO AUTOSTOP EVENTS FROM BRIDGE AND TELL BLOCKCHAIN
    */
    private bridgeAutoStopHandler() {
        this.coreService.bridge.autoStop$.subscribe(async (autoStopEvent: IResult) => {
            const scId = autoStopEvent.data.session.scId;
            const evseId = autoStopEvent.data.session.evseId;
            const sessionId = autoStopEvent.data.session.sessionId;
            const session = autoStopEvent.data.session;
            console.log(`Received ${evseId} session ${sessionId} autostop from bridge`);
            try {
                await this.coreService.sc.charging.useWallet(this.coreService.wallet).confirmStop(scId, evseId);
                console.log(`Confirmed ${session.evseId} autostop`);
                // Settle session on network if bridge has already created CDR
                if (autoStopEvent.data.cdr.price) {
                    const cdr = autoStopEvent.data.cdr;
                    console.log(`Received ${evseId} CDR from bridge: ${JSON.stringify(cdr, null, 2)}`);
                    await this.settle(sessionId, cdr);
                } else {
                    console.log(`Awaiting ${session.evseId} CDR from bridge...`);
                }
            } catch (err) {
                console.error(`Error confirming ${session.evseId} autostop: ${err.message}`);
                await this.coreService.sc.charging.useWallet(this.coreService.wallet).error(session.scId, session.evseId, 2);
                console.log(`Confirmed ${evseId} autostop error on network`);
            }
        });
    }

    /*
        LISTEN TO OPTIONAL, ASYNCHRONOUS CHARGE DETAIL RECORD EVENTS FROM BRIDGE AND TELL BLOCKCHAIN
    */
    private bridgeChargeDetailRecordHandler(): void {
        this.coreService.bridge.cdr$.subscribe(async (cdr: ICDR) => {
            const scId = cdr.scId;
            const evseId = cdr.evseId;
            const session = await this.coreService.sc.charging.getSession(scId, evseId);
            const sessionId = session.id;
            this.settle(sessionId, cdr);
        });   
    }

    private locationsHandler() {
        this.coreService.sc.on('LocationAdded', (locationEvent) => {
            if (this.isMyEvent(locationEvent)) {
                console.log('New location added:', locationEvent.scId);
            }
        });
        this.coreService.sc.on('LocationUpdated', (locationEvent) => {
            if (this.isMyEvent(locationEvent)) {
                console.log('Location updated:', locationEvent.scId);
            }
        });
        this.coreService.sc.on('LocationDeleted', (locationEvent) => {
            if (this.isMyEvent(locationEvent)) {
                console.log('Location deleted:', locationEvent.scId);
            }
        });
    }

    private tariffsHandler() {
        this.coreService.sc.on('TariffsAdded', async (tariffsEvent) => {
            if (this.isMyEvent(tariffsEvent)) {
                console.log('Tariffs added');
                const tariffs = await this.coreService.sc.store.getAllTariffsByCPO(this.coreService.wallet.coinbase);
                this.coreService.bridge.loadTariffs(tariffs)
            }
        });
        this.coreService.sc.on('TariffsUpdated', async (tariffsEvent) => {
            if (this.isMyEvent(tariffsEvent)) {
                console.log('Tariffs updated');
                const tariffs = await this.coreService.sc.store.getAllTariffsByCPO(this.coreService.wallet.coinbase);
                this.coreService.bridge.loadTariffs(tariffs);
            }
        });
    }

    public startSubscriptions() {
        this.locationsHandler();
        this.tariffsHandler();
        this.remoteStartHandler();
        this.remoteStopHandler();
        this.bridgeAutoStopHandler();
        // CDR Observable is optional
        this.coreService.bridge.cdr$ && this.bridgeChargeDetailRecordHandler();
    }

}