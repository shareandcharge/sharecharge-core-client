import { Evse, ToolKit } from "@motionwerk/sharecharge-lib";
import LogicBase from "../logicBase"

export default class ChargingLogic extends LogicBase {

    public sessions = async (argv) => {

        const results: any[] = [];

        if (!argv.json) {
            this.client.logger.info("Getting all sessions on all evses");
        }

        const evseUids = Object.keys(this.client.evses);

        for (let evseUid of evseUids) {

            const evse: Evse = await this.client.sc.evses.getByUid(evseUid);

            if (!evse.owner.startsWith("0x00")) {

                const session = await this.client.sc.evses.getSession(evse);

                if (!session.controller.startsWith("0x00")) {
                    results.push({
                        evse: evse.uid,
                        controller: session.controller
                    });
                }
            }
        }

        if (!argv.json) {

            if (results.length === 0) {
                this.client.logger.info("No sessions running")
            }

            for (const result of results) {
                this.client.logger.info(result.evse, result.controller)
            }

        } else {
            console.log(JSON.stringify(results, null, 2))
        }

        return results;
    };
}
