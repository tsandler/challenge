import {Organization} from "../models/Organization"
import {Manager} from "./Manager"

export class OrganizationManager extends Manager{
    public getOrganizationById = (organizationId: string): Promise<Organization | null> => {
        return Organization.primaryKey.get(organizationId)
    }

    public scanTable = (): Promise<{records: Organization[]}> => Organization.primaryKey.scan()
}