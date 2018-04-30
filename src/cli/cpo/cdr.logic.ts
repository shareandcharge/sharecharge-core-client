import { Evse, ShareCharge, ToolKit } from "@motionwerk/sharecharge-lib";
import LogicBase from '../logicBase';

export default class CdrLogic extends LogicBase {

    constructor(){
        super();
    }

    public getInfo = async (argv) => {
        if (!argv.json) {
            this.client.logger.info("Displaying Charge Detail Record: ");
            const cdrInfo = await this.getCDRInfo();            
            console.log(cdrInfo);
        }
    }

    async getCDRInfo(): Promise<any> {
        const logDetails = await this.client.sc.charging.contract.getLogs('ChargeDetailRecord');
        
        const cdrInfo = {
            txHash: logDetails[0].transactionHash,
            address: logDetails[0].address,
            evseId: logDetails[0].returnValues.evseId,
            controller: logDetails[0].returnValues.controller,
            tokenAddress: logDetails[0].returnValues.tokenAddress
        }
        return cdrInfo;
    }
}