import {Decorator, Query, Table} from "dynamo-types"

@Decorator.Table({ name: "Organizations" })
export class Organization extends Table{

    @Decorator.Attribute({name: "Id"})
    private _id: string

    @Decorator.Attribute({name: "Code"})
    private _code: string

    @Decorator.HashPrimaryKey("Id")
    static readonly primaryKey: Query.HashPrimaryKey<Organization, string>

    get id(): string {
        return this._id
    }

    set id(value: string) {
        this._id = value
    }

    get code(): string {
        return this._code
    }

    set code(value: string) {
        this._code = value
    }
}