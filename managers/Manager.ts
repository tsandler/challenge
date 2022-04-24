import {Table} from "dynamo-types"

export abstract class Manager{

    public cleanTable = async (): Promise<void> => {
        const result = await this.scanTable()
        for (const record of result.records) {
            await record.delete()
        }
    }

    public abstract scanTable(): Promise<{records: Table[]}>
}