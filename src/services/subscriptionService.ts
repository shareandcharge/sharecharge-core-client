import { IResult, ISession, IStopParameters, ICDR } from "@shareandcharge/sharecharge-common";
import CoreService from "./coreService";

export default class SubscriptionService {

    constructor(private coreService: CoreService) {
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
    private async settle(cdr: ICDR): Promise<void> {
        const scId = cdr.scId;
        const evseId = cdr.evseId;
        // Attempt to complete settlement on network
        try {
            const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).chargeDetailRecord();
            tx.scId = scId;
            tx.evse = evseId;
            tx.chargedUnits = cdr.chargedUnits;
            tx.finalPrice = cdr.price;
            await tx.send();
            console.log(`Confirmed ${evseId} CDR on network`);
        } catch (err) {
            console.error(`Error confirming ${evseId} CDR on network: ${err.message}`);
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
                    connectorId: startRequestedEvent.connectorId,
                    controller: startRequestedEvent.controller,
                    tariffType: startRequestedEvent.tariffType,
                    chargeUnits: startRequestedEvent.chargeUnits,
                    estimatedPrice: startRequestedEvent.estimatedPrice
                });
                // Handle remote start session success (confirm start or error on network)
                if (startResult.success) {
                    console.log(`Started ${evseId} session ${startResult.data.sessionId} via bridge`);
                    const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).confirmStart();
                    tx.scId = scId;
                    tx.evse = evseId;
                    tx.sessionId = startResult.data.sessionId;
                    await tx.send();
                    console.log(`Confirmed ${evseId} start success on network`);
                } else {
                    throw Error(startResult.data.message);
                }
            } catch (err) {
                console.error(`Error starting ${evseId} via bridge: ${err.message}`);
                const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).logError();
                tx.scId = scId;
                tx.evse = evseId;
                tx.code = 0;
                await tx.send();
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
                    const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).confirmStop();
                    tx.scId = scId;
                    tx.evse = evseId;
                    await tx.send();
                    console.log(`Confirmed ${evseId} stop on network`);
                    // Settle session on network if bridge has already created CDR
                    if (stopResult.data.cdr) {
                        const cdr = stopResult.data.cdr;
                        console.log(`Received ${evseId} CDR from bridge: ${JSON.stringify(cdr, null, 2)}`);
                        await this.settle(cdr);
                    } else {
                        console.log(`Awaiting ${evseId} CDR from bridge...`);
                    }
                } else {
                    console.log(stopResult.data.message);
                }
            } catch (err) {
                console.error(`Error stopping ${evseId}: ${err.message}`);
                const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).logError();
                tx.scId = scId;
                tx.evse = evseId;
                tx.code = 1;
                await tx.send();
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
            const sessionId = autoStopEvent.data.session.sessionId || autoStopEvent.data.sessionId;
            const session = autoStopEvent.data.session;
            console.log(`Received ${evseId} session ${sessionId} autostop from bridge`);
            try {
                const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).confirmStop();
                tx.scId = scId;
                tx.evse = evseId;
                await tx.send();
                console.log(`Confirmed ${session.evseId} autostop`);
                // Settle session on network if bridge has already created CDR
                console.log('autoStopEvent', autoStopEvent)
                if (autoStopEvent.data.cdr) {
                    const cdr = autoStopEvent.data.cdr;
                    console.log(`Received ${evseId} CDR from bridge: ${JSON.stringify(cdr, null, 2)}`);
                    await this.settle(cdr);
                } else {
                    console.log(`Awaiting ${session.evseId} CDR from bridge...`);
                }
            } catch (err) {
                console.error(`Error confirming ${session.evseId} autostop: ${err.message}`);
                const tx = this.coreService.sc.charging.useWallet(this.coreService.wallet).logError();
                tx.scId = scId;
                tx.evse = evseId;
                tx.code = 2;
                await tx.send();
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
            this.settle(cdr);
        });   
    }

    private locationsHandler() {
        this.coreService.sc.on('LocationAdded', (locationEvent) => {
            if (this.isMyEvent(locationEvent)) {
                console.log('New location added by wallet:', locationEvent.scId);
            }
        });
        this.coreService.sc.on('LocationUpdated', (locationEvent) => {
            if (this.isMyEvent(locationEvent)) {
                console.log('Location updated by wallet:', locationEvent.scId);
            }
        });
        this.coreService.sc.on('LocationDeleted', (locationEvent) => {
            if (this.isMyEvent(locationEvent)) {
                console.log('Location deleted by wallet:', locationEvent.scId);
            }
        });
    }

    private tariffsHandler() {
        this.coreService.sc.on('TariffsAdded', async (tariffsEvent) => {
            if (this.isMyEvent(tariffsEvent)) {
                console.log('Tariffs added by wallet');
                const tariffs = await this.coreService.sc.store.getAllTariffsByCPO(this.coreService.wallet.coinbase);
                this.coreService.bridge.loadTariffs(tariffs)
            }
        });
        this.coreService.sc.on('TariffsUpdated', async (tariffsEvent) => {
            if (this.isMyEvent(tariffsEvent)) {
                console.log('Tariffs updated by wallet');
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