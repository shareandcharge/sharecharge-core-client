import { log } from 'util';
import { Evse, ShareCharge, ToolKit } from "@motionwerk/sharecharge-lib";
import LogicBase from '../logicBase';

export default class CdrLogic extends LogicBase {

    constructor(){
        super();
    }

    public getInfo = async (argv) => {
        if (!argv.json) {
            this.client.logger.info("Displaying Charge Detail Record: ");
            const cdrInfo = await this.getCDRInfo(argv);            
            console.log(cdrInfo);
        }
    }

    async getCDRInfo(argv): Promise<any> {
        const logDetails = await this.client.sc.charging.contract.getLogs('ChargeDetailRecord');
        console.log(logDetails[0]);
        let allLogs = logDetails.map(obj => (
            {
                transactionHash: obj.transactionHash,
                address: obj.address,
                controller: obj.returnValues.controller,
                tokenAddress: obj.returnValues.tokenAddress,
                date: new Date(obj.timestamp * 1000).toUTCString(),
                timestamp: obj.timestamp
                
            }

        ));

        // filtering 
        if(argv.transactionHash){ 
            allLogs = allLogs.filter( key => (    
                key.transactionHash === argv.transactionHash
            ));
            console.log(" Filtered by transactionHash: ");
        } 
        
        if(argv.address) {
            allLogs = allLogs.filter( key => (
                key.address === argv.address
            ));
            console.log(" Filtered by address: ");
        } 
        
        if(argv.controller) {
            allLogs = allLogs.filter( key => (
                key.controller === argv.controller
            ));
            console.log(" Filtered by controller: ");
        }

        if(argv.evseId) {
            allLogs = allLogs.filter( key => (
                key.evseId === argv.evseId
            ));
            console.log(" Filtered by evseId: ");
        }

        if(argv.tokenAddress) {
            allLogs = allLogs.filter( key => (
                key.tokenAddress === argv.tokenAddress
            ));
            console.log(" Filtered by evseId: ");
        }

        if(argv.timestamp) {
            allLogs = allLogs.filter( key => (
                key.timestamp === argv.timestamp
            ));
            console.log(" Filtered by evseId: ");
        }

        if(argv.date) {
            let date = new Date(argv.date).getTime() / 1000;
            allLogs = allLogs.filter( key => (
                key.timestamp >= date
            ));
        }
        return allLogs;
    }
}
