import {Shipment} from "../models/Shipment"
import {Manager} from "./Manager"

export class ShipmentManager extends Manager{
    public getShipmentByReferenceId = (referenceId: string): Promise<Shipment | null> => {
        return Shipment.primaryKey.get(referenceId)
    }

    public scanTable = (): Promise<{records: Shipment[]}> => Shipment.primaryKey.scan()
}