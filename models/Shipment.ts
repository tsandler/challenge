import {Decorator, Query, Table} from "dynamo-types"
import * as units from "./Unit"
import {Unit} from "./Unit"

@Decorator.Table({ name: "Shipments" })
export class Shipment extends Table{

    @Decorator.Attribute({name: "ReferenceId"})
    private _referenceId: string

    @Decorator.Attribute({name: "Organizations"})
    private _organizations: string[]

    @Decorator.Attribute({name: "EstimatedTimeArrival"})
    private _estimatedTimeArrival: string

    @Decorator.Attribute({name: "TransportPacks"})
    private _transportPacks: object

    @Decorator.HashPrimaryKey("ReferenceId")
    static readonly primaryKey: Query.HashPrimaryKey<Shipment, string>

    get referenceId(): string {
        return this._referenceId
    }

    set referenceId(value: string) {
        this._referenceId = value
    }

    get organizations(): string[] {
        return this._organizations
    }

    set organizations(value: string[]) {
        this._organizations = value
    }

    get estimatedTimeArrival(): string {
        return this._estimatedTimeArrival
    }

    set estimatedTimeArrival(value: string) {
        this._estimatedTimeArrival = value
    }

    get transportPacks(): TransportPack {
        return Object.assign(new TransportPack(), this._transportPacks)
    }

    set transportPacks(value: TransportPack) {
        this._transportPacks = value
    }

    public normalize(){
        this.transportPacks = this.transportPacks.normalize()
    }

    public getTotalWeight(units: string): number{
        return this.transportPacks.nodes?.reduce((total: number, node: Node) => node.getTotalWeight(units) + total, 0)
    }
}

export class TransportPack{
    private _nodes: Node[]

    get nodes(): any {
        return this._nodes?.map((node: Node) => Object.assign(new Node(), node))
    }

    set nodes(value: any) {
        this._nodes = value
    }

    public normalize(): TransportPack{
        this.nodes = this.nodes?.map((node: Node) => node.normalizeUnits())
        return this
    }
}

export class Node{
    private _totalWeight: TotalWeight

    get totalWeight(): TotalWeight {
        return Object.assign(new TotalWeight(), this._totalWeight)
    }

    set totalWeight(value: TotalWeight) {
        this._totalWeight = value
    }

    public normalizeUnits(): Node{
        const units = "KILOGRAMS"

        const totalWeight = new TotalWeight()
        totalWeight.unit = units
        totalWeight.weight = this.totalWeight.convert(units)

        this.totalWeight = totalWeight
        return this
    }

    public getTotalWeight(units: string){
        return this.totalWeight.convert(units)
    }
}

export class TotalWeight{
    private _weight: number
    private _unit: string

    get weight(): number {
        return this._weight
    }

    set weight(value: number) {
        this._weight = value
    }

    get unit(): string {
        return this._unit
    }

    set unit(value: string) {
        this._unit = value
    }

    public convert(units: string): number{
        return this.getUnit().convert(this.weight, units)
    }

    private getUnit(): Unit{
        const className = this.unit.charAt(0).toUpperCase() + this.unit.slice(1).toLowerCase()
        return new (<any>units)[className]
    }
}