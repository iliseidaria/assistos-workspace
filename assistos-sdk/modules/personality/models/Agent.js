class Agent {
    constructor(agentData) {
        this.agentData = agentData;
        this.flows = {};
        assistOS.space.flows.forEach(flow => {
                this.flows[flow.constructor.name] = {
                    flowDescription: flow.constructor.flowMetadata.intent+" - "+flow.constructor.flowMetadata.action,
                    flowParametersSchema: flow.constructor.flowParametersSchema
                }
        });
    }
}

module.exports = Agent;
